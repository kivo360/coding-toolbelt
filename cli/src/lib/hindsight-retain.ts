/**
 * Fire-and-forget Hindsight retain for `toolbelt skills suggest` calls.
 *
 * Implements Phase 1 of the migration plan in
 * docs/highlight-memory-evaluation.md:
 *   - retain every suggest call to the project's bank (kh-::<repo>)
 *   - never block the synchronous suggest path
 *   - default OFF; opt in with HINDSIGHT_SUGGESTER_ENABLED=1
 *
 * Shells out to review-with-memory's hindsight-bridge.py (single source of
 * truth for retain logic) rather than re-implementing the HTTP shape.
 *
 * Design constraints:
 *   - zero added latency on the hot path: spawn is synchronous, child runs
 *     detached, parent continues immediately
 *   - any failure is silent (Hindsight down, uv missing, etc.) — the
 *     suggester never sees them
 *   - safe to call from any context: no awaits, no exceptions escape
 */
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { existsSync } from "node:fs";

const ENABLE_ENV = "HINDSIGHT_SUGGESTER_ENABLED";
const BRIDGE_PATH_ENV = "HINDSIGHT_BRIDGE_PATH";
const BANK_PREFIX_ENV = "HINDSIGHT_BANK_PREFIX";

const DEFAULT_BRIDGE = join(
  homedir(),
  "Coding/Tooling/coding-toolbelt/review-with-memory/scripts/hindsight-bridge.py"
);

export interface SuggesterRetainPayload {
  prompt: string;
  promptHash: string;
  layer: string;
  matches: Array<{ name: string; confidence: number }>;
  kwConf?: number;
  embConf?: number;
}

function isEnabled(): boolean {
  const v = process.env[ENABLE_ENV];
  return v === "1" || v === "true";
}

function bridgePath(): string | null {
  const p = process.env[BRIDGE_PATH_ENV] || DEFAULT_BRIDGE;
  return existsSync(p) ? p : null;
}

function bankId(): string {
  const prefix = process.env[BANK_PREFIX_ENV] || "kh";
  let repoName: string;
  try {
    const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1000,
    })
      .toString()
      .trim();
    repoName = basename(root) || "scratch";
  } catch {
    repoName = "scratch";
  }
  return `${prefix}-::${repoName}`;
}

function buildContent(p: SuggesterRetainPayload): string {
  const names = p.matches.map((m) => m.name).join(", ") || "(no matches)";
  const promptPreview =
    p.prompt.length > 240 ? p.prompt.slice(0, 240) + "…" : p.prompt;
  return `Suggester(${p.layer}): "${promptPreview}" → ${names}`;
}

function buildTags(p: SuggesterRetainPayload, bank: string): string[] {
  const tags = new Set<string>([
    `repo:${bank.split("::").pop()}`,
    "source:suggester",
    `layer:${p.layer}`,
    `prompt-hash:${p.promptHash.slice(0, 8)}`,
  ]);
  for (const m of p.matches) {
    tags.add(`suggested:${m.name}`);
  }
  return [...tags];
}

/**
 * Retain a suggest call to Hindsight. Fire-and-forget.
 *
 * Returns immediately. Never throws. Caller does not await.
 */
export function retainSuggesterCall(payload: SuggesterRetainPayload): void {
  if (!isEnabled()) return;
  const bridge = bridgePath();
  if (!bridge) return;

  const bank = bankId();
  const content = buildContent(payload);
  const tags = buildTags(payload, bank);

  try {
    const child = spawn(
      "uv",
      [
        "run",
        "--quiet",
        bridge,
        "retain",
        "--bank",
        bank,
        "--content",
        content,
        "--context",
        "skill-suggest-call",
        "--tags",
        tags.join(","),
      ],
      {
        detached: true,
        stdio: "ignore",
        env: process.env,
      }
    );
    child.unref();
  } catch {
    // Silent fail-open. Hindsight down, uv not on PATH, etc. — never visible
    // to the suggester user. The whole point of Phase 1 is "build retain
    // volume without changing UX."
  }
}
