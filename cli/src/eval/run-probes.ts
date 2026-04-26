#!/usr/bin/env bun
/**
 * Eval harness — run the 25-probe corpus against the hybrid matcher
 * with and without --deep, summarize TP/FP/FN/WS scores.
 *
 * Categories:
 *   TP — exact expected skill in top results
 *   FP — wrong skill suggested (not in expected, conf >= 0.45)
 *   FN — expected skill missing
 *   WS — weakly suggested (expected appears but conf < 0.45)
 *   TN — correctly returned nothing for a no-match probe
 *
 * Usage:
 *   bun src/eval/run-probes.ts [--deep] [--json]
 */

import { readIndex } from "../lib/index-store";
import { findMatchesHybrid } from "../lib/hybrid-matcher";
import probesFile from "./probes.json" with { type: "json" };

interface Probe {
  id: string;
  prompt: string;
  expect: string[];
  denylist?: string[];
  category: string;
  note?: string;
}

const probes = (probesFile as { probes: Probe[] }).probes;
const deep = process.argv.includes("--deep");
const wantJson = process.argv.includes("--json");

const index = await readIndex();
if (!index) {
  console.error("No index. Run `toolbelt skills reindex` first.");
  process.exit(1);
}

interface Outcome {
  id: string;
  prompt: string;
  category: string;
  top: Array<{ name: string; conf: number }>;
  verdict: "TP" | "TP-weak" | "FN" | "FP" | "TN" | "WS";
  notes: string[];
}

const tally = { TP: 0, "TP-weak": 0, FN: 0, FP: 0, TN: 0, WS: 0 } as Record<string, number>;
const outcomes: Outcome[] = [];

for (const probe of probes) {
  const r = await findMatchesHybrid(index, probe.prompt, {
    deep,
    minScore: 8,
    minConfidence: 0.4,
    limit: 3,
    tiers: new Set(["S", "A", "B", "C"]),
    requireNameOrTrigger: true,
  });
  const top = r.matches.map((m) => ({ name: m.name, conf: Number(m.confidence.toFixed(2)) }));
  const topNames = new Set(top.map((t) => t.name));
  const expectsNothing = probe.expect.length === 0;

  let verdict: Outcome["verdict"];
  const notes: string[] = [];
  if (expectsNothing) {
    if (top.length === 0) verdict = "TN";
    else {
      verdict = "FP";
      notes.push("returned skills for a no-match probe");
    }
  } else {
    const matched = probe.expect.filter((e) => topNames.has(e));
    if (matched.length === 0) {
      verdict = "FN";
      notes.push(`missing: ${probe.expect.join(", ")}`);
    } else {
      const strong = matched.some((e) => {
        const t = top.find((tt) => tt.name === e);
        return t && t.conf >= 0.5;
      });
      verdict = strong ? "TP" : "TP-weak";
      const wrong = top.filter((t) => !probe.expect.includes(t.name) && t.conf >= 0.45);
      if (wrong.length > 0) notes.push(`also: ${wrong.map((w) => w.name).join(", ")}`);
    }
  }
  if (probe.denylist) {
    const banned = top.filter((t) => probe.denylist!.includes(t.name));
    if (banned.length > 0) {
      verdict = "FP";
      notes.push(`denylist hit: ${banned.map((b) => b.name).join(", ")}`);
    }
  }
  tally[verdict] = (tally[verdict] ?? 0) + 1;
  outcomes.push({ id: probe.id, prompt: probe.prompt, category: probe.category, top, verdict, notes });
}

const total = outcomes.length;
const useful = (tally.TP ?? 0) + (tally.TN ?? 0);
const misfire = (tally.FP ?? 0);

if (wantJson) {
  console.log(JSON.stringify({ tally, total, useful, misfire, outcomes }, null, 2));
} else {
  console.log(`Mode: ${deep ? "DEEP (kw + ctx + emb veto)" : "FAST (kw + ctx only)"}`);
  console.log("");
  for (const o of outcomes) {
    const badge = o.verdict.padEnd(8);
    const top = o.top.map((t) => `${t.name}@${(t.conf * 100).toFixed(0)}`).join(", ") || "—";
    console.log(`  [${badge}] ${o.id}: ${o.prompt.slice(0, 50).padEnd(50)} → ${top}`);
    if (o.notes.length > 0) console.log(`              ${o.notes.join("; ")}`);
  }
  console.log("");
  console.log(`tally: TP=${tally.TP ?? 0} TP-weak=${tally["TP-weak"] ?? 0} FN=${tally.FN ?? 0} FP=${tally.FP ?? 0} TN=${tally.TN ?? 0}`);
  console.log(`useful: ${useful}/${total} (${((useful / total) * 100).toFixed(0)}%)  misfire: ${misfire}/${total} (${((misfire / total) * 100).toFixed(0)}%)`);
}
