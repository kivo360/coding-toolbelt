import { readdir, stat, rm } from "node:fs/promises";
import { existsSync, lstatSync, readlinkSync } from "node:fs";
import { join } from "node:path";
import type { DoctorIssue } from "../../types";
import { PATHS } from "../../lib/paths";
import { c, print } from "../../lib/output";

export async function runDoctor(args: string[]): Promise<number> {
  const fix = args.includes("--fix");
  const json = args.includes("--json");
  const issues: DoctorIssue[] = [];

  await checkBrokenSymlinks(PATHS.active, issues);
  for (const root of PATHS.symlinkRoots) {
    await checkBrokenSymlinks(root, issues);
  }
  await checkMissingSkillMd(PATHS.active, issues);
  await checkStrayCaches(PATHS.active, issues);
  await checkExternalSymlinks(PATHS.active, issues);

  if (json) {
    print(JSON.stringify({ issues, fix }, null, 2));
    return issues.some((i) => i.severity === "error") ? 1 : 0;
  }

  if (issues.length === 0) {
    print(c.green("✓") + " No issues found across " + [PATHS.active, ...PATHS.symlinkRoots].join(", "));
    return 0;
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warn");
  const infos = issues.filter((i) => i.severity === "info");

  print(c.bold(`Doctor found ${issues.length} issues  `) + c.dim(`(${errors.length} errors, ${warns.length} warnings, ${infos.length} info)`));
  print();

  for (const issue of issues) {
    const icon =
      issue.severity === "error" ? c.red("✗") : issue.severity === "warn" ? c.yellow("!") : c.blue("·");
    print(`${icon} ${c.bold(issue.kind)}  ${c.dim(issue.path)}`);
    print(`  ${issue.detail}`);
    if (issue.fix) {
      print(c.dim(`  fix: ${issue.fix}`));
    }
  }

  if (fix) {
    print();
    print(c.bold("Applying safe fixes..."));
    let fixed = 0;
    for (const issue of issues) {
      const ok = await applyFix(issue);
      if (ok) {
        fixed++;
        print(c.green(`  ✓ ${issue.kind}`) + c.dim(` ${issue.path}`));
      }
    }
    print(c.green(`Fixed ${fixed} issues.`));
  } else if (issues.some((i) => i.fix)) {
    print();
    print(c.dim("Run with --fix to apply safe fixes (broken symlinks, stray caches)."));
  }

  return errors.length > 0 ? 1 : 0;
}

async function checkBrokenSymlinks(root: string, issues: DoctorIssue[]) {
  if (!existsSync(root)) return;
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(root, entry.name);
    let link;
    try {
      link = lstatSync(full);
    } catch {
      continue;
    }
    if (!link.isSymbolicLink()) continue;
    if (existsSync(full)) continue;
    let target = "?";
    try {
      target = readlinkSync(full);
    } catch {}
    issues.push({
      severity: "warn",
      kind: "broken-symlink",
      path: full,
      detail: `Symlink target missing: ${target}`,
      fix: `rm '${full}'`,
    });
  }
}

async function checkMissingSkillMd(root: string, issues: DoctorIssue[]) {
  if (!existsSync(root)) return;
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const dir = join(root, entry.name);
    if (!existsSync(dir)) continue;
    const skillMd = join(dir, "SKILL.md");
    if (!existsSync(skillMd)) {
      issues.push({
        severity: "warn",
        kind: "missing-skill-md",
        path: dir,
        detail: "Directory exists but has no SKILL.md",
      });
    }
  }
}

async function checkStrayCaches(root: string, issues: DoctorIssue[]) {
  if (!existsSync(root)) return;
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(root, entry.name);
    const stray = join(skillDir, "~");
    if (existsSync(stray)) {
      let size = "?";
      try {
        const s = await stat(stray);
        size = s.isDirectory() ? "(dir)" : `${s.size} bytes`;
      } catch {}
      issues.push({
        severity: "warn",
        kind: "stray-cache",
        path: stray,
        detail: `Literal '~' directory inside skill ${entry.name} ${size} — likely from unexpanded $HOME`,
        fix: `rm -rf '${stray}'`,
      });
    }
  }
}

async function checkExternalSymlinks(root: string, issues: DoctorIssue[]) {
  if (!existsSync(root)) return;
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(root, entry.name);
    let link;
    try {
      link = lstatSync(full);
    } catch {
      continue;
    }
    if (!link.isSymbolicLink()) continue;
    if (!existsSync(full)) continue;
    let target = "";
    try {
      target = readlinkSync(full);
    } catch {
      continue;
    }
    if (target.startsWith("/Users/") && !target.startsWith(root)) {
      issues.push({
        severity: "info",
        kind: "external-symlink",
        path: full,
        detail: `Skill is a symlink to external project: ${target}`,
      });
    }
  }
}

async function applyFix(issue: DoctorIssue): Promise<boolean> {
  if (!issue.fix) return false;
  if (issue.kind === "broken-symlink") {
    try {
      await rm(issue.path, { force: true });
      return true;
    } catch {
      return false;
    }
  }
  if (issue.kind === "stray-cache") {
    try {
      await rm(issue.path, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
