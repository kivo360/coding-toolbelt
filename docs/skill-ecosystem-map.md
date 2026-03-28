# Skill Ecosystem Map

> 29 skills total across 4 domains

## Hierarchy

```
eval-driven-dev              ← HOW you develop (7-stage workflow enforcement)
  ↓ uses
my-stack                     ← WHAT skills to load (master router)
  ↓ routes to
saas-bootstrap               ← SET UP a new project (detect, install, scaffold)
  ↓ installs
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  AUTH (9 skills)                                            │
│  ├── better-auth-complete      meta router (we built)       │
│  ├── better-auth-best-practices   core config (official)    │
│  ├── better-auth-security         hardening (official)      │
│  ├── better-auth-test-utils       test helpers (we built)   │
│  ├── better-auth-ui               shadcn components (built) │
│  ├── create-auth-skill            scaffolding (official)    │
│  ├── email-and-password           credential auth (official)│
│  ├── organization                 multi-tenant (official)   │
│  └── two-factor-authentication    2FA/MFA (official)        │
│                                                             │
│  TESTING (3 skills)                                         │
│  ├── dogfood-complete          QA + test gen (we built)     │
│  ├── agent-browser             browser engine (vercel-labs) │
│  └── playwright-best-practices test quality (currents-dev)  │
│                                                             │
│  INFRASTRUCTURE (5 skills)                                  │
│  ├── next-forge               monorepo template (vercel)    │
│  ├── turborepo                monorepo tooling (vercel)     │
│  ├── drizzle-orm              database ORM (community)      │
│  ├── shadcn                   UI components (official)      │
│  └── sentry-fix-issues        error tracking (getsentry)    │
│                                                             │
│  INTEGRATIONS (4 skills)                                    │
│  ├── stripe-best-practices    payments (stripe/ai)          │
│  ├── resend                   email delivery (official)     │
│  ├── react-email              email templates (official)    │
│  └── posthog-instrumentation  analytics (official)          │
│                                                             │
│  EVAL (3 skills — from parallel sessions)                   │
│  ├── eval-pipeline            unified orchestrator          │
│  ├── eval-harness             daily EDD workflow            │
│  └── agent-evaluation         production eval framework     │
│                                                             │
│  UTILITY                                                    │
│  ├── linter-loop-escalation   4-tier error loop detection   │
│  ├── find-skills              skill discovery               │
│  ├── oh-my-openagent          OMO config                    │
│  ├── ai-subscription-tracker  cost tracking                 │
│  ├── hf-cli                   Hugging Face CLI              │
│  └── modal-serverless-gpu     GPU compute                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Task → Skill Chain Reference

| Task | Load These Skills (in order) |
|------|------------------------------|
| **New project from scratch** | saas-bootstrap → next-forge → turborepo → drizzle-orm → shadcn → better-auth-complete → better-auth-ui → resend → react-email → stripe → sentry → posthog |
| **Add auth** | better-auth-complete → create-auth-skill → drizzle-orm → better-auth-ui → better-auth-security |
| **Add social login** | better-auth-complete (oauth-social-providers.md) |
| **Add 2FA** | better-auth-complete → two-factor-authentication |
| **Add organizations** | better-auth-complete → organization |
| **Add payments** | stripe-best-practices → drizzle-orm |
| **Add email** | resend → react-email → email-and-password |
| **Add error tracking** | sentry-fix-issues |
| **Add analytics** | posthog-instrumentation |
| **Write E2E tests** | dogfood-complete → agent-browser → playwright-best-practices → better-auth-test-utils |
| **QA / dogfood app** | dogfood-complete (QA mode) → agent-browser |
| **Test auth flows** | dogfood-complete → better-auth-test-utils → better-auth-ui |
| **Production security** | better-auth-security → sentry-fix-issues → stripe-best-practices |
| **Deploy** | turborepo → next-forge |
| **Database migration** | drizzle-orm |
| **Debug auth** | better-auth-complete → troubleshooting.md |
| **Debug Sentry** | sentry-fix-issues |
| **Set up evals** | eval-driven-dev → eval-pipeline |

## Gaps (omoios-forge packages without skills)

| Package | What It Does | Gap Severity |
|---------|-------------|:---:|
| Arcjet (security) | Application security, bot detection | Medium |
| Knock (notifications) | In-app notifications | Medium |
| Liveblocks (collaboration) | Real-time features | Low |
| Svix (webhooks) | Inbound/outbound webhooks | Medium |
| Upstash (rate-limit) | Redis rate limiting | Low |
| BaseHub (cms) | Content management | Low |
| BetterStack (observability) | Logging, uptime | Low |
| Vitest | Unit test framework | Medium |
| Bun quirks | Package manager specifics | Low |
| Turbopack workarounds | CSS cache, workspace root | Low |
