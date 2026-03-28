# Session Sync: Broadcast Prompt

> Paste this into OTHER sessions so they know what the skills ecosystem session built.
> Update the "Last updated" date when content changes.

Last updated: 2026-03-28

```
[CONTEXT FROM PARALLEL SESSION — Skills Ecosystem Build]

A parallel session built a complete skills ecosystem at github.com/kivo360/skills (public repo, ~/Coding/Tooling/skills/). Here's what exists now so you don't duplicate work or contradict it.

## What Was Built (8 public skills, 63 files, ~6,900 lines)

### eval-driven-dev
7-stage workflow enforcement: Discover (Socratic) → Explore → Spec → Eval (tests FIRST) → Implement → Verify → Iterate. Strong nudge enforcement. Has references for: discovery questions, explore protocol, 6 eval types (deterministic, fuzzy, integration, QA dogfood, regression, non-deterministic), writing-evals templates, fuzzy eval rubrics (screenshot + LLM-as-judge), CI/CD enforcement (GitHub Actions).

### saas-bootstrap
Bootstraps a full SaaS stack: detects project (next-forge, Next.js, etc.), asks opinionated questions (defaults ON, opt-out), installs all needed skills from skills.sh, scaffolds config files (auth.ts, drizzle.config, .env.example), generates agent-browser scripts for getting API credentials from dashboards (Google, GitHub, Stripe, Resend, Sentry, PostHog).

### my-stack (master router)
Routes ALL 29 installed skills by task. Decision tree: "What are you doing?" → loads the right skills. Covers: Next.js + Tailwind + shadcn/ui + Better Auth + Better Auth UI + Drizzle + Stripe + Resend + React Email + Sentry + PostHog + Turborepo + Vercel + Playwright.

### dogfood-complete
Unified QA + Playwright test generation using agent-browser (Vercel's Rust CLI). Two modes from one exploration session:
- QA mode: annotated screenshots, video recording, console error capture, issue taxonomy, severity classification, report.md
- Test gen mode: JSON action log → Playwright .spec.ts files with Better Auth test-utils fixtures, POM generation, auth boundary splitting, selector derivation from @refs

### better-auth-complete
Meta skill routing 9 auth skills. Covers: setup, OAuth providers, email verification, password reset, 2FA, organizations, plugin composition, database migrations, session management, security hardening, testing, troubleshooting.

### better-auth-test-utils
Better Auth testUtils plugin: createUser/saveUser/deleteUser factories, getCookies() for Playwright cookie injection (skip login UI), getAuthHeaders() for API tests, getOTP() for email verification, Playwright fixtures with auto-cleanup.

### better-auth-ui
@daveyplate/better-auth-ui shadcn components: AuthUIProvider config, AuthView/AuthCard, UserButton, AccountView/SettingsCards, OrganizationSwitcher, testing patterns with dogfood-complete.

### 29 skills installed locally at ~/.agents/skills/

## Key Design Decisions
- agent-browser (Vercel Rust CLI) is the browser engine, NOT dev-browser or Lightpanda
- Better Auth test-utils getCookies() is how Playwright tests skip login UI
- @refs from agent-browser snapshot -i map directly to Playwright getByRole selectors
- Fuzzy evals use screenshot + LLM-as-judge with configurable rubrics
- eval-driven-dev is strong nudge, not hard block

## What You Should Know
- If you're building eval/test infrastructure, eval-driven-dev already defines the 7-stage workflow
- If you're building escalation strategies, they should integrate at Stage 6 (ITERATE)
- If you're doing dogfooding/test writing, dogfood-complete already handles QA + test gen
- The public repo is github.com/kivo360/skills
- Full progress notes: ~/Coding/Tooling/skills/docs/session-progress.md
- Test prompts for omoios-forge: ~/Coding/Tooling/skills/prompts/omoios-forge/
```
