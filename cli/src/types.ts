export type Tier = "S" | "A" | "B" | "C";

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  triggers?: string[];
  tier?: Tier;
  "preamble-tier"?: number;
  "allowed-tools"?: string[];
  version?: string;
}

export interface SkillEntry {
  name: string;
  tier: Tier;
  description: string;
  triggers: string[];
  lines: number;
  totalFiles: number;
  hasScripts: boolean;
  hasReferences: boolean;
  hasTemplates: boolean;
  hasBin: boolean;
  hasAssets: boolean;
  modifiedAt: string;
  installedPath: string | null;
  coldPath: string | null;
  stagingPath: string | null;
  lockTracked: boolean;
  source?: string;
  deprecatedInFavorOf?: string;
  protected: boolean;
}

export interface SkillsIndex {
  version: string;
  generated: string;
  paths: {
    active: string;
    staging: string;
    cold: string;
    lock: string;
  };
  tiers: Record<Tier, string[]>;
  skills: Record<string, SkillEntry>;
}

export interface DoctorIssue {
  severity: "error" | "warn" | "info";
  kind:
    | "broken-symlink"
    | "missing-skill-md"
    | "stray-cache"
    | "orphan-symlink"
    | "duplicate-twin"
    | "external-symlink"
    | "malformed-frontmatter";
  path: string;
  detail: string;
  fix?: string;
}

export interface SuggestMatch {
  name: string;
  tier: Tier;
  description: string;
  confidence: number;
  matched: string[];
  installedPath: string | null;
}
