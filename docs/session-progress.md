# Session Progress — Skills Ecosystem Build

> Date: 2026-03-28
> Session: Built complete skills ecosystem from scratch in one session

## What Was Built

### Custom Skills (8 skills, ~6,900 lines, 63 files)

| Skill | Files | Lines | Purpose |
|-------|-------|-------|---------|
| `eval-driven-dev` | 7 | 655 | 7-stage workflow: Discover → Explore → Spec → Eval → Implement → Verify → Iterate |
| `saas-bootstrap` | 5 | 582 | Project detection, skill installation, config scaffolding, credential automation |
| `my-stack` | 7 | 495 | Master router for all 29 skills by task |
| `dogfood-complete` | 14 | 1,294 | Unified QA + Playwright test gen via agent-browser |
| `better-auth-complete` | 13 | 1,824 | Meta skill routing 9 auth skills |
| `better-auth-test-utils` | 9 | 977 | Test factories, getCookies, OTP capture |
| `better-auth-ui` | 7 | 1,062 | @daveyplate/better-auth-ui shadcn components |
| `linter-loop-escalation` | — | — | From parallel session: 4-tier error loop detection |

### Third-Party Skills Installed (18 skills)

| Skill | Source | Installs |
|-------|--------|----------|
| `agent-browser` | vercel-labs | 124K |
| `playwright-best-practices` | currents-dev | — |
| `drizzle-orm` | bobmatnyc | 2.6K |
| `shadcn` | shadcn/ui | 49.3K |
| `turborepo` | vercel | 13.8K |
| `next-forge` | vercel | 67 |
| `stripe-best-practices` | stripe/ai | 3.9K |
| `resend` | resend | 4.4K |
| `react-email` | resend | 3.7K |
| `sentry-fix-issues` | getsentry | 1.1K |
| `posthog-instrumentation` | posthog | 493 |
| `better-auth-best-practices` | better-auth | — |
| `better-auth-security-best-practices` | better-auth | — |
| `create-auth-skill` | better-auth | — |
| `email-and-password-best-practices` | better-auth | — |
| `organization-best-practices` | better-auth | — |
| `two-factor-authentication-best-practices` | better-auth | — |
| `find-skills` | — | — |

### From Parallel Sessions (4 skills)

| Skill | Purpose |
|-------|---------|
| `agent-evaluation` | Anthropic's eval framework for AI agents |
| `eval-harness` | Formal eval framework for EDD principles |
| `eval-pipeline` | Unified pipeline combining eval-harness + agent-evaluation |
| `linter-loop-escalation` | 4-tier escalation for stuck linter loops |

### GitHub Repo

- **URL**: https://github.com/kivo360/skills
- **Local**: ~/Coding/Tooling/skills/
- **Install**: `npx skills add kivo360/skills`

## Key Design Decisions

1. **agent-browser over dev-browser** — Vercel's Rust CLI has video recording, annotated screenshots, console errors, semantic locators. dev-browser was removed.
2. **Lightpanda removed** — No screenshot support (headless only, no rendering engine). All browser work uses Chromium via agent-browser.
3. **Better Auth test-utils getCookies()** — The mechanism for Playwright tests to skip login UI and inject auth state directly.
4. **@refs bridge QA and test gen** — agent-browser's `snapshot -i` produces @eN refs that appear in annotated screenshots AND derive directly into Playwright `getByRole()` selectors.
5. **eval-driven-dev is strong nudge** — Not hard block. Agents are pressured to follow the 7-stage workflow but can override with explicit justification.
6. **Fuzzy evals use screenshot + LLM-as-judge** — Configurable rubrics for UI quality assessment.
7. **All auth imports through @repo/auth/client** — Never import @daveyplate/better-auth-ui directly from apps (avoids pnpm dual-instance issues).
8. **Bun with hoisted node_modules** — omoios-forge uses bunfig.toml with node-linker = "hoisted" and tightened trustedDependencies.

## What's NOT Done Yet

- [ ] Phase 2: Project-specific setup skills for omoios-forge
- [ ] Phase 3: Actually running tests against omoios-forge
- [ ] Expanding thin reference files (my-stack, eval-driven-dev refs are skeleton-weight)
- [ ] Vercel deployment skill (none found)
- [ ] Skills for: Arcjet, Knock, Liveblocks, Svix, Upstash, BaseHub, BetterStack, Vitest
- [ ] Reconciling omoios-forge's 168-eval system with eval-driven-dev
- [ ] Writing actual Playwright .spec.ts files (zero exist in omoios-forge)
- [ ] Running the 7 test prompts against omoios-forge
