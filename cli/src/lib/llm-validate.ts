/**
 * Synchronous wrapper around review-with-memory/skill-sync/llm_validate.py
 * for the suggester's `--validate` flag.
 *
 * Fail-open: if the validator can't run (Python missing, key missing,
 * timeout, network error), the original matches are returned unchanged.
 * The user gets a stderr note in --explain mode but the suggester never
 * fails because validation failed.
 *
 * Latency: ~3s per call. Only invoked when --validate is set OR
 * HINDSIGHT_SUGGEST_VALIDATE=1, never on the hot path.
 */
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { SuggestMatch } from "../types";

const VALIDATOR_PATH_ENV = "HINDSIGHT_VALIDATOR_PATH";
const DEFAULT_VALIDATOR = join(
  homedir(),
  "Coding/Tooling/coding-toolbelt/review-with-memory/skill-sync/llm_validate.py"
);

interface LlmFilterResult {
  keep: Array<{ name: string; reason?: string }>;
  drop: Array<{ name: string; reason?: string }>;
}

export interface ValidateResult {
  filtered: SuggestMatch[];
  ranOk: boolean;
  errorReason?: string;
  drops: Array<{ name: string; reason?: string }>;
}

/**
 * Filter `matches` by asking an LLM whether each candidate genuinely
 * applies to `prompt`. Returns the kept subset plus diagnostics.
 *
 * If the call fails for any reason, ranOk=false and `filtered` equals
 * the input — fail-open.
 */
export function validateMatchesWithLlm(
  prompt: string,
  matches: SuggestMatch[],
  opts: { timeoutMs?: number } = {}
): ValidateResult {
  if (matches.length === 0) {
    return { filtered: [], ranOk: true, drops: [] };
  }
  const validator = process.env[VALIDATOR_PATH_ENV] || DEFAULT_VALIDATOR;
  if (!existsSync(validator)) {
    return {
      filtered: matches,
      ranOk: false,
      errorReason: `validator not found: ${validator}`,
      drops: [],
    };
  }

  const stdin = JSON.stringify(
    matches.map((m) => ({
      name: m.name,
      description: m.description,
      matched: m.matched,
    }))
  );

  // The validator script uses uv via its shebang; spawnSync handles that.
  const result = spawnSync(
    validator,
    ["filter-suggestions", "--prompt", prompt],
    {
      input: stdin,
      encoding: "utf-8",
      timeout: opts.timeoutMs ?? 15000,
      env: process.env,
    }
  );

  if (result.error || result.status !== 0) {
    return {
      filtered: matches,
      ranOk: false,
      errorReason:
        result.error?.message || `validator exited ${result.status}: ${result.stderr?.slice(0, 200)}`,
      drops: [],
    };
  }

  let parsed: LlmFilterResult;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (e) {
    return {
      filtered: matches,
      ranOk: false,
      errorReason: `validator returned non-JSON: ${result.stdout.slice(0, 100)}`,
      drops: [],
    };
  }

  const keepNames = new Set(parsed.keep?.map((k) => k.name) ?? []);
  const filtered = matches.filter((m) => keepNames.has(m.name));
  // Annotate kept matches with the LLM's keep reason for --explain output.
  if (parsed.keep) {
    const reasonByName = new Map(parsed.keep.map((k) => [k.name, k.reason]));
    for (const m of filtered) {
      const reason = reasonByName.get(m.name);
      if (reason) m.matched = [...m.matched, `<llm-keep:${reason.slice(0, 60)}>`];
    }
  }
  return {
    filtered,
    ranOk: true,
    drops: parsed.drop ?? [],
  };
}
