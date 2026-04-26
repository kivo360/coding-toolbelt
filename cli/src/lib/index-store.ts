import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import type { SkillEntry, SkillsIndex, Tier } from "../types";
import { PATHS } from "./paths";
import { TIER_ORDER } from "./tiers";

const INDEX_VERSION = "1.0";

export async function readIndex(): Promise<SkillsIndex | null> {
  if (!existsSync(PATHS.index)) return null;
  try {
    const raw = await readFile(PATHS.index, "utf8");
    return JSON.parse(raw) as SkillsIndex;
  } catch {
    return null;
  }
}

export async function writeIndex(skills: Record<string, SkillEntry>): Promise<SkillsIndex> {
  const tiers = Object.fromEntries(TIER_ORDER.map((t) => [t, [] as string[]])) as Record<Tier, string[]>;
  for (const [name, entry] of Object.entries(skills)) {
    tiers[entry.tier].push(name);
  }
  for (const t of TIER_ORDER) tiers[t].sort();

  const index: SkillsIndex = {
    version: INDEX_VERSION,
    generated: new Date().toISOString(),
    paths: {
      active: PATHS.active,
      staging: PATHS.staging,
      cold: PATHS.cold,
      lock: PATHS.lock,
    },
    tiers,
    skills,
  };

  await mkdir(dirname(PATHS.index), { recursive: true });
  await writeFile(PATHS.index, JSON.stringify(index, null, 2) + "\n", "utf8");
  return index;
}

export async function updateSkill(name: string, patch: Partial<SkillEntry>): Promise<SkillsIndex | null> {
  const index = await readIndex();
  if (!index) return null;
  if (!index.skills[name]) return null;
  index.skills[name] = { ...index.skills[name], ...patch };
  return writeIndex(index.skills);
}
