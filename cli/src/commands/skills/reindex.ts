import type { SkillEntry } from "../../types";
import { PATHS } from "../../lib/paths";
import { listSkillDirs, scanSkill, loadLockSources } from "../../lib/scan";
import { writeIndex, readIndex } from "../../lib/index-store";
import { c, print } from "../../lib/output";

export async function runReindex(args: string[]): Promise<number> {
  const quiet = args.includes("--quiet");
  const start = Date.now();

  const existing = await readIndex();
  const lock = await loadLockSources();

  const allRaw = [
    ...(await listSkillDirs(PATHS.active)),
    ...(await listSkillDirs(PATHS.staging)),
    ...(await listSkillDirs(PATHS.cold)),
  ];

  const skills: Record<string, SkillEntry> = {};
  for (const raw of allRaw) {
    const entry = await scanSkill(raw, lock.tracked, lock.sources);
    if (existing?.skills[entry.name]?.tier) {
      entry.tier = existing.skills[entry.name].tier;
    }
    skills[entry.name] = entry;
  }

  const index = await writeIndex(skills);
  const elapsed = Date.now() - start;

  if (!quiet) {
    print(c.green("✓") + ` Reindexed ${c.bold(String(Object.keys(skills).length))} skills in ${elapsed}ms`);
    const tierCounts = Object.entries(index.tiers).map(([t, list]) => `${t}=${list.length}`).join("  ");
    print(c.dim(`  ${tierCounts}`));
    print(c.dim(`  Wrote ${PATHS.index}`));
  }
  return 0;
}
