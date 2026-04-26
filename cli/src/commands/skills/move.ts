import { rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { readIndex } from "../../lib/index-store";
import { PATHS, isProtected } from "../../lib/paths";
import { c, print } from "../../lib/output";

export type MoveDirection = "promote" | "demote" | "install";

export async function runInstall(args: string[]): Promise<number> {
  return runMove(args, "install");
}

export async function runPromote(args: string[]): Promise<number> {
  return runMove(args, "promote");
}

export async function runDemote(args: string[]): Promise<number> {
  return runMove(args, "demote");
}

async function runMove(args: string[], direction: MoveDirection): Promise<number> {
  const positional = args.filter((a) => !a.startsWith("--"));
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const name = positional[0];

  if (!name) {
    print(c.red("Usage:") + ` toolbelt skills ${direction} <name> [--force] [--dry-run]`);
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

  const current = locate(name);
  if (!current) {
    print(c.red(`Skill ${name} is in the index but not on disk in active/staging/cold.`));
    return 1;
  }

  let target: "active" | "staging" | "cold";
  if (direction === "install" || direction === "promote") {
    if (current.where === "active") {
      print(c.dim(`${name} already in active store.`));
      return 0;
    }
    target = current.where === "cold" ? "staging" : "active";
    if (direction === "install") target = "active";
  } else {
    if (current.where === "cold") {
      print(c.dim(`${name} already in cold storage.`));
      return 0;
    }
    target = current.where === "active" ? "staging" : "cold";
    if (skill.protected && !force) {
      print(c.red(`✗ ${name} is protected.`) + ` Use --force to demote anyway.`);
      return 1;
    }
  }

  const targetRoot = target === "active" ? PATHS.active : target === "staging" ? PATHS.staging : PATHS.cold;
  const targetDir = join(targetRoot, name);

  if (existsSync(targetDir)) {
    print(c.red(`✗ Target already exists: ${targetDir}`));
    return 1;
  }

  print(c.bold(`${direction}:`) + ` ${name}  ${c.cyan(current.where)} → ${c.cyan(target)}`);
  print(c.dim(`  from: ${current.path}`));
  print(c.dim(`  to:   ${targetDir}`));

  if (dryRun) {
    print(c.dim("(dry-run; nothing moved)"));
    return 0;
  }

  await mkdir(targetRoot, { recursive: true });
  await rename(current.path, targetDir);
  print(c.green("✓") + ` Moved.`);
  print(c.dim("  Run `toolbelt skills reindex` to update the index."));
  return 0;
}

function locate(name: string): { path: string; where: "active" | "staging" | "cold" } | null {
  const active = join(PATHS.active, name);
  if (existsSync(active)) return { path: active, where: "active" };
  const staging = join(PATHS.staging, name);
  if (existsSync(staging)) return { path: staging, where: "staging" };
  const cold = join(PATHS.cold, name);
  if (existsSync(cold)) return { path: cold, where: "cold" };
  return null;
}
