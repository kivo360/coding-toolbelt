import type { SkillEntry, SkillsIndex, SuggestMatch } from "../types";

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "from", "this", "into",
  "have", "has", "are", "was", "but", "any", "all", "you", "your",
  "use", "using", "im", "ive", "ill",
]);

export function tokenize(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_./]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && t.length <= 40)
    .filter((t) => !STOP_WORDS.has(t));
  const expanded = new Set<string>(tokens);
  for (const t of tokens) {
    if (t.includes("-")) for (const p of t.split("-")) if (p.length >= 2) expanded.add(p);
    if (t.includes("_")) for (const p of t.split("_")) if (p.length >= 2) expanded.add(p);
    if (t.includes(".")) for (const p of t.split(".")) if (p.length >= 2) expanded.add(p);
  }
  return [...expanded];
}

export function matchScore(skill: SkillEntry, queryTokens: string[]): {
  score: number;
  matched: string[];
} {
  if (queryTokens.length === 0) return { score: 0, matched: [] };
  const matched = new Set<string>();
  let score = 0;

  const nameTokens = new Set(tokenize(skill.name));
  const descTokens = new Set(tokenize(skill.description));
  const triggerTokens = new Set(skill.triggers.flatMap(tokenize));

  for (const q of queryTokens) {
    if (skill.name === q) {
      score += 30;
      matched.add(q);
      continue;
    }
    if (nameTokens.has(q)) {
      score += 12;
      matched.add(q);
      continue;
    }
    if (triggerTokens.has(q)) {
      score += 8;
      matched.add(q);
      continue;
    }
    if (descTokens.has(q)) {
      score += 3;
      matched.add(q);
      continue;
    }
  }

  return { score, matched: [...matched] };
}

export function findMatches(
  index: SkillsIndex,
  query: string,
  opts: { minScore?: number; limit?: number; tiers?: Set<string> } = {}
): SuggestMatch[] {
  const minScore = opts.minScore ?? 4;
  const limit = opts.limit ?? 10;
  const queryTokens = tokenize(query);
  const matches: SuggestMatch[] = [];

  for (const [name, skill] of Object.entries(index.skills)) {
    if (opts.tiers && !opts.tiers.has(skill.tier)) continue;
    const { score, matched } = matchScore(skill, queryTokens);
    if (score < minScore) continue;
    matches.push({
      name,
      tier: skill.tier,
      description: skill.description,
      confidence: Math.min(1, score / 30),
      matched,
      installedPath: skill.installedPath,
    });
  }

  matches.sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name));
  return matches.slice(0, limit);
}
