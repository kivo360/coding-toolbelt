/**
 * Bidirectional synonym map for query token expansion.
 *
 * Used by the matcher: when a query token is found in a synonym group,
 * the entire group is added to the token set so any skill whose
 * name/trigger contains a sibling synonym still matches.
 *
 * Keep groups small. Each addition costs trigger noise — only add when
 * the synonyms are unambiguous in the coding-agent context.
 */

export const SYNONYM_GROUPS: string[][] = [
  // Tight, unambiguous technical equivalences only.
  // Do NOT add synonyms that include common English words like "test" —
  // they flood matching with skill-name collisions.

  // OAuth variants — pure technical synonym
  ["oauth", "oauth2", "oauth-2", "oidc", "openid"],

  // Multi-factor authentication — pure technical synonym
  ["2fa", "mfa", "totp", "twofactor", "twofa"],

  // PR/MR — same concept across forges
  ["pr", "pullrequest", "pull-request", "mr", "merge-request"],

  // Monorepo concepts (workspace can collide; use cautiously)
  ["monorepo", "turborepo", "turbo"],
];

/**
 * Build a lookup map: token → group indexes that contain it.
 */
function buildSynonymIndex(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const group of SYNONYM_GROUPS) {
    const set = new Set(group.map((s) => s.toLowerCase()));
    for (const member of set) {
      const existing = map.get(member);
      if (existing) {
        for (const m of set) existing.add(m);
      } else {
        map.set(member, new Set(set));
      }
    }
  }
  return map;
}

const SYNONYM_INDEX = buildSynonymIndex();

/**
 * Expand a token to include all of its synonyms (lowercased).
 * Returns just the original token if no synonyms found.
 */
export function expandSynonyms(token: string): string[] {
  const lower = token.toLowerCase();
  const group = SYNONYM_INDEX.get(lower);
  if (!group) return [lower];
  return [...group];
}

/**
 * Detect if a query token is a "family hint" that should boost the
 * orchestrator skill of that family.
 */
export const FAMILY_ORCHESTRATORS: Record<string, string> = {
  "better-auth": "better-auth-complete",
  "ads": "ads",
  "gstack": "gstack",
  "ecc": "configure-ecc",
};
