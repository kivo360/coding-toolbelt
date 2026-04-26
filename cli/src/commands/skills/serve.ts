/**
 * Embedding daemon — `toolbelt skills serve`
 *
 * Long-running localhost server that keeps the embedding model in
 * memory so prompt-time embeddings cost ~30 ms instead of ~5 s
 * (cold model load + ONNX init).
 *
 * Endpoints (POST JSON):
 *   /health         → { ok, model, dim, uptimeMs }
 *   /embed          { text: string } → { vector: number[] }
 *   /embed-batch    { texts: string[] } → { vectors: number[][] }
 *   /match          { prompt, deep?: bool, tiers?, limit? } → HybridResult
 *
 * Invariants:
 *   - Binds 127.0.0.1 only (never exposed)
 *   - PID file at ~/.agents/.skill-daemon.pid; refuses to start if alive
 *   - Auto-shuts-down after `--idle` seconds with no requests (default 0 = never)
 *   - Embeddings index reloaded if file mtime changes between requests
 *
 * Hook clients use a fast 50 ms timeout — if the daemon isn't up, the
 * caller silently falls back to keyword-only matching.
 */

import { existsSync } from "node:fs";
import { writeFile, unlink, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { embedQuery, embedTexts, loadEmbeddings, type EmbeddingsIndex } from "../../lib/embeddings";
import { findMatchesHybrid } from "../../lib/hybrid-matcher";
import { readIndex } from "../../lib/index-store";
import type { SkillsIndex } from "../../types";
import { c, print, printErr } from "../../lib/output";

const PID_PATH = join(homedir(), ".agents", ".skill-daemon.pid");
const DEFAULT_PORT = 9988;

export async function runServe(args: string[]): Promise<number> {
  const port = parseFlag(args, "--port", DEFAULT_PORT, parseInt);
  const idleSeconds = parseFlag(args, "--idle", 0, parseInt);
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
  let lastEmbMtime = await safeMtime((await import("../../lib/embeddings")).EMBEDDINGS_PATH);

  if (!skillsIdx) {
    printErr(c.red("No skills index. Run `toolbelt skills reindex` first."));
    return 1;
  }

  // Pre-load model so first request is fast.
  print(c.dim("Pre-loading embedding model…"));
  const t0 = Date.now();
  await embedQuery("warmup");
  print(c.green("✓") + ` model loaded in ${Date.now() - t0}ms`);

  let lastRequestTs = Date.now();
  let requestCount = 0;

  const refreshIfStale = async () => {
    const m = await safeMtime((await import("../../lib/embeddings")).EMBEDDINGS_PATH);
    if (m !== lastEmbMtime) {
      lastEmbMtime = m;
      embIdx = await loadEmbeddings();
    }
    // Skills index is small; reload on every request would be wasteful.
    // We accept up to one reindex of staleness here — clients can call
    // /reload to force a refresh.
  };

  const reload = async () => {
    skillsIdx = await readIndex();
    embIdx = await loadEmbeddings();
    lastEmbMtime = await safeMtime((await import("../../lib/embeddings")).EMBEDDINGS_PATH);
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
          });
          return Response.json(result);
        }

        if (req.method === "POST" && url.pathname === "/reload") {
          await reload();
          return Response.json({ ok: true });
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
  if (idleSeconds > 0) {
    print(c.dim(`  idle: ${idleSeconds}s auto-shutdown enabled`));
    setInterval(() => {
      if (Date.now() - lastRequestTs > idleSeconds * 1000) {
        print(c.dim(`  idle for ${idleSeconds}s — shutting down`));
        cleanup();
      }
    }, 5_000);
  }

  const cleanup = async () => {
    try { await unlink(PID_PATH); } catch {}
    server.stop();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Keep the event loop alive
  return new Promise<number>(() => {});
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
    process.kill(pid, 0); // throws if not alive
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
