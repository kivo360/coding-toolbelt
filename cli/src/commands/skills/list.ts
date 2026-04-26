import { readIndex } from "../../lib/index-store";
import { TIER_ORDER, TIER_DESCRIPTIONS } from "../../lib/tiers";
import type { Tier } from "../../types";
import { c, print, table } from "../../lib/output";

export async function runList(args: string[]): Promise<number> {
  const tierFilter = parseFlag(args, "--tier");
  const richOnly = args.includes("--rich");
  const protectedOnly = args.includes("--protected");
  const json = args.includes("--json");

  const index = await readIndex();
  if (!index) {
    print(c.red("No index found.") + " Run " + c.bold("toolbelt skills reindex") + " first.");
    return 1;
  }

  let entries = Object.values(index.skills);
  if (tierFilter) entries = entries.filter((e) => e.tier === tierFilter.toUpperCase());
  if (richOnly)
    entries = entries.filter(
      (e) => e.hasScripts || e.hasTemplates || e.hasReferences || e.hasBin || e.hasAssets
    );
  if (protectedOnly) entries = entries.filter((e) => e.protected);

  if (json) {
    print(JSON.stringify(entries, null, 2));
    return 0;
  }

  if (entries.length === 0) {
    print(c.yellow("No skills match those filters."));
    return 0;
  }

  if (tierFilter || richOnly || protectedOnly) {
    renderFlat(entries);
    return 0;
  }

  for (const tier of TIER_ORDER) {
    const tierEntries = entries.filter((e) => e.tier === tier);
    if (tierEntries.length === 0) continue;
    print();
    print(c.bold(c.cyan(`${tier}-tier`)) + c.dim(`  ${TIER_DESCRIPTIONS[tier]}  (${tierEntries.length})`));
    print(c.dim("─".repeat(78)));
    renderFlat(tierEntries);
  }

  print();
  print(c.dim(`Total: ${entries.length} skills`));
  return 0;
}

function renderFlat(entries: ReturnType<typeof readIndex> extends Promise<infer U> ? (U & {}) extends { skills: infer S } ? S extends Record<string, infer E> ? E[] : never : never : never): void;
function renderFlat(entries: any[]): void {
  const rows = entries.map((e) => {
    const flags = [
      e.protected ? c.magenta("◆") : " ",
      e.hasScripts ? c.green("S") : c.dim("·"),
      e.hasTemplates ? c.green("T") : c.dim("·"),
      e.hasReferences ? c.green("R") : c.dim("·"),
      e.hasBin ? c.green("B") : c.dim("·"),
    ].join("");
    return [
      c.bold(e.name),
      c.dim(`${e.tier}`),
      flags,
      String(e.lines).padStart(4) + c.dim(" ln"),
      c.dim(e.modifiedAt),
      truncate(e.description, 60),
    ];
  });
  table(rows, { header: ["name", "tier", "flags", "lines", "modified", "description"] });
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function parseFlag(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}
