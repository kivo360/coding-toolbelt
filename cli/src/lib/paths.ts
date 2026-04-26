import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();

export const PATHS = {
  active: join(HOME, ".agents", "skills"),
  staging: join(HOME, ".agents", "skills-staging"),
  cold: join(HOME, ".agents", "skills-cold"),
  lock: join(HOME, ".agents", ".skill-lock.json"),
  index: join(HOME, ".agents", "skills-index.json"),
  telemetry: join(HOME, ".agents", "telemetry", "events.ndjson"),
  symlinkRoots: [
    join(HOME, ".config", "opencode", "skills"),
    join(HOME, ".claude", "skills"),
  ],
} as const;

export const PROTECTED_SKILLS = new Set<string>([
  "gstack",
  "creating-opencode-extensions",
  "oh-my-openagent",
  "find-skills",
  // Anthropic official skills (from anthropics/skills source)
  "docx",
  "pptx",
  "xlsx",
  "pdf",
  "skill-creator",
]);

export const PROTECTED_FAMILIES = [
  /^ads(-|$)/,
  /^better-auth(-|$)/,
];

export function isProtected(name: string): boolean {
  if (PROTECTED_SKILLS.has(name)) return true;
  return PROTECTED_FAMILIES.some((re) => re.test(name));
}
