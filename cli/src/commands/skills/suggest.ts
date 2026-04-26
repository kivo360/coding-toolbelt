import { readIndex } from "../../lib/index-store";
import { findMatchesHybrid } from "../../lib/hybrid-matcher";
import { pingDaemon, daemonMatch } from "../../lib/daemon-client";
import { appendMemory, makeRecord, recall, recentlySuggested } from "../../lib/suggest-memory";
import { retainSuggesterCall } from "../../lib/hindsight-retain";
import { validateMatchesWithLlm } from "../../lib/llm-validate";
import { c, print } from "../../lib/output";
import { createHash } from "node:crypto";
import type { SuggestMatch } from "../../types";
import type { HybridResult } from "../../lib/hybrid-matcher";

export async function runSuggest(args: string[]): Promise<number> {
  const json = args.includes("--json");
  const coldOnly = args.includes("--cold-only");
  const deep = args.includes("--deep");
  const fast = args.includes("--fast"); // hook-friendly: never load model
  const noMemory = args.includes("--no-memory");
  const explain = args.includes("--explain");
  // LLM sanity-check: ~3s, opt-in. Catches semantic false positives that
  // keyword/embedding/project-boost can't (e.g. "cli" token matching unrelated
  // CLI skills). On by default when HINDSIGHT_SUGGEST_VALIDATE=1.
  const validate =
    args.includes("--validate") || process.env.HINDSIGHT_SUGGEST_VALIDATE === "1";
  const noValidate = args.includes("--no-validate");
  const validateActive = validate && !noValidate && !fast; // never on the hook-friendly path

  const minConfFlag = parseFlag(args, "--min-confidence");
  const minConf = minConfFlag ? parseFloat(minConfFlag) : 0.45;
  const limitFlag = parseFlag(args, "--limit");
  const limit = limitFlag ? parseInt(limitFlag, 10) : 3;
  const tiersFlag = parseFlag(args, "--tiers");
  const tiers = tiersFlag ? new Set(tiersFlag.toUpperCase().split(",")) : new Set(["B", "C"]);

  const flagsWithValues = new Set(
    [minConfFlag, limitFlag, tiersFlag].filter((v): v is string => Boolean(v))
  );
  const positional = args.filter((a, i) => {
    if (a.startsWith("--")) return false;
    if (flagsWithValues.has(a)) return false;
    if (
      i > 0 &&
      (args[i - 1] === "--min-confidence" ||
        args[i - 1] === "--limit" ||
        args[i - 1] === "--tiers")
    )
      return false;
    return true;
  });
  const prompt = positional.join(" ").trim();

  if (!prompt) {
    if (json) {
      print(JSON.stringify({ suggestions: [] }));
      return 0;
    }
    print(
      c.red("Usage:") +
        " toolbelt skills suggest <prompt> [--min-confidence 0.45] [--limit 3] [--tiers B,C] [--cold-only] [--deep] [--fast] [--json] [--explain]"
    );
    return 1;
  }

  const index = await readIndex();
  if (!index) {
    if (json) {
      print(JSON.stringify({ suggestions: [], error: "no-index" }));
      return 0;
    }
    print(c.red("No index found. Run `toolbelt skills reindex` first."));
    return 1;
  }

  // ── Memory recall (free, instant) ───────────────────────────────
  if (!noMemory && !deep) {
    const cached = await recall(prompt);
    if (cached.hit && cached.hit.suggestions.length > 0 && cached.hit.layer !== "memory") {
      const matches = cached.hit.suggestions
        .map((s) => {
          const sk = index.skills[s.name];
          if (!sk) return null;
          if (tiers && !tiers.has(sk.tier)) return null;
          if (s.conf < minConf) return null;
          return {
            name: s.name,
            tier: sk.tier,
            description: sk.description,
            confidence: s.conf,
            matched: ["<memory>"],
            installedPath: sk.installedPath,
          } satisfies SuggestMatch;
        })
        .filter((m): m is SuggestMatch => m !== null)
        .slice(0, limit);
      if (matches.length > 0) {
        return printResult(json, matches, explain, "memory");
      }
    }
  }

  // ── Daemon path (preferred when running) ─────────────────────────
  let result: HybridResult | null = null;
  if (!fast) {
    const health = await pingDaemon(80);
    if (health) {
      result = await daemonMatch(prompt, {
        deep,
        tiers: [...tiers] as string[],
        limit: limit * 3,
        minConfidence: minConf,
        timeoutMs: deep ? 1500 : 500,
      });
    }
  }

  // ── In-process path (no daemon, or --fast) ───────────────────────
  if (!result) {
    result = await findMatchesHybrid(index, prompt, {
      minScore: 10,
      minConfidence: minConf,
      limit: limit * 3,
      tiers,
      requireNameOrTrigger: true,
      deep: deep && !fast,
    });
  }

  let matches = (coldOnly
    ? result.matches.filter((m) => !m.installedPath)
    : result.matches
  ).slice(0, limit);

  // De-spam: drop a suggestion if it's been suggested in the last 5 prompts
  // and its confidence is borderline (<0.7).
  if (!noMemory && matches.length > 0) {
    const recent = await recentlySuggested(5);
    const filtered = matches.filter((m) => !(recent.has(m.name) && m.confidence < 0.7));
    if (filtered.length > 0) matches = filtered;
  }

  // LLM sanity-check (opt-in, costs ~3s). Drops matches that share tokens
  // but aren't semantically relevant. Fail-open: if the validator can't run
  // for any reason, the original matches are returned unchanged.
  let validateNote: string | null = null;
  let llmDrops: Array<{ name: string; reason?: string }> = [];
  if (validateActive && matches.length > 0) {
    const v = validateMatchesWithLlm(prompt, matches);
    if (v.ranOk) {
      const before = matches.length;
      matches = v.filtered;
      llmDrops = v.drops;
      validateNote = `validated ${before}→${matches.length}, ${v.drops.length} dropped`;
    } else {
      validateNote = `validate failed: ${v.errorReason ?? "unknown"} — kept original ${matches.length}`;
    }
  }

  // Persist to memory (best-effort, non-blocking)
  if (!noMemory && matches.length > 0) {
    appendMemory(
      makeRecord(
        prompt,
        result.stats.triggered,
        matches.map((m) => ({ name: m.name, conf: m.confidence }))
      )
    ).catch(() => {});
  }

  // Phase 1 of the Hindsight integration: retain every suggest call to the
  // project's bank. Default OFF (HINDSIGHT_SUGGESTER_ENABLED=1 to opt in).
  // Fire-and-forget — adds zero latency, never throws.
  if (!noMemory) {
    retainSuggesterCall({
      prompt,
      promptHash: createHash("sha1").update(prompt).digest("hex"),
      layer: result.stats.triggered,
      matches: matches.map((m) => ({ name: m.name, confidence: m.confidence })),
      kwConf: result.stats.kwBest,
      embConf: result.stats.embBest,
    });
  }

  return printResult(json, matches, explain, result.stats.triggered, result, validateNote, llmDrops);
}

function printResult(
  json: boolean,
  matches: SuggestMatch[],
  explain: boolean,
  layer: string,
  result?: HybridResult,
  validateNote?: string | null,
  llmDrops: Array<{ name: string; reason?: string }> = []
): number {
  if (json) {
    print(
      JSON.stringify(
        {
          suggestions: matches.map((m) => ({
            name: m.name,
            tier: m.tier,
            description: m.description,
            confidence: m.confidence,
            installed: !!m.installedPath,
            installCommand: m.installedPath
              ? null
              : `toolbelt skills install ${m.name}`,
            matched: m.matched,
          })),
          layer,
          ...(result ? { stats: result.stats, layers: result.layers } : {}),
          ...(validateNote ? { validate: validateNote, llmDrops } : {}),
        },
        null,
        2
      )
    );
    return 0;
  }

  if (matches.length === 0) {
    print(c.dim("No skill suggestions for that prompt."));
    return 0;
  }

  print(c.bold("Suggested skills for this prompt:"));
  for (const m of matches) {
    const status = m.installedPath ? c.green("[installed]") : c.yellow("[cold/staging]");
    print(
      `  📚 ${c.bold(m.name)} ${c.dim(`[${m.tier}]`)} ${status} ` +
        c.dim(`(${(m.confidence * 100).toFixed(0)}%)`) +
        ` — ${truncate(m.description, 80)}`
    );
    if (!m.installedPath) {
      print(c.dim(`     install: toolbelt skills install ${m.name}`));
    }
    if (explain) {
      print(c.dim(`     matched: ${m.matched.join(", ")}`));
    }
  }
  if (explain && result) {
    print(
      c.dim(
        `  via ${layer} (kw=${result.stats.kwBest.toFixed(2)}, ctx=${result.stats.contextBoosts}, emb=${result.stats.embBest.toFixed(2)})`
      )
    );
  }
  if (validateNote && (explain || llmDrops.length > 0)) {
    print(c.dim(`  ${validateNote}`));
    if (explain) {
      for (const d of llmDrops.slice(0, 4)) {
        print(c.dim(`    dropped ${d.name}: ${d.reason ?? "(no reason)"}`));
      }
    }
  }
  return 0;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function parseFlag(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}
