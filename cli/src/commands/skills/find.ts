import { readIndex } from "../../lib/index-store";
import { findMatches } from "../../lib/matcher";
import { c, print } from "../../lib/output";

export async function runFind(args: string[]): Promise<number> {
  const json = args.includes("--json");
  const remote = args.includes("--remote");
  const limitFlag = parseFlag(args, "--limit");
  const limit = limitFlag ? parseInt(limitFlag, 10) : 10;
  const positional = args.filter((a) => !a.startsWith("--") && a !== limitFlag);
  const query = positional.join(" ").trim();

  if (!query) {
    print(c.red("Usage:") + " toolbelt skills find <query> [--limit N] [--remote] [--json]");
    return 1;
  }

  const index = await readIndex();
  if (!index) {
    print(c.red("No index found.") + " Run " + c.bold("toolbelt skills reindex") + " first.");
    return 1;
  }

  const matches = findMatches(index, query, { limit });

  if (json) {
    print(JSON.stringify({ query, local: matches }, null, 2));
    if (remote) {
      print(c.dim("(remote search not yet implemented in v0.1; falls back to `bunx skills find`)"));
    }
    return 0;
  }

  if (matches.length === 0) {
    print(c.yellow(`No local matches for: ${query}`));
    print(c.dim("Try `bunx skills find " + query + "` to search the marketplace."));
    return 0;
  }

  print(c.bold(`Local matches for: `) + c.cyan(query));
  print();
  for (const m of matches) {
    const installed = m.installedPath ? c.green("●") : c.dim("○");
    const conf = formatConfidence(m.confidence);
    print(`  ${installed} ${c.bold(m.name)}  ${c.dim(`[${m.tier}-tier]`)}  ${conf}`);
    print(c.dim(`     ${truncate(m.description, 100)}`));
    if (m.matched.length) {
      print(c.dim(`     matched: ${m.matched.join(", ")}`));
    }
  }
  print();
  print(c.dim("● = active   ○ = staging/cold   confidence = relevance score"));

  if (remote) {
    print();
    print(c.dim("→ For marketplace results: ") + c.bold(`bunx skills find "${query}"`));
  }
  return 0;
}

function formatConfidence(c: number): string {
  const pct = Math.round(c * 100);
  if (pct >= 80) return `${pct}% match`;
  if (pct >= 50) return `${pct}% match`;
  return `${pct}% match`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function parseFlag(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}
