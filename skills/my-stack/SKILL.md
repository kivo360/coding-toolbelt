---
name: my-stack
description: >-
  Master routing skill for the full SaaS stack: Next.js (next-forge) + Better Auth + Better Auth UI
  + Drizzle ORM + Stripe + Resend + React Email + Sentry + PostHog + shadcn/ui + Tailwind +
  Turborepo + Vercel + Playwright. Use for ANY task across the stack — routes to the right skills.
  Trigger on "my stack," "set up," "new project," "add feature," "scaffold," "deploy," "test,"
  "integrate," "configure," "production," or any mention of the specific technologies. This is
  the top-level meta skill that coordinates 26 skills across auth, testing, infrastructure,
  and integrations.
---

# My Stack

Master router for your full SaaS stack. One skill to find the right skills.

## The Stack

| Layer | Tech | Skills |
|-------|------|--------|
| **Framework** | Next.js App Router (next-forge monorepo) | `next-forge`, `turborepo` |
| **UI** | Tailwind + shadcn/ui | `shadcn` |
| **Auth** | Better Auth + Better Auth UI | `better-auth-complete` (routes 8 auth skills) |
| **Database** | Drizzle ORM (Postgres) | `drizzle-orm` |
| **Payments** | Stripe | `stripe-best-practices` |
| **Email** | Resend + React Email | `resend`, `react-email` |
| **Error Tracking** | Sentry | `sentry-fix-issues` |
| **Analytics** | PostHog | `posthog-instrumentation` |
| **Testing** | Playwright + agent-browser | `dogfood-complete`, `playwright-best-practices`, `agent-browser` |
| **Deployment** | Vercel | (no dedicated skill yet) |

## What Are You Doing?

```
What do you need?
│
├─ Starting a new project?
│  └─ new-project-setup.md
│     Load: next-forge, turborepo, drizzle-orm, better-auth-complete, shadcn
│
├─ Adding a feature?
│  ├─ Authentication → better-auth-complete (routes to all auth skills)
│  ├─ Auth UI components → better-auth-ui
│  ├─ Payments/billing → stripe-best-practices
│  ├─ Email (transactional) → resend, react-email
│  ├─ Error tracking → sentry-fix-issues
│  ├─ Analytics → posthog-instrumentation
│  ├─ UI components → shadcn
│  ├─ Database schema → drizzle-orm
│  ├─ Organizations/teams → better-auth-complete → organizations
│  ├─ 2FA/MFA → better-auth-complete → 2fa
│  └─ API keys → better-auth-ui (ApiKeysCard)
│
├─ Testing?
│  ├─ Explore app + find bugs → dogfood-complete (QA mode)
│  ├─ Generate Playwright tests → dogfood-complete (test gen mode)
│  ├─ Auth testing → better-auth-test-utils + playwright-best-practices
│  ├─ Test auth UI components → better-auth-ui → testing-auth-ui.md
│  └─ E2E best practices → playwright-best-practices
│
├─ Going to production?
│  └─ production-checklist.md
│     Load: better-auth-security, sentry-fix-issues, posthog-instrumentation, stripe-best-practices
│
├─ Monorepo / infrastructure?
│  ├─ Turborepo config → turborepo
│  ├─ Package structure → next-forge
│  └─ Database migrations → drizzle-orm
│
└─ Debugging?
   ├─ Auth issues → better-auth-complete → troubleshooting.md
   ├─ Sentry errors → sentry-fix-issues
   ├─ Browser testing → agent-browser, dogfood-complete
   └─ Build/monorepo issues → turborepo
```

## Skill Chain Reference

For each common task, which skills to load and in what order.

### New Project Setup
```
1. next-forge          → scaffold monorepo structure
2. turborepo           → configure workspaces and caching
3. drizzle-orm         → set up database schema + migrations
4. shadcn              → install UI components
5. better-auth-complete → add authentication
6. better-auth-ui      → add auth pages (sign-in, sign-up, settings)
7. resend + react-email → configure transactional email
8. stripe-best-practices → add payments (if needed)
9. sentry-fix-issues   → add error tracking
10. posthog-instrumentation → add analytics
```

### Add Auth to Existing Project
```
1. better-auth-complete → routes you through all auth setup
   ├─ create-auth-skill     → scaffold auth.ts + auth-client.ts + route handler
   ├─ drizzle-orm           → database adapter + migrations
   ├─ email-and-password    → credential auth
   ├─ better-auth-ui        → auth pages (sign-in, sign-up, settings)
   └─ better-auth-security  → production hardening
```

### Add Payments
```
1. stripe-best-practices → API integration, webhooks, checkout
2. drizzle-orm           → subscription/payment tables
3. better-auth-complete  → link payments to user accounts
```

### Add Email System
```
1. resend               → email delivery API
2. react-email           → email templates (React components)
3. email-and-password    → verification + password reset emails
```

### Full Testing Pipeline
```
1. agent-browser         → install browser automation CLI
2. dogfood-complete      → explore app, find bugs, generate tests
   ├─ QA mode            → report.md with screenshots + videos
   └─ Test gen mode      → .spec.ts files
3. better-auth-test-utils → auth state for tests (getCookies, factories)
4. playwright-best-practices → test structure, locators, CI/CD
5. better-auth-ui → testing-auth-ui.md → patterns for testing auth components
```

### Production Deployment
```
1. better-auth-security  → secrets, rate limits, CSRF, cookies
2. sentry-fix-issues     → error monitoring setup
3. posthog-instrumentation → analytics events
4. stripe-best-practices → webhook security, idempotency
5. turborepo             → build optimization for deploy
```

## Activity-Based Reference Guide

| Activity | Reference | Skills to Load |
|----------|-----------|----------------|
| **Start a new project from scratch** | [new-project-setup.md](references/new-project-setup.md) | next-forge, turborepo, drizzle-orm, shadcn, better-auth-complete |
| **Add a feature to existing project** | [add-feature-guide.md](references/add-feature-guide.md) | varies by feature |
| **Test your app** | [testing-guide.md](references/testing-guide.md) | dogfood-complete, agent-browser, playwright, test-utils |
| **Deploy to production** | [production-checklist.md](references/production-checklist.md) | security, sentry, posthog, stripe |
| **See all skills and how they connect** | [skill-map.md](references/skill-map.md) | — |
| **Common task → skill chain lookup** | [skill-chains.md](references/skill-chains.md) | — |

## Quick Skill Lookup

### By Technology
| Tech | Primary Skill | Load Command |
|------|---------------|-------------|
| Next.js | `next-forge` | `skill("next-forge")` |
| Turborepo | `turborepo` | `skill("turborepo")` |
| Better Auth | `better-auth-complete` | `skill("better-auth-complete")` |
| Auth UI | `better-auth-ui` | `skill("better-auth-ui")` |
| Drizzle | `drizzle-orm` | `skill("drizzle-orm")` |
| shadcn/ui | `shadcn` | `skill("shadcn")` |
| Stripe | `stripe-best-practices` | `skill("stripe-best-practices")` |
| Resend | `resend` | `skill("resend")` |
| React Email | `react-email` | `skill("react-email")` |
| Sentry | `sentry-fix-issues` | `skill("sentry-fix-issues")` |
| PostHog | `posthog-instrumentation` | `skill("posthog-instrumentation")` |
| Playwright | `playwright-best-practices` | `skill("playwright-best-practices")` |
| agent-browser | `agent-browser` | `skill("agent-browser")` |

### By Task
| Task | Skills to Load |
|------|---------------|
| "Add login/signup" | `better-auth-complete`, `better-auth-ui` |
| "Add Google/GitHub login" | `better-auth-complete` → oauth-social-providers.md |
| "Add 2FA" | `better-auth-complete` → 2fa-implementation.md |
| "Add organizations" | `better-auth-complete` → organizations-implementation.md |
| "Set up payments" | `stripe-best-practices`, `drizzle-orm` |
| "Send emails" | `resend`, `react-email` |
| "Add error tracking" | `sentry-fix-issues` |
| "Add analytics" | `posthog-instrumentation` |
| "Add a UI component" | `shadcn` |
| "Write tests" | `dogfood-complete`, `playwright-best-practices` |
| "Test auth flows" | `dogfood-complete`, `better-auth-test-utils`, `better-auth-ui` |
| "Find bugs in my app" | `dogfood-complete` (QA mode), `agent-browser` |
| "Generate Playwright tests" | `dogfood-complete` (test gen mode) |
| "Set up database" | `drizzle-orm` |
| "Run migrations" | `drizzle-orm` |
| "Configure monorepo" | `turborepo`, `next-forge` |
| "Secure for production" | `better-auth-security-best-practices` |
| "Deploy to Vercel" | `turborepo`, `next-forge` |

## Environment Variables Cheat Sheet

```env
# Auth
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
