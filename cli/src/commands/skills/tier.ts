import { readIndex, updateSkill } from "../../lib/index-store";
import { isValidTier } from "../../lib/tiers";
import { c, print } from "../../lib/output";

export async function runTier(args: string[]): Promise<number> {
  const positional = args.filter((a) => !a.startsWith("--"));
  const [name, newTier] = positional;

  if (!name) {
    print(c.red("Usage:") + " toolbelt skills tier <name> [S|A|B|C]");
    return 1;
  }

  const index = await readIndex();
  if (!index) {
    print(c.red("No index found. Run `toolbelt skills reindex` first."));
    return 1;
  }

  const skill = index.skills[name];
  if (!skill) {
    print(c.red(`Skill not found: ${name}`));
    return 1;
  }

  if (!newTier) {
    print(`${c.bold(name)}: ${c.cyan(skill.tier + "-tier")}`);
    print(c.dim(`  ${skill.description.slice(0, 100)}`));
    if (skill.protected) print(c.magenta("  ◆ protected"));
    return 0;
  }

  const upper = newTier.toUpperCase();
  if (!isValidTier(upper)) {
    print(c.red(`Invalid tier: ${newTier}. Valid: S, A, B, C`));
    return 1;
  }

  if (skill.tier === upper) {
    print(c.dim(`${name} already at ${upper}-tier.`));
    return 0;
  }

  const old = skill.tier;
  await updateSkill(name, { tier: upper });
  print(c.green("✓") + ` ${c.bold(name)}  ${c.cyan(old)} → ${c.cyan(upper)}`);
  print(c.dim("  (Run `toolbelt skills demote/promote` to also move files between active/cold storage.)"));
  return 0;
}
