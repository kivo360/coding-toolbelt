/**
 * Embedding daemon — `toolbelt skills serve`
 *
 * Long-running localhost server that:
 *   1. Pre-loads the fastembed model so prompt-time embeddings cost
 *      ~30 ms instead of ~5 s (cold model load + ONNX init).
 *   2. Spawns a Chroma vector-store as a child process and syncs the
 *      JSON-cached embeddings into a "skills" collection on startup.
 *      Match queries then go to Chroma's HNSW index instead of looping
 *      cosine over JSON.
 *
 * Endpoints (POST JSON unless stated):
 *   GET  /health        → { ok, model, dim, chroma, uptimeMs }
 *   POST /embed         → { vector }
 *   POST /embed-batch   → { vectors }
 *   POST /match         → HybridResult
 *   POST /reload        → { ok } — re-read JSON, resync Chroma
 *
 * Invariants:
 *   - Binds 127.0.0.1 only
 *   - PID file at ~/.agents/.skill-daemon.pid; refuses to start if alive
 *   - Auto-shuts-down after `--idle` seconds (default 0 = never)
 *   - Chroma child is killed on SIGTERM/SIGINT
 *   - If Chroma fails to start, daemon keeps running with JSON cosine
 *     fallback and reports `chroma: down` in /health
 */

import { existsSync } from "node:fs";
import { writeFile, unlink, stat, readFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { spawn, type Subprocess } from "bun";
import { embedQuery, embedTexts, loadEmbeddings, type EmbeddingsIndex, EMBEDDINGS_PATH } from "../../lib/embeddings";
import { findMatchesHybrid } from "../../lib/hybrid-matcher";
import { readIndex } from "../../lib/index-store";
import { ChromaSkillStore } from "../../lib/chroma-store";
import type { SkillsIndex } from "../../types";
import { c, print, printErr } from "../../lib/output";

const PID_PATH = join(homedir(), ".agents", ".skill-daemon.pid");
const CHROMA_DATA_PATH = join(homedir(), ".agents", "chroma-data");
const CHROMA_LOG_PATH = join(homedir(), ".agents", "chroma-server.log");
const DEFAULT_PORT = 9988;
const DEFAULT_CHROMA_PORT = 8765;

export async function runServe(args: string[]): Promise<number> {
  const port = parseFlag(args, "--port", DEFAULT_PORT, parseInt);
  const chromaPort = parseFlag(args, "--chroma-port", DEFAULT_CHROMA_PORT, parseInt);
  const idleSeconds = parseFlag(args, "--idle", 0, parseInt);
  const noChroma = args.includes("--no-chroma");
  const stop = args.includes("--stop");
  const status = args.includes("--status");

  if (stop) return runStop();
  if (status) return runStatus(port);

  if (await isAlive()) {
    printErr(c.red("Daemon already running. Use `toolbelt skills serve --stop` first."));
    return 1;
  }

  let skillsIdx: SkillsIndex | null = await readIndex();
  let embIdx: EmbeddingsIndex | null = await loadEmbeddings();
  let lastEmbMtime = await safeMtime(EMBEDDINGS_PATH);

  if (!skillsIdx) {
    printErr(c.red("No skills index. Run `toolbelt skills reindex` first."));
    return 1;
  }

  // Pre-load model so first request is fast.
  print(c.dim("Pre-loading embedding model…"));
  const t0 = Date.now();
  await embedQuery("warmup");
  print(c.green("✓") + ` model loaded in ${Date.now() - t0}ms`);

  // ── Chroma child + sync ─────────────────────────────────────────
  // Strategy: if Chroma is already up on the requested port, reuse it
  // (don't spawn a duplicate child). Otherwise start one. We only kill
  // the child on shutdown if we spawned it ourselves.
  let chromaChild: Subprocess | null = null;
  let chromaStore: ChromaSkillStore | null = null;
  if (!noChroma) {
    try {
      const alreadyUp = await ChromaSkillStore.ping({ port: chromaPort });
      if (alreadyUp) {
        print(c.dim(`chroma already running on :${chromaPort} — reusing`));
      } else {
        chromaChild = await startChroma(chromaPort);
      }
      chromaStore = await ChromaSkillStore.connect({ port: chromaPort });
      if (embIdx) {
        const synced = await syncChromaFromJson(chromaStore, embIdx, skillsIdx);
        print(c.green("✓") + ` chroma synced ${synced} vectors → collection "${chromaStore.name}"`);
      } else {
        print(c.yellow("◐ no embeddings JSON to sync into chroma — run `toolbelt skills embed`"));
      }
    } catch (err) {
      printErr(c.yellow("◐ chroma unavailable: ") + (err instanceof Error ? err.message : String(err)));
      print(c.dim("  daemon will fall back to JSON cosine"));
      if (chromaChild) {
        try { chromaChild.kill(); } catch {}
        chromaChild = null;
      }
      chromaStore = null;
    }
  }

  let lastRequestTs = Date.now();
  let requestCount = 0;

  const refreshIfStale = async () => {
    const m = await safeMtime(EMBEDDINGS_PATH);
    if (m !== lastEmbMtime) {
      lastEmbMtime = m;
      embIdx = await loadEmbeddings();
      if (chromaStore && embIdx && skillsIdx) {
        await syncChromaFromJson(chromaStore, embIdx, skillsIdx);
      }
    }
  };

  const reload = async () => {
    skillsIdx = await readIndex();
    embIdx = await loadEmbeddings();
    lastEmbMtime = await safeMtime(EMBEDDINGS_PATH);
    if (chromaStore && embIdx && skillsIdx) {
      await syncChromaFromJson(chromaStore, embIdx, skillsIdx);
    }
  };

  const startedAt = Date.now();

  const server = Bun.serve({
    port,
    hostname: "127.0.0.1",
    async fetch(req) {
      lastRequestTs = Date.now();
      requestCount++;
      const url = new URL(req.url);

      try {
        if (req.method === "GET" && url.pathname === "/health") {
          return Response.json({
            ok: true,
            model: embIdx?.model ?? null,
            dim: embIdx?.dim ?? null,
            skillsLoaded: skillsIdx ? Object.keys(skillsIdx.skills).length : 0,
            embeddingsLoaded: embIdx ? Object.keys(embIdx.skills).length : 0,
            chroma: chromaStore ? "up" : "down",
            chromaPort: chromaStore ? chromaPort : null,
            chromaCount: chromaStore ? await chromaStore.count().catch(() => 0) : 0,
            uptimeMs: Date.now() - startedAt,
            requestCount,
          });
        }

        if (req.method === "POST" && url.pathname === "/embed") {
          const body = (await req.json()) as { text?: string };
          if (typeof body.text !== "string") return Response.json({ error: "text required" }, { status: 400 });
          const v = await embedQuery(body.text);
          return Response.json({ vector: v });
        }

        if (req.method === "POST" && url.pathname === "/embed-batch") {
          const body = (await req.json()) as { texts?: string[] };
          if (!Array.isArray(body.texts)) return Response.json({ error: "texts required" }, { status: 400 });
          const vectors = await embedTexts(body.texts);
          return Response.json({ vectors });
        }

        if (req.method === "POST" && url.pathname === "/match") {
          await refreshIfStale();
          if (!skillsIdx) return Response.json({ error: "no-index" }, { status: 503 });
          const body = (await req.json()) as {
            prompt?: string;
            deep?: boolean;
            tiers?: string[];
            limit?: number;
            minConfidence?: number;
          };
          if (typeof body.prompt !== "string") return Response.json({ error: "prompt required" }, { status: 400 });
          const result = await findMatchesHybrid(skillsIdx, body.prompt, {
            deep: body.deep,
            tiers: body.tiers ? new Set(body.tiers) : undefined,
            limit: body.limit ?? 5,
            minConfidence: body.minConfidence ?? 0.4,
            embeddings: embIdx,
            chromaStore: chromaStore ?? undefined,
          });
          return Response.json(result);
        }

        if (req.method === "POST" && url.pathname === "/reload") {
          await reload();
          return Response.json({ ok: true, chroma: chromaStore ? "up" : "down" });
        }

        return new Response("Not found", { status: 404 });
      } catch (err) {
        return Response.json(
          { error: err instanceof Error ? err.message : String(err) },
          { status: 500 }
        );
      }
    },
  });

  await writeFile(PID_PATH, String(process.pid), "utf8");

  print(c.green("✓") + ` daemon listening on ${c.bold("http://127.0.0.1:" + server.port)}`);
  print(c.dim(`  pid:   ${process.pid}`));
  print(c.dim(`  pidf:  ${PID_PATH}`));
  print(c.dim(`  chroma: ${chromaStore ? `on :${chromaPort} (${await chromaStore.count().catch(() => 0)} vectors)` : "disabled"}`));
  if (idleSeconds > 0) {
    print(c.dim(`  idle: ${idleSeconds}s auto-shutdown enabled`));
    setInterval(() => {
      if (Date.now() - lastRequestTs > idleSeconds * 1000) {
        print(c.dim(`  idle for ${idleSeconds}s — shutting down`));
        void cleanup();
      }
    }, 5_000);
  }

  const cleanup = async () => {
    try { await unlink(PID_PATH); } catch {}
    if (chromaChild) {
      try {
        chromaChild.kill("SIGTERM");
        await Promise.race([
          chromaChild.exited,
          new Promise((r) => setTimeout(r, 800)),
        ]);
        if (chromaChild.exitCode == null) {
          try { chromaChild.kill("SIGKILL"); } catch {}
        }
      } catch {}
      // The chroma node wrapper spawns an embedded rust binary that
      // doesn't always die with the wrapper. Belt-and-suspenders kill
      // any chroma process targeting our data path.
      try {
        Bun.spawnSync(["pkill", "-9", "-f", `chroma.*${CHROMA_DATA_PATH}`]);
      } catch {}
    }
    server.stop();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  return new Promise<number>(() => {});
}

/**
 * Spawn a local Chroma server child process. Looks for the chroma
 * binary at the package-relative node_modules/.bin/chroma path so it
 * works whether toolbelt is run from source or via the bundled wrapper.
 */
async function startChroma(port: number): Promise<Subprocess> {
  await mkdir(dirname(CHROMA_LOG_PATH), { recursive: true });
  await mkdir(CHROMA_DATA_PATH, { recursive: true });

  const candidates = [
    join(import.meta.dir, "..", "..", "..", "node_modules", ".bin", "chroma"),
    join(homedir(), "Coding", "Tooling", "coding-toolbelt", "cli", "node_modules", ".bin", "chroma"),
    "chroma",
  ];
  const binPath = candidates.find((p) => p === "chroma" || existsSync(p)) ?? "chroma";

  const logFile = Bun.file(CHROMA_LOG_PATH).writer();
  void logFile.write(`\n--- chroma started at ${new Date().toISOString()} ---\n`);

  const child = spawn({
    cmd: [binPath, "run", "--path", CHROMA_DATA_PATH, "--port", String(port)],
    stdout: "pipe",
    stderr: "pipe",
  });

  // Drain stdout/stderr to the log file in the background.
  void (async () => {
    const r = child.stdout?.getReader();
    if (!r) return;
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await r.read();
      if (done) break;
      void logFile.write(dec.decode(value));
      void logFile.flush();
    }
  })();
  void (async () => {
    const r = child.stderr?.getReader();
    if (!r) return;
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await r.read();
      if (done) break;
      void logFile.write(dec.decode(value));
      void logFile.flush();
    }
  })();

  // Poll heartbeat for up to 6s.
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await ChromaSkillStore.ping({ port })) return child;
    if (child.exitCode != null) {
      throw new Error(`chroma exited early (code ${child.exitCode}) — see ${CHROMA_LOG_PATH}`);
    }
  }
  try { child.kill(); } catch {}
  throw new Error(`chroma did not become ready on port ${port} within 6s`);
}

/**
 * Push every embedding from the JSON cache into Chroma. Idempotent
 * via upsert; orphan entries (skill removed since last embed) are
 * cleaned up.
 */
async function syncChromaFromJson(
  store: ChromaSkillStore,
  embIdx: EmbeddingsIndex,
  skillsIdx: SkillsIndex
): Promise<number> {
  const items = [];
  for (const [name, sv] of Object.entries(embIdx.skills)) {
    const skill = skillsIdx.skills[name];
    if (!skill) continue;
    items.push({
      name,
      vector: sv.vector,
      metadata: {
        tier: skill.tier,
        description: skill.description.slice(0, 500),
        mtime: sv.mtime,
        source: skill.installedPath
          ? "active"
          : skill.stagingPath
            ? "staging"
            : "cold",
      },
    });
  }
  await store.upsert(items);
  await store.deleteMissing(new Set(Object.keys(embIdx.skills)));
  return items.length;
}

async function runStop(): Promise<number> {
  if (!existsSync(PID_PATH)) {
    print(c.dim("No daemon running."));
    return 0;
  }
  try {
    const pid = parseInt(await readFile(PID_PATH, "utf8"), 10);
    process.kill(pid, "SIGTERM");
    print(c.green("✓") + ` Sent SIGTERM to pid ${pid}`);
    return 0;
  } catch (err) {
    printErr(c.red("Failed to stop: ") + String(err));
    try { await unlink(PID_PATH); } catch {}
    return 1;
  }
}

async function runStatus(port: number): Promise<number> {
  const alive = await isAlive();
  if (!alive) {
    print(c.dim("Daemon: not running"));
    return 0;
  }
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(500),
    });
    const body = (await res.json()) as Record<string, unknown>;
    print(c.green("●") + " daemon alive");
    for (const [k, v] of Object.entries(body)) {
      print(`  ${c.dim(k + ":")} ${v}`);
    }
    return 0;
  } catch {
    print(c.yellow("◐ daemon pid file present but not responding"));
    return 1;
  }
}

async function isAlive(): Promise<boolean> {
  if (!existsSync(PID_PATH)) return false;
  try {
    const pid = parseInt(await readFile(PID_PATH, "utf8"), 10);
    if (!pid) return false;
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function safeMtime(path: string): Promise<number> {
  try {
    const s = await stat(path);
    return s.mtimeMs | 0;
  } catch {
    return 0;
  }
}

function parseFlag<T>(args: string[], flag: string, defaultValue: T, parser: (s: string) => T): T {
  const idx = args.indexOf(flag);
  if (idx === -1 || !args[idx + 1]) return defaultValue;
  const parsed = parser(args[idx + 1]);
  return Number.isFinite(parsed as unknown as number) || typeof parsed !== "number" ? parsed : defaultValue;
}
