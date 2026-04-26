/**
 * Suggest memory — append-only log of past suggestion decisions.
 *
 * Goals:
 *   1. Fast-path identical or near-identical prompts ("recall")
 *   2. Avoid re-suggesting the same skill 3 prompts in a row (anti-spam)
 *   3. Provide a corpus to evaluate/tune layers later
 *
 * Format: NDJSON, one record per line, at ~/.agents/suggest-memory.jsonl
 *   { ts, hash, preview, layer, suggestions: [{name, conf}] }
 *
 * Recall is exact-hash-match only for now — semantic recall (via
 * embeddings) is left for a follow-up; the JSONL format keeps that
 * path open without schema migration.
 *
 * Rotation: when the file grows past `MAX_BYTES`, the oldest half is
 * dropped (best-effort, single-pass rewrite). The hot path always
 * appends, never reads, so rotation runs on demand.
 */

import { readFile, appendFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";

export const MEMORY_PATH = join(homedir(), ".agents", "suggest-memory.jsonl");
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_RECALL_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface MemoryRecord {
  ts: number;
  hash: string;
  preview: string;
  layer: "keyword" | "context" | "embedding" | "memory";
  /** Top suggestions returned for this prompt. */
  suggestions: Array<{ name: string; conf: number }>;
  /** Whether the user appears to have used a suggestion (best-effort). */
  used?: string;
}

export function hashPrompt(prompt: string): string {
  return createHash("sha1")
    .update(prompt.trim().toLowerCase().replace(/\s+/g, " "))
    .digest("hex")
    .slice(0, 16);
}

function preview(prompt: string): string {
  return prompt.replace(/\s+/g, " ").trim().slice(0, 120);
}

export async function appendMemory(rec: MemoryRecord): Promise<void> {
  await mkdir(dirname(MEMORY_PATH), { recursive: true });
  await appendFile(MEMORY_PATH, JSON.stringify(rec) + "\n", "utf8");
  await maybeRotate();
}

async function maybeRotate(): Promise<void> {
  try {
    const s = await stat(MEMORY_PATH);
    if (s.size <= MAX_BYTES) return;
  } catch {
    return;
  }
  try {
    const raw = await readFile(MEMORY_PATH, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const keep = lines.slice(Math.floor(lines.length / 2));
    await writeFile(MEMORY_PATH, keep.join("\n") + "\n", "utf8");
  } catch {
    // best-effort
  }
}

export interface RecallResult {
  hit: MemoryRecord | null;
  /** All recent records that matched the same prompt hash. */
  history: MemoryRecord[];
}

export async function recall(prompt: string): Promise<RecallResult> {
  if (!existsSync(MEMORY_PATH)) return { hit: null, history: [] };
  const hash = hashPrompt(prompt);
  let raw: string;
  try {
    raw = await readFile(MEMORY_PATH, "utf8");
  } catch {
    return { hit: null, history: [] };
  }
  const cutoff = Date.now() - MAX_RECALL_AGE_MS;
  const history: MemoryRecord[] = [];
  // Walk backwards so newest hit wins.
  const lines = raw.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    let rec: MemoryRecord;
    try {
      rec = JSON.parse(line) as MemoryRecord;
    } catch {
      continue;
    }
    if (rec.hash !== hash) continue;
    if (rec.ts < cutoff) continue;
    history.push(rec);
  }
  return { hit: history[0] ?? null, history };
}

/**
 * Return the set of skills suggested in the last `n` records,
 * regardless of prompt. Used to avoid spam-suggesting the same skill
 * across rapid-fire interactions.
 */
export async function recentlySuggested(n: number = 5): Promise<Set<string>> {
  if (!existsSync(MEMORY_PATH)) return new Set();
  let raw: string;
  try {
    raw = await readFile(MEMORY_PATH, "utf8");
  } catch {
    return new Set();
  }
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const slice = lines.slice(-n);
  const out = new Set<string>();
  for (const line of slice) {
    try {
      const rec = JSON.parse(line) as MemoryRecord;
      for (const s of rec.suggestions) out.add(s.name);
    } catch {
      // skip
    }
  }
  return out;
}

export function makeRecord(
  prompt: string,
  layer: MemoryRecord["layer"],
  suggestions: Array<{ name: string; conf: number }>
): MemoryRecord {
  return {
    ts: Date.now(),
    hash: hashPrompt(prompt),
    preview: preview(prompt),
    layer,
    suggestions: suggestions.slice(0, 5),
  };
}
