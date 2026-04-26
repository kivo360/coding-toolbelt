/**
 * Layer 0.5 — cheap heuristic boosts that run between the keyword
 * matcher and any embedding fallback.
 *
 * Each rule fires when a specific signal appears in the prompt:
 *   - file paths      → identify project type, surface scaffolders
 *   - tool mentions   → suggest skills tied to that tool
 *   - file extensions → boost language-aware skills
 *   - domain phrases  → push umbrella skills (auth/payments/billing)
 *
 * Rules are intentionally simple: a regex/keyword test produces a
 * structured `Boost` of (skill_name → score_addition). The hybrid
 * matcher folds these into the keyword scores before any embedding
 * work, so most prompts never need Layer 1.
 *
 * Every rule lists the skill names it can boost. Adding a new rule
 * is a one-place change, no other coupling required.
 */

export interface ContextBoost {
  /** Skill name → additive boost (typically 4–10 keyword points). */
  boosts: Record<string, number>;
  /** Reason strings, surfaced in the `matched` array for transparency. */
  reasons: string[];
}

export interface ContextRule {
  id: string;
  description: string;
  /** Return true if the prompt matches the rule. */
  test: (lowerPrompt: string, raw: string) => boolean;
  /** Skill names → additive score (typically 4-10). */
  boosts: Record<string, number>;
  /**
   * The "primary" token this rule keys off (e.g. "stripe", "vitest").
   * If this token appears in the negated set, the rule does NOT fire,
   * preventing "I'm not using stripe" from boosting stripe skills.
   */
  primaryToken?: string;
}

/**
 * Important: every name in `boosts` must exist as a real skill in the
 * index. Missing names are dropped silently in `applyContextRules`,
 * but it's bad hygiene to ship dead boosts.
 */
export const CONTEXT_RULES: ContextRule[] = [
  // ── Tool mentions ────────────────────────────────────────────────
  {
    id: "tool:gstack",
    description: "References gstack pipeline / harness",
    test: (p) => /\bgstack\b/.test(p),
    primaryToken: "gstack",
    boosts: { gstack: 8, ship: 4, qa: 4, review: 4 },
  },
  {
    id: "tool:vitest",
    description: "vitest / vite test runner",
    test: (p) => /\bvitest\b/.test(p) || /\bvite[-\s]?test\b/.test(p),
    primaryToken: "vitest",
    boosts: { vitest: 10, "tdd-workflow": 4 },
  },
  {
    id: "tool:playwright",
    description: "Playwright e2e / browser tests",
    test: (p) => /\bplaywright\b/.test(p),
    primaryToken: "playwright",
    boosts: { "playwright-best-practices": 10, "e2e-testing": 6 },
  },
  {
    id: "tool:turborepo",
    description: "turbo / turborepo monorepo tooling",
    test: (p) => /\bturbo(repo)?\b/.test(p) || /\bturbo\.json\b/.test(p),
    primaryToken: "turbo",
    boosts: { turborepo: 10 },
  },
  {
    id: "tool:bun",
    description: "Bun runtime",
    // Allow `bun + bundle` co-occurrence — that's the canonical use case.
    // Reject `bun` only when it's clearly the verb sense ("bun bun").
    test: (p) => /\bbun\b/.test(p),
    primaryToken: "bun",
    boosts: { "bun-runtime": 14 },
  },
  {
    id: "tool:drizzle",
    description: "Drizzle ORM",
    test: (p) => /\bdrizzle\b/.test(p),
    primaryToken: "drizzle",
    boosts: { "drizzle-orm": 10, "database-migrations": 4 },
  },
  {
    id: "tool:posthog",
    description: "PostHog analytics",
    test: (p) => /\bposthog\b/.test(p),
    primaryToken: "posthog",
    boosts: { "posthog-instrumentation": 10 },
  },
  {
    id: "tool:sentry",
    description: "Sentry error tracking",
    test: (p) => /\bsentry\b/.test(p),
    primaryToken: "sentry",
    boosts: { "sentry-fix-issues": 10, "error-tracking": 4 },
  },
  {
    id: "tool:resend",
    description: "Resend transactional email",
    test: (p) => /\bresend\b/.test(p) || /\breact[-\s]?email\b/.test(p),
    primaryToken: "resend",
    boosts: { resend: 8, "react-email": 6 },
  },
  {
    id: "tool:shadcn",
    description: "shadcn/ui component library",
    test: (p) => /\bshadcn\b/.test(p),
    primaryToken: "shadcn",
    boosts: { shadcn: 10 },
  },
  {
    id: "tool:next",
    description: "Next.js / next-forge",
    test: (p) => /\bnext[-\s]?(js|forge)\b/.test(p) || /\bnextjs\b/.test(p),
    primaryToken: "next",
    boosts: { "next-forge": 8 },
  },
  {
    id: "tool:better-auth",
    description: "better-auth library",
    test: (p) => /\bbetter[-\s]?auth\b/.test(p),
    primaryToken: "auth",
    boosts: { "better-auth-complete": 10 },
  },
  {
    id: "tool:stripe",
    description: "Stripe payments",
    test: (p) =>
      /\bstripe\b/.test(p) ||
      /\bcheckout\s+session\b/.test(p) ||
      /\bpayment[-\s]?intent\b/.test(p),
    primaryToken: "stripe",
    boosts: { "stripe-best-practices": 10 },
  },
  {
    id: "tool:postgres",
    description: "Postgres / SQL",
    test: (p) => /\bpostgres(ql)?\b/.test(p) || /\bpg\b/.test(p) || /\brls\b/.test(p),
    primaryToken: "postgres",
    boosts: { "postgres-patterns": 14 },
  },

  // ── Domain phrases ──────────────────────────────────────────────
  {
    id: "domain:auth",
    description: "Authentication concepts",
    test: (p) =>
      /\b(login|signin|signup|sign[-\s]?in|sign[-\s]?up|sso|magic[-\s]?link|session)\b/.test(p),
    primaryToken: "auth",
    boosts: { "better-auth-complete": 6 },
  },
  {
    id: "domain:billing",
    description: "Billing / subscriptions",
    test: (p) =>
      /\b(subscription|recurring|invoice|billing|paywall|upgrade|downgrade)\b/.test(p),
    primaryToken: "subscription",
    boosts: { "stripe-best-practices": 6 },
  },
  {
    id: "domain:payment",
    description: "Payment processing flows",
    test: (p) => /\bpayment(s)?\s+(processing|flow|flows|integration|method|methods)\b/.test(p),
    primaryToken: "payment",
    boosts: { "stripe-best-practices": 8 },
  },
  {
    id: "domain:webhook",
    description: "Webhook handling",
    test: (p) => /\bwebhook(s)?\b/.test(p),
    primaryToken: "webhook",
    boosts: { "stripe-best-practices": 4 },
  },
  {
    id: "domain:tdd",
    description: "Testing intent",
    test: (p) =>
      /\b(unit|integration|e2e)\s*(test|tests|testing)\b/.test(p) ||
      /\b(tdd|test[-\s]?driven)\b/.test(p),
    primaryToken: "test",
    boosts: { "tdd-workflow": 6, vitest: 4 },
  },
  {
    id: "domain:e2e-api",
    description: "End-to-end API testing",
    test: (p) =>
      (/\bend[-\s]?to[-\s]?end\b/.test(p) || /\be2e\b/.test(p)) &&
      /\b(api|endpoint|endpoints|route|routes)\b/.test(p),
    primaryToken: "e2e",
    boosts: { "e2e-testing": 8, "playwright-best-practices": 6 },
  },
  {
    id: "domain:migration",
    description: "Database migrations",
    test: (p) => /\bmigration(s)?\b/.test(p) && /\b(db|database|schema|sql|table)\b/.test(p),
    primaryToken: "migration",
    boosts: { "database-migrations": 8, "drizzle-orm": 4 },
  },
  {
    id: "domain:db-schema",
    description: "Database schema design",
    test: (p) => /\b(database|db)\s+schema\b/.test(p) || /\bschema\s+design\b/.test(p),
    primaryToken: "schema",
    boosts: { "postgres-patterns": 14, "api-design": 12, "database-migrations": 6 },
  },
  {
    id: "domain:pr-review",
    description: "PR/code review",
    test: (p) =>
      /\bpr\s*review\b/.test(p) ||
      /\bcode\s*review\b/.test(p) ||
      /\breview(ing)?\s+(this|the|my)\s+(pr|diff|change)/.test(p),
    primaryToken: "review",
    boosts: { review: 6, "security-review": 4 },
  },

  // ── Project paths ───────────────────────────────────────────────
  {
    id: "path:coding-dir",
    description: "References ~/Coding directory",
    test: (_p, raw) => /[~/]Coding\//.test(raw),
    boosts: {},
  },

  // ── File extensions / config files ──────────────────────────────
  {
    id: "ext:tsx",
    description: "React/TSX files",
    test: (_p, raw) => /\.tsx\b/.test(raw),
    boosts: { "frontend-patterns": 4, shadcn: 3 },
  },
  {
    id: "ext:py",
    description: "Python files",
    test: (_p, raw) => /\.py\b/.test(raw),
    boosts: {},
  },
  {
    id: "config:turbo",
    description: "turbo.json config",
    test: (_p, raw) => /turbo\.json/.test(raw),
    boosts: { turborepo: 8 },
  },
  {
    id: "config:next",
    description: "next.config",
    test: (_p, raw) => /next\.config\.(js|ts|mjs)/.test(raw),
    boosts: { "next-forge": 6 },
  },

  // ── Workflow phrases ────────────────────────────────────────────
  {
    id: "workflow:ship",
    description: "Shipping/deploying explicitly",
    test: (p) =>
      /\bship\s+(it|this|my|the)\b/.test(p) ||
      /\bdeploy\s+(this|it|my|the)\s+(to\s+)?prod/.test(p) ||
      /\bcut\s+a\s+release\b/.test(p),
    boosts: { ship: 6 },
  },
  {
    id: "workflow:qa",
    description: "QA-style test sweep",
    test: (p) => /\b(qa|quality)\s+(check|sweep|run|pass)\b/.test(p),
    boosts: { qa: 6 },
  },
  {
    id: "workflow:investigate",
    description: "Bug investigation",
    test: (p) =>
      /\binvestigat(e|ing)\b/.test(p) ||
      /\bdig\s+into\s+(this|the)\s+bug\b/.test(p) ||
      /\broot\s+cause\b/.test(p),
    boosts: { investigate: 6 },
  },
];

/**
 * Run all rules against a prompt and return aggregated boosts.
 * `validNames` filters out boosts that target skills not in the index.
 * `negated` (optional) suppresses rules whose primaryToken is negated
 * in the prompt (e.g. "I'm not using stripe").
 */
export function applyContextRules(
  rawPrompt: string,
  validNames: Set<string>,
  negated: Set<string> = new Set()
): ContextBoost {
  const lower = rawPrompt.toLowerCase();
  const boosts: Record<string, number> = {};
  const reasons: string[] = [];

  for (const rule of CONTEXT_RULES) {
    if (rule.primaryToken && negated.has(rule.primaryToken)) continue;
    let matched: boolean;
    try {
      matched = rule.test(lower, rawPrompt);
    } catch {
      matched = false;
    }
    if (!matched) continue;
    let firedAny = false;
    for (const [name, score] of Object.entries(rule.boosts)) {
      if (!validNames.has(name)) continue;
      boosts[name] = (boosts[name] ?? 0) + score;
      firedAny = true;
    }
    if (firedAny || Object.keys(rule.boosts).length === 0) {
      reasons.push(rule.id);
    }
  }
  return { boosts, reasons };
}
