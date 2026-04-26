import { readIndex } from "../../lib/index-store";
import { findMatches } from "../../lib/matcher";
import { c, print } from "../../lib/output";

export async function runSuggest(args: string[]): Promise<number> {
  const json = args.includes("--json");
  const minConfFlag = parseFlag(args, "--min-confidence");
  const minConf = minConfFlag ? parseFloat(minConfFlag) : 0.3;
  const limitFlag = parseFlag(args, "--limit");
  const limit = limitFlag ? parseInt(limitFlag, 10) : 3;
  const tiersFlag = parseFlag(args, "--tiers");
  const tiers = tiersFlag ? new Set(tiersFlag.toUpperCase().split(",")) : new Set(["B", "C"]);

  const positional = args.filter((a) => !a.startsWith("--") && a !== minConfFlag && a !== limitFlag && a !== tiersFlag);
  const prompt = positional.join(" ").trim();

  if (!prompt) {
    if (json) {
      print(JSON.stringify({ suggestions: [] }));
      return 0;
    }
    print(c.red("Usage:") + " toolbelt skills suggest <prompt> [--min-confidence 0.6] [--limit 3] [--tiers B,C] [--json]");
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

  const matches = findMatches(index, prompt, { minScore: 6, limit: limit * 3, tiers })
    .filter((m) => m.confidence >= minConf)
    .slice(0, limit);

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
          })),
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
    print(`  📚 ${c.bold(m.name)} ${c.dim(`[${m.tier}]`)} ${status} — ${truncate(m.description, 80)}`);
    if (!m.installedPath) {
      print(c.dim(`     install: toolbelt skills install ${m.name}`));
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
