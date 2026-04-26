/**
 * Embeddings layer (Layer 1) for skill suggestion.
 *
 * Wraps `fastembed` with a singleton-loaded `all-MiniLM-L6-v2` model
 * (384 dims, ~22 MB). Per-skill vectors are cached on disk keyed by
 * SKILL.md mtime so re-embed only happens when content changes.
 *
 * The model load is ~5s cold / ~500ms warm. Callers (suggest, hybrid
 * matcher) should treat this layer as opt-in via `--deep` to avoid
 * paying that cost on every hook fire.
 */

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import type { SkillEntry, SkillsIndex } from "../types";

export const EMBEDDINGS_PATH = join(homedir(), ".agents", "skill-embeddings.json");
export const EMBEDDINGS_VERSION = "1.0";
export const EMBEDDINGS_MODEL = "all-MiniLM-L6-v2";
export const EMBEDDINGS_DIM = 384;

export interface SkillVector {
  mtime: number;
  text: string;
  vector: number[];
}

export interface EmbeddingsIndex {
  version: string;
  model: string;
  dim: number;
  generated: string;
  skills: Record<string, SkillVector>;
}

/**
 * Lazy singleton — only loads when first called. fastembed downloads
 * the model on first use to ~/.cache/fastembed_cache/.
 */
let modelPromise: Promise<unknown> | null = null;

async function getModel(): Promise<unknown> {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const { EmbeddingModel, FlagEmbedding } = await import("fastembed");
    return FlagEmbedding.init({ model: EmbeddingModel.AllMiniLML6V2 });
  })();
  return modelPromise;
}

export interface EmbedOptions {
  batchSize?: number;
  signal?: AbortSignal;
}

export async function embedTexts(
  texts: string[],
  opts: EmbedOptions = {}
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = (await getModel()) as { embed: (docs: string[], batch?: number) => AsyncIterable<Float32Array[]> };
  const batchSize = opts.batchSize ?? 16;
  const out: number[][] = [];
  for await (const batch of model.embed(texts, batchSize)) {
    if (opts.signal?.aborted) throw new Error("aborted");
    for (const v of batch) out.push(toPlainArray(v));
  }
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedTexts([text], { batchSize: 1 });
  return v;
}

function toPlainArray(v: Float32Array | number[]): number[] {
  return v instanceof Float32Array ? Array.from(v) : v.slice();
}

export function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Compose the canonical embedded-text string for a skill. Keep this
 * stable — changing the formula invalidates every cached vector.
 */
export function composeEmbeddedText(skill: SkillEntry): string {
  const parts = [
    skill.name.replace(/-/g, " "),
    skill.description,
  ];
  if (skill.triggers && skill.triggers.length > 0) {
    parts.push("triggers: " + skill.triggers.slice(0, 12).join(", "));
  }
  return parts.filter(Boolean).join(". ").slice(0, 800);
}

export async function loadEmbeddings(): Promise<EmbeddingsIndex | null> {
  if (!existsSync(EMBEDDINGS_PATH)) return null;
  try {
    const raw = await readFile(EMBEDDINGS_PATH, "utf8");
    const parsed = JSON.parse(raw) as EmbeddingsIndex;
    if (parsed.version !== EMBEDDINGS_VERSION) return null;
    if (parsed.dim !== EMBEDDINGS_DIM) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveEmbeddings(idx: EmbeddingsIndex): Promise<void> {
  await mkdir(dirname(EMBEDDINGS_PATH), { recursive: true });
  await writeFile(EMBEDDINGS_PATH, JSON.stringify(idx, null, 0) + "\n", "utf8");
}

export interface BuildOpts {
  rebuild?: boolean;
  onProgress?: (info: { done: number; total: number; skill: string }) => void;
  signal?: AbortSignal;
}

/**
 * Build (or refresh) skill embeddings against the current index.
 * Skips skills whose mtime + composed text both match cache.
 */
export async function buildSkillEmbeddings(
  index: SkillsIndex,
  opts: BuildOpts = {}
): Promise<EmbeddingsIndex> {
  const existing = opts.rebuild ? null : await loadEmbeddings();
  const skills: Record<string, SkillVector> = existing?.skills ? { ...existing.skills } : {};

  const toEmbed: { name: string; text: string; mtime: number }[] = [];

  for (const [name, entry] of Object.entries(index.skills)) {
    const text = composeEmbeddedText(entry);
    const mtime = await skillMtime(entry);
    const cached = skills[name];
    if (cached && cached.mtime === mtime && cached.text === text) continue;
    toEmbed.push({ name, text, mtime });
  }

  // Drop entries for skills that no longer exist.
  for (const name of Object.keys(skills)) {
    if (!index.skills[name]) delete skills[name];
  }

  const total = toEmbed.length;
  if (total > 0) {
    const BATCH = 32;
    for (let i = 0; i < toEmbed.length; i += BATCH) {
      if (opts.signal?.aborted) throw new Error("aborted");
      const chunk = toEmbed.slice(i, i + BATCH);
      const vectors = await embedTexts(
        chunk.map((c) => c.text),
        { batchSize: BATCH, signal: opts.signal }
      );
      for (let j = 0; j < chunk.length; j++) {
        const c = chunk[j];
        skills[c.name] = { mtime: c.mtime, text: c.text, vector: vectors[j] };
        opts.onProgress?.({ done: i + j + 1, total, skill: c.name });
      }
    }
  }

  const out: EmbeddingsIndex = {
    version: EMBEDDINGS_VERSION,
    model: EMBEDDINGS_MODEL,
    dim: EMBEDDINGS_DIM,
    generated: new Date().toISOString(),
    skills,
  };
  await saveEmbeddings(out);
  return out;
}

async function skillMtime(entry: SkillEntry): Promise<number> {
  const dir = entry.installedPath ?? entry.stagingPath ?? entry.coldPath;
  if (!dir) return 0;
  const skillMd = join(dir, "SKILL.md");
  try {
    const s = await stat(skillMd);
    return s.mtimeMs | 0;
  } catch {
    return 0;
  }
}

export interface EmbeddingMatch {
  name: string;
  score: number;
}

/**
 * Find top-k skills by cosine similarity to the prompt.
 * `tiers`/`requireInstalled` mirror the keyword matcher's filters so
 * results compose cleanly when blended.
 */
export async function topEmbeddingMatches(
  prompt: string,
  embeddings: EmbeddingsIndex,
  index: SkillsIndex,
  opts: { k?: number; tiers?: Set<string>; requireInstalled?: boolean } = {}
): Promise<EmbeddingMatch[]> {
  const k = opts.k ?? 10;
  const queryVec = await embedQuery(prompt);
  const scored: EmbeddingMatch[] = [];
  for (const [name, sv] of Object.entries(embeddings.skills)) {
    const skill = index.skills[name];
    if (!skill) continue;
    if (opts.tiers && !opts.tiers.has(skill.tier)) continue;
    if (opts.requireInstalled && !skill.installedPath) continue;
    scored.push({ name, score: cosineSim(queryVec, sv.vector) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
