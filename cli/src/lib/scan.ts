import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync, lstatSync, readlinkSync } from "node:fs";
import { join } from "node:path";
import type { SkillEntry, Tier } from "../types";
import { PATHS, isProtected } from "./paths";
import { parseFrontmatter } from "./frontmatter";

export interface RawScan {
  name: string;
  dir: string;
  tier: Tier;
  source: "active" | "staging" | "cold";
}

const DEFAULT_S_TIER = new Set([
  "gstack",
  "ship",
  "qa",
  "review",
  "investigate",
  "design-review",
  "browse",
  "autoplan",
  "context-save",
  "context-restore",
  "codex",
  "ck",
  "my-stack",
  "naming-conventions",
  "coding-standards",
  "find-skills",
  "skill-creator",
  "creating-opencode-extensions",
  "oh-my-openagent",
]);

const DEFAULT_A_TIER = new Set([
  "better-auth-complete",
  "tdd-workflow",
  "e2e-testing",
  "playwright-best-practices",
  "vitest",
  "frontend-dev-guidelines",
  "frontend-patterns",
  "backend-dev-guidelines",
  "backend-patterns",
  "api-design",
  "database-migrations",
  "error-tracking",
  "security-review",
  "cso",
  "git-workflow",
  "claude-api",
  "eval-pipeline",
  "health",
  "canary",
  "land-and-deploy",
  "office-hours",
  "retro",
  "deep-docs",
  "architecture-decision-records",
  "route-tester",
  "react-email",
  "resend",
  "shadcn",
  "page-scaffolder",
  "turborepo",
  "dev-server",
  "next-forge",
  "drizzle-orm",
  "postgres-patterns",
  "posthog-instrumentation",
  "sentry-fix-issues",
  "stripe-best-practices",
  "documentation-lookup",
  "deep-research",
  "handoff",
  "estimate",
  "log-actual",
  "plan-ceo-review",
  "plan-design-review",
  "plan-devex-review",
  "plan-eng-review",
  "plan-tune",
]);

const DEFAULT_C_TIER = new Set([
  "smart-docs",
  "continuous-learning",
  "bun-runtime",
  "mcp-server-patterns",
  "careful",
  "guard",
  "nanoclaw-repl",
  "project-guidelines-example",
  "configure-ecc",
]);

export function defaultTier(name: string): Tier {
  if (DEFAULT_S_TIER.has(name)) return "S";
  if (DEFAULT_A_TIER.has(name)) return "A";
  if (DEFAULT_C_TIER.has(name)) return "C";
  if (name.startsWith("gstack-")) return "C";
  return "B";
}

export async function listSkillDirs(root: string): Promise<RawScan[]> {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const out: RawScan[] = [];
  const sourceLabel = root === PATHS.active ? "active" : root === PATHS.staging ? "staging" : "cold";
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isSymbolicLink()) {
      try {
        const target = readlinkSync(full);
        const resolved = target.startsWith("/") ? target : join(root, target);
        if (!existsSync(resolved)) continue;
      } catch {
        continue;
      }
    }
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const skillMd = join(full, "SKILL.md");
    if (!existsSync(skillMd)) continue;
    out.push({
      name: entry.name,
      dir: full,
      tier: defaultTier(entry.name),
      source: sourceLabel,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export async function scanSkill(scan: RawScan, lockTracked: Set<string>, lockSources: Map<string, string>): Promise<SkillEntry> {
  const skillMd = join(scan.dir, "SKILL.md");
  let raw = "";
  try {
    raw = await readFile(skillMd, "utf8");
  } catch {
    raw = "";
  }
  const lines = raw ? raw.split(/\r?\n/).length : 0;
  const { frontmatter } = parseFrontmatter(raw);

  const totalFiles = await countFiles(scan.dir);
  const hasScripts = existsSync(join(scan.dir, "scripts"));
  const hasReferences =
    existsSync(join(scan.dir, "references")) || existsSync(join(scan.dir, "reference"));
  const hasTemplates =
    existsSync(join(scan.dir, "templates")) || existsSync(join(scan.dir, "samples")) || existsSync(join(scan.dir, "examples"));
  const hasBin = existsSync(join(scan.dir, "bin"));
  const hasAssets = existsSync(join(scan.dir, "assets"));

  let modifiedAt = "unknown";
  try {
    const s = await stat(skillMd);
    modifiedAt = s.mtime.toISOString().slice(0, 10);
  } catch {}

  const tier = (frontmatter.tier as Tier | undefined) ?? scan.tier;
  const triggers = Array.isArray(frontmatter.triggers)
    ? frontmatter.triggers.map(String)
    : extractTriggers(frontmatter.description ?? "", scan.name);

  return {
    name: scan.name,
    tier,
    description: cleanDescription(frontmatter.description ?? ""),
    triggers,
    lines,
    totalFiles,
    hasScripts,
    hasReferences,
    hasTemplates,
    hasBin,
    hasAssets,
    modifiedAt,
    installedPath: scan.source === "active" ? scan.dir : null,
    coldPath: scan.source === "cold" ? scan.dir : null,
    stagingPath: scan.source === "staging" ? scan.dir : null,
    lockTracked: lockTracked.has(scan.name),
    source: lockSources.get(scan.name),
    protected: isProtected(scan.name),
  };
}

async function countFiles(dir: string): Promise<number> {
  let count = 0;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop()!;
    let entries;
    try {
      entries = await readdir(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = join(cur, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        stack.push(full);
      } else {
        count++;
      }
    }
  }
  return count;
}

function cleanDescription(desc: string): string {
  return desc.replace(/\s+/g, " ").trim().slice(0, 500);
}

function extractTriggers(description: string, name: string): string[] {
  const tokens = new Set<string>();
  tokens.add(name);
  for (const part of name.split("-")) tokens.add(part);
  const useWhen = description.match(/use when (?:user says |the user (?:says|wants|asks))?([^.]*)/i);
  if (useWhen) {
    for (const t of useWhen[1].split(/[,;]/)) {
      const trimmed = t.trim().toLowerCase();
      if (trimmed && trimmed.length < 60) tokens.add(trimmed);
    }
  }
  return [...tokens].slice(0, 12);
}

export async function loadLockSources(): Promise<{ tracked: Set<string>; sources: Map<string, string> }> {
  const tracked = new Set<string>();
  const sources = new Map<string, string>();
  if (!existsSync(PATHS.lock)) return { tracked, sources };
  try {
    const raw = await readFile(PATHS.lock, "utf8");
    const data = JSON.parse(raw) as { skills?: Record<string, { source?: string }> };
    if (data.skills) {
      for (const [name, meta] of Object.entries(data.skills)) {
        tracked.add(name);
        if (meta?.source) sources.set(name, meta.source);
      }
    }
  } catch {}
  return { tracked, sources };
}
