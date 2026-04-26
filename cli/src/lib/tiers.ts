import type { Tier } from "../types";
import { PATHS } from "./paths";

export const TIER_ORDER: Tier[] = ["S", "A", "B", "C"];

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  S: "Eager-loaded daily drivers (always in active store)",
  A: "Load on stack/context match (active, indexed)",
  B: "Explicit-invocation only (active or staging)",
  C: "Cold storage — restored on demand",
};

export function tierStorage(tier: Tier): string {
  return tier === "C" ? PATHS.cold : PATHS.active;
}

export function downgrade(tier: Tier): Tier | null {
  const idx = TIER_ORDER.indexOf(tier);
  return idx >= 0 && idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

export function upgrade(tier: Tier): Tier | null {
  const idx = TIER_ORDER.indexOf(tier);
  return idx > 0 ? TIER_ORDER[idx - 1] : null;
}

export function isValidTier(s: string): s is Tier {
  return TIER_ORDER.includes(s as Tier);
}
