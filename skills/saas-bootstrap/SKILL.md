---
name: saas-bootstrap
description: >-
  Bootstrap a full SaaS stack in minutes. Detects your project (next-forge, Next.js, etc.),
  installs all required skills from skills.sh, scaffolds config files, and generates browser
  automation scripts for getting API credentials from Stripe, Google, Resend, Sentry, PostHog.
  Opinionated defaults with opt-out. Trigger on "bootstrap," "set up my stack," "new project,"
  "saas setup," "install skills," "configure stack," "get started," "scaffold," or "initialize."
  This skill orchestrates the entire onboarding flow for the full SaaS stack.
---

# SaaS Bootstrap

Detect your project. Install all skills. Scaffold configs. Generate credential setup scripts. Get building in minutes.

## How It Works

```
1. Detect    → Scan project for framework, ORM, auth, UI, services
2. Ask       → Confirm defaults, opt out of what you don't need
3. Install   → Install all required skills from skills.sh
4. Scaffold  → Create config files, .env.example, route handlers
5. Automate  → Generate agent-browser scripts for credential setup
6. Verify    → Run health checks to confirm everything works
```

## Quick Start

Say "bootstrap my project" or "set up my stack" and this skill activates.

## Phase 1: Detect

Scan the project to auto-detect what's already configured:

```bash
# Framework detection
ls next.config.* nuxt.config.* vite.config.* angular.json svelte.config.* 2>/dev/null

# Monorepo detection
ls pnpm-workspace.yaml turbo.json lerna.json 2>/dev/null
cat turbo.json 2>/dev/null | head -5

# Auth detection
grep -r "better-auth" --include="*.ts" --include="*.js" -l 2>/dev/null | head -5
grep -r "better-auth-ui\|@daveyplate" --include="*.ts" --include="*.tsx" -l 2>/dev/null | head -5

# Database detection
ls drizzle.config.* prisma/schema.prisma 2>/dev/null
grep -r "drizzle-orm\|@prisma/client" package.json 2>/dev/null

# Services detection
grep -E "STRIPE|RESEND|SENTRY|POSTHOG|KNOCK" .env* 2>/dev/null
grep -r "@stripe/stripe-js\|resend\|@sentry\|posthog" package.json 2>/dev/null

# UI detection
grep -r "shadcn\|@radix-ui" package.json 2>/dev/null
ls components.json tailwind.config.* 2>/dev/null
```

### Detection Result Template

After scanning, present findings:

```
## Project Detection Results

**Framework:** Next.js (App Router) — next-forge monorepo ✅
**Monorepo:** Turborepo ✅
**Auth:** Better Auth + Better Auth UI ✅
**Database:** Drizzle ORM (Postgres) ✅
**UI:** shadcn/ui + Tailwind CSS ✅
**Payments:** Stripe ⬜ (not detected)
**Email:** Resend ⬜ (not detected)
**Error Tracking:** Sentry ⬜ (not detected)
**Analytics:** PostHog ⬜ (not detected)
**Notifications:** Knock ⬜ (not detected)
```

## Phase 2: Ask (Opinionated Defaults)

Use the `AskQuestion` tool. The full stack is ON by default — ask what to REMOVE:

```
Your project has Next.js + Turborepo + Better Auth + Drizzle + shadcn/ui detected.

The full SaaS stack includes all of the following by default.
Uncheck anything you DON'T need:

☑ Payments (Stripe)
☑ Email (Resend + React Email)
☑ Error Tracking (Sentry)
☑ Analytics (PostHog)
☑ Auth Testing (Playwright + dogfood-complete)
```

Additional questions:

```
Which OAuth providers do you need?
☑ Google
☑ GitHub
☐ Apple
☐ Discord
☐ Microsoft

Do you need any of these auth features?
☑ Email verification
☑ Password reset
☐ Two-factor authentication (2FA)
☐ Organizations / teams
☐ API keys
☐ Passkeys / WebAuthn
```

## Phase 3: Install Skills

Based on detection + answers, install the required skills. Use the install table below.

### Install Table

| Feature | Skills to Install | Command |
|---------|------------------|---------|
| **Core (always)** | my-stack | `npx skills add kivo360/skills --skill my-stack -g -y` |
| **Auth** | better-auth-complete, better-auth-test-utils | `npx skills add kivo360/skills --skill better-auth-complete --skill better-auth-test-utils -g -y` |
| **Auth UI** | better-auth-ui | `npx skills add kivo360/skills --skill better-auth-ui -g -y` |
| **Testing** | dogfood-complete | `npx skills add kivo360/skills --skill dogfood-complete -g -y` |
| **Database** | drizzle-orm | `npx skills add bobmatnyc/claude-mpm-skills --skill drizzle-orm -g -y` |
| **UI** | shadcn | `npx skills add shadcn/ui --skill shadcn -g -y` |
| **Monorepo** | turborepo | `npx skills add vercel/turborepo --skill turborepo -g -y` |
| **Template** | next-forge | `npx skills add vercel/next-forge --skill next-forge -g -y` |
| **Browser** | agent-browser | `npx skills add vercel-labs/agent-browser --skill agent-browser -g -y` |
| **Playwright** | playwright-best-practices | `npx skills add currents-dev/playwright-best-practices-skill --skill playwright-best-practices -g -y` |
| **Payments** | stripe-best-practices | `npx skills add stripe/ai --skill stripe-best-practices -g -y` |
| **Email** | resend, react-email | `npx skills add resend/resend-skills --skill resend -g -y && npx skills add resend/react-email --skill react-email -g -y` |
| **Errors** | sentry-fix-issues | `npx skills add getsentry/sentry-agent-skills --skill sentry-fix-issues -g -y` |
| **Analytics** | posthog-instrumentation | `npx skills add posthog/posthog-for-claude --skill posthog-instrumentation -g -y` |
| **Auth (official)** | better-auth skills (6) | `npx skills add better-auth/skills -g -y` |

Run installs in parallel where possible. Report progress.

## Phase 4: Scaffold

Based on detection, create missing config files. Load the relevant skills for guidance:

### Auth Scaffolding (load: `better-auth-complete`, `better-auth-ui`)

```
Files to create if missing:
├── lib/auth.ts                    # Better Auth server config
├── lib/auth-client.ts             # Better Auth client
├── app/api/auth/[...all]/route.ts # Route handler
├── app/auth/[...pathname]/page.tsx # Auth pages (sign-in, sign-up)
├── app/account/[...view]/page.tsx  # Account settings
└── providers.tsx                   # AuthUIProvider wrapper
```

### Database Scaffolding (load: `drizzle-orm`)

```
Files to create if missing:
├── drizzle.config.ts              # Drizzle config
├── db/schema.ts                   # Database schema
└── db/index.ts                    # Database connection
```

### Environment Template

Generate `.env.example` with all required variables:

```env
# Auth (required)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=

# OAuth (based on provider selection)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Payments (if Stripe selected)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (if Resend selected)
RESEND_API_KEY=

# Error Tracking (if Sentry selected)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Analytics (if PostHog selected)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Notifications (if Knock selected)
KNOCK_API_KEY=
NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY=
```

## Phase 5: Browser Automation for Credentials

Generate agent-browser scripts AND a markdown checklist for getting API credentials.

See [credential-setup-scripts.md](references/credential-setup-scripts.md) for the full set of agent-browser automation scripts.

See [credential-setup-guide.md](references/credential-setup-guide.md) for the human-readable markdown checklist with links.

### Example: Google OAuth Credentials

**Markdown instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID → `GOOGLE_CLIENT_ID`
5. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

**agent-browser automation:**
```bash
# Connect to user's browser (already logged into Google)
agent-browser --auto-connect open https://console.cloud.google.com/apis/credentials
agent-browser --auto-connect wait --load networkidle
agent-browser --auto-connect screenshot --annotate setup-output/google-console.png
agent-browser --auto-connect snapshot -i
# Guide user through the UI from here
```

## Phase 6: Verify

After setup, run health checks:

```bash
# Auth health check
curl http://localhost:3000/api/auth/ok

# Database connection
npx drizzle-kit push --dry-run

# Run dogfood-complete QA on auth pages
# (loads dogfood-complete skill)
agent-browser --session verify open http://localhost:3000/auth/sign-in
agent-browser --session verify screenshot --annotate setup-output/verify-signin.png
agent-browser --session verify snapshot -i
agent-browser --session verify close
```

## Activity-Based Reference Guide

| Activity | Reference |
|----------|-----------|
| **Browser scripts for getting API credentials** | [credential-setup-scripts.md](references/credential-setup-scripts.md) |
| **Human-readable credential setup guide** | [credential-setup-guide.md](references/credential-setup-guide.md) |
| **next-forge specific setup notes** | [next-forge-setup.md](references/next-forge-setup.md) |
| **Environment variable reference** | [env-reference.md](references/env-reference.md) |

## Related Skills

- `my-stack` — master router for all skills (what to load when)
- `better-auth-complete` — auth implementation details
- `dogfood-complete` — QA + test generation after setup
- `next-forge` — monorepo template specifics
