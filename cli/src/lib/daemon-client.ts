/**
 * Tiny client for the embedding daemon (`toolbelt skills serve`).
 *
 * Used by suggest, hooks, plugin — anywhere that wants embedding-tier
 * matching without paying the cold-start cost of loading the model.
 *
 * Returns null on any failure (timeout, refused, parse error). The
 * caller is expected to fall back to keyword-only matching silently.
 */

import type { HybridResult } from "./hybrid-matcher";

const DEFAULT_PORT = 9988;
const DEFAULT_HOST = "127.0.0.1";

function baseUrl(port = DEFAULT_PORT): string {
  return `http://${DEFAULT_HOST}:${port}`;
}

export interface DaemonHealth {
  ok: boolean;
  model: string | null;
  dim: number | null;
  skillsLoaded: number;
  embeddingsLoaded: number;
  uptimeMs: number;
  requestCount: number;
}

export async function pingDaemon(timeoutMs = 100, port?: number): Promise<DaemonHealth | null> {
  try {
    const res = await fetch(baseUrl(port) + "/health", {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as DaemonHealth;
  } catch {
    return null;
  }
}

export async function daemonMatch(
  prompt: string,
  opts: {
    deep?: boolean;
    tiers?: string[];
    limit?: number;
    minConfidence?: number;
    timeoutMs?: number;
    port?: number;
  } = {}
): Promise<HybridResult | null> {
  try {
    const res = await fetch(baseUrl(opts.port) + "/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt,
        deep: opts.deep,
        tiers: opts.tiers,
        limit: opts.limit,
        minConfidence: opts.minConfidence,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 800),
    });
    if (!res.ok) return null;
    return (await res.json()) as HybridResult;
  } catch {
    return null;
  }
}

export async function daemonEmbed(
  text: string,
  opts: { timeoutMs?: number; port?: number } = {}
): Promise<number[] | null> {
  try {
    const res = await fetch(baseUrl(opts.port) + "/embed", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 500),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { vector?: number[] };
    return body.vector ?? null;
  } catch {
    return null;
  }
}
