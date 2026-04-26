import type { SkillEntry, SkillsIndex, SuggestMatch } from "../types";
import { expandSynonyms, FAMILY_ORCHESTRATORS } from "./synonyms";

const STOP_WORDS = new Set([
  // grammatical
  "the", "and", "for", "with", "that", "from", "this", "into", "onto",
  "have", "has", "had", "are", "was", "were", "but", "any", "all",
  "you", "your", "yours", "they", "them", "their", "our", "his", "her",
  "my", "me", "we", "us",
  "to", "of", "in", "on", "at", "by", "as", "is", "be", "been", "being",
  "im", "ive", "ill", "id", "youre", "weve", "well", "youd", "wed", "ya",
  // generic verbs (intent-bearing but too noisy alone)
  "use", "using", "used", "uses",
  "make", "made", "making", "makes",
  "do", "doing", "done", "did", "does",
  "go", "going", "went", "gone", "goes",
  "want", "wants", "wanted", "wanting",
  "need", "needs", "needed", "needing",
  "try", "tried", "trying", "tries",
  "help", "helps", "helped", "helping",
  "get", "gets", "got", "getting", "gotten",
  "let", "lets", "letting",
  "think", "thought", "thinking", "thinks",
  "know", "knew", "knows", "known", "knowing",
  "take", "took", "taking", "taken", "takes",
  "find", "found", "finds", "finding",
  "give", "gave", "given", "giving", "gives",
  "show", "showed", "showing", "shown", "shows",
  "say", "said", "saying", "says",
  "see", "seen", "seeing", "sees", "saw",
  "look", "looked", "looking", "looks",
  // verbs that collide with skill names — drop unless paired
  "push", "pushed", "pushing", "pushes",
  "design", "designs", "designed", "designing", "designer",
  "build", "builds", "built", "building",
  "save", "saves", "saved", "saving",
  "load", "loads", "loaded", "loading",
  "work", "works", "worked", "working",
  "send", "sends", "sent", "sending",
  "open", "opens", "opened", "opening",
  "create", "creates", "created", "creating",
  "add", "adds", "added", "adding",
  "remove", "removes", "removed", "removing",
  "set", "sets", "setting",
  "update", "updates", "updated", "updating",
  "change", "changes", "changed", "changing",
  // pronouns / fillers
  "can", "could", "would", "should", "might", "may", "must", "will", "shall",
  "really", "just", "now", "then", "than", "still", "yet", "very", "quite",
  "what", "when", "where", "why", "how", "who", "which", "whom", "whose",
  "some", "more", "most", "less", "much", "many", "few", "lot", "lots",
  "yes", "no", "ok", "okay", "sure", "right", "good", "bad", "great",
  "yeah", "nope", "hey", "hi", "hello",
  // negation/conditional (tracked separately for negation logic)
  "not", "never", "without", "if", "unless", "neither", "nor",
  // tense
  "yesterday", "today", "tomorrow", "soon", "later", "always", "sometimes", "ago",
  // generic project nouns that appear in many descriptions
  "code", "file", "files", "thing", "things", "stuff", "way", "time",
  "feature", "features", "version", "issue", "issues",
  "user", "users", "team", "teams",
]);

const NEGATION_TOKENS = new Set(["not", "never", "no", "without", "skip", "avoid", "ignore"]);

/**
 * Skill-name parts that are too generic to anchor a match on their own.
 * If a name-token-only hit is one of these, treat it as a description-level
 * (weak) signal rather than a strong name anchor.
 */
export const WEAK_NAME_TOKENS = new Set([
  "best", "practices", "guidelines", "patterns", "complete", "review",
  "system", "systems", "management", "exception", "exceptions",
  "returns", "return", "production", "scheduling",
  "compliance", "tracking",
  "service", "services", "library", "framework",
  "audit", "check", "checks", "guide", "guides",
  "api", "apis",
  "data", "info", "core", "common", "main",
  "tools", "tool", "helpers", "helper", "utils", "util",
  "test", "tests", "testing",
  "design", "designs",
  "future", "past", "present",
  "pattern", "patterns",
]);

function stem(word: string): string {
  if (word.length <= 4) return word;
  if (word.endsWith("ies") && word.length > 5) return word.slice(0, -3) + "y";
  if (word.endsWith("ied") && word.length > 5) return word.slice(0, -3) + "y";
  // Doubled consonant + ing/ed: shipping → ship, shipped → ship, tagged → tag
  const doubledIng = word.match(/^(.+?)([bdgnptz])\2ing$/);
  if (doubledIng && doubledIng[1].length >= 2) return doubledIng[1] + doubledIng[2];
  const doubledEd = word.match(/^(.+?)([bdgnptz])\2ed$/);
  if (doubledEd && doubledEd[1].length >= 2) return doubledEd[1] + doubledEd[2];
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 5) return word.slice(0, -2);
  if (word.endsWith("es") && word.length > 5) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 4 && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function sanitizeQuery(text: string): string {
  let s = text;
  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`[^`]*`/g, " ");
  s = s.replace(/https?:\/\/\S+/g, " ");
  s = s.replace(/\b\/[\w\/.\-]+/g, " ");
  s = s.replace(/\{[\s\S]{0,200}?\}/g, " ");
  s = s.replace(/<[^>]+>/g, " ");
  return s;
}

function rawTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_./]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && t.length <= 40);
}

export function tokenize(text: string, opts: { withSynonyms?: boolean } = {}): string[] {
  const sanitized = sanitizeQuery(text);
  const raw = rawTokens(sanitized).filter((t) => !STOP_WORDS.has(t));
  const expanded = new Set<string>();
  const addToken = (t: string) => {
    if (t.length < 2 || STOP_WORDS.has(t)) return;
    expanded.add(t);
    const stemmed = stem(t);
    if (stemmed !== t) expanded.add(stemmed);
    if (opts.withSynonyms) {
      for (const syn of expandSynonyms(t)) expanded.add(syn);
      for (const syn of expandSynonyms(stemmed)) expanded.add(syn);
    }
  };
  for (const t of raw) {
    addToken(t);
    if (t.includes("-")) for (const p of t.split("-")) addToken(p);
    if (t.includes("_")) for (const p of t.split("_")) addToken(p);
    if (t.includes(".")) for (const p of t.split(".")) addToken(p);
  }
  return [...expanded];
}

/**
 * Find pairs of (negation-token, target-token) within window.
 * Returns the set of target tokens to suppress.
 */
export function detectNegatedTokens(text: string, windowSize = 5): Set<string> {
  const negated = new Set<string>();
  const tokens = rawTokens(sanitizeQuery(text));
  for (let i = 0; i < tokens.length; i++) {
    if (NEGATION_TOKENS.has(tokens[i])) {
      for (let j = i + 1; j < Math.min(i + 1 + windowSize, tokens.length); j++) {
        if (NEGATION_TOKENS.has(tokens[j])) break;
        negated.add(tokens[j]);
        negated.add(stem(tokens[j]));
      }
    }
  }
  return negated;
}

export function matchScore(
  skill: SkillEntry,
  queryTokens: string[],
  negated: Set<string> = new Set()
): { score: number; matched: string[]; hasNameOrTrigger: boolean } {
  if (queryTokens.length === 0) return { score: 0, matched: [], hasNameOrTrigger: false };
  const matched = new Set<string>();
  let score = 0;
  let hasNameOrTrigger = false;

  const nameTokens = new Set<string>();
  const weakNameTokens = new Set<string>();
  for (const t of tokenize(skill.name)) {
    if (WEAK_NAME_TOKENS.has(t)) {
      weakNameTokens.add(t);
      weakNameTokens.add(stem(t));
    } else {
      nameTokens.add(t);
      nameTokens.add(stem(t));
    }
  }
  for (const part of skill.name.split(/[-_.]/)) {
    const lower = part.toLowerCase();
    if (lower.length < 2 || STOP_WORDS.has(lower)) continue;
    if (WEAK_NAME_TOKENS.has(lower)) {
      weakNameTokens.add(lower);
      weakNameTokens.add(stem(lower));
    } else {
      nameTokens.add(lower);
      nameTokens.add(stem(lower));
    }
  }

  const descTokens = new Set<string>();
  for (const t of tokenize(skill.description)) {
    descTokens.add(t);
    descTokens.add(stem(t));
  }

  const triggerTokens = new Set<string>();
  for (const trig of skill.triggers) {
    for (const t of tokenize(trig)) {
      if (WEAK_NAME_TOKENS.has(t)) {
        weakNameTokens.add(t);
        weakNameTokens.add(stem(t));
      } else {
        triggerTokens.add(t);
        triggerTokens.add(stem(t));
      }
    }
  }

  for (const q of queryTokens) {
    if (negated.has(q) || negated.has(stem(q))) continue;
    const qStem = stem(q);

    if (skill.name === q || skill.name === qStem) {
      score += 30;
      matched.add(q);
      hasNameOrTrigger = true;
      continue;
    }
    if (nameTokens.has(q) || nameTokens.has(qStem)) {
      score += 12;
      matched.add(q);
      hasNameOrTrigger = true;
      continue;
    }
    if (triggerTokens.has(q) || triggerTokens.has(qStem)) {
      score += 8;
      matched.add(q);
      hasNameOrTrigger = true;
      continue;
    }
    if (weakNameTokens.has(q) || weakNameTokens.has(qStem)) {
      score += 2;
      matched.add(q);
      continue;
    }
    if (descTokens.has(q) || descTokens.has(qStem)) {
      score += 2;
      matched.add(q);
      continue;
    }
  }

  return { score, matched: [...matched], hasNameOrTrigger };
}

export interface FindOpts {
  minScore?: number;
  limit?: number;
  tiers?: Set<string>;
  requireNameOrTrigger?: boolean;
}

export function findMatches(
  index: SkillsIndex,
  query: string,
  opts: FindOpts = {}
): SuggestMatch[] {
  const minScore = opts.minScore ?? 8;
  const limit = opts.limit ?? 10;
  const requireNameOrTrigger = opts.requireNameOrTrigger ?? true;
  const queryTokens = tokenize(query, { withSynonyms: true });
  const negated = detectNegatedTokens(query);
  const matches: SuggestMatch[] = [];

  for (const [name, skill] of Object.entries(index.skills)) {
    if (opts.tiers && !opts.tiers.has(skill.tier)) continue;
    const { score, matched, hasNameOrTrigger } = matchScore(skill, queryTokens, negated);
    if (score < minScore) continue;
    if (requireNameOrTrigger && !hasNameOrTrigger) continue;
    matches.push({
      name,
      tier: skill.tier,
      description: skill.description,
      confidence: Math.min(1, score / 30),
      matched,
      installedPath: skill.installedPath,
    });
  }

  applyFamilyOrchestratorBoost(matches, index, opts.tiers);
  matches.sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name));
  return matches.slice(0, limit);
}

/**
 * If 2+ skills from a family are matched, also surface the family's
 * orchestrator (e.g. better-auth-complete, ads) at boosted confidence.
 * Helps when the user phrases an umbrella concept and we'd otherwise
 * surface only specific siblings.
 */
function applyFamilyOrchestratorBoost(
  matches: SuggestMatch[],
  index: SkillsIndex,
  tiers?: Set<string>
): void {
  const familyHits = new Map<string, number>();
  for (const m of matches) {
    for (const prefix of Object.keys(FAMILY_ORCHESTRATORS)) {
      if (m.name === FAMILY_ORCHESTRATORS[prefix]) continue;
      if (m.name === prefix || m.name.startsWith(prefix + "-")) {
        familyHits.set(prefix, (familyHits.get(prefix) ?? 0) + 1);
        break;
      }
    }
  }

  for (const [prefix, count] of familyHits) {
    if (count < 2) continue;
    const orchestrator = FAMILY_ORCHESTRATORS[prefix];
    if (matches.some((m) => m.name === orchestrator)) continue;
    const skill = index.skills[orchestrator];
    if (!skill) continue;
    if (tiers && !tiers.has(skill.tier)) continue;
    matches.push({
      name: orchestrator,
      tier: skill.tier,
      description: skill.description,
      confidence: Math.min(0.85, 0.5 + count * 0.1),
      matched: [`<${prefix}-family>`],
      installedPath: skill.installedPath,
    });
  }
}
