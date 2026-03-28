---
name: better-auth-complete
description: >-
  The all-in-one Better Auth implementation skill. Use for ANY auth task: scaffolding new auth,
  adding OAuth providers, setting up email verification, implementing 2FA, building organizations,
  writing auth tests with Playwright, securing for production, or troubleshooting. Routes to
  specialized skills and provides implementation guides that combine multiple skills for speed.
  Trigger on "auth," "better auth," "authentication," "login," "signup," "sign in," "session,"
  "OAuth," "social login," "2FA," "MFA," "organization," "team," "RBAC," "permission," "role,"
  "email verification," "password reset," "OTP," "auth test," "test auth," "auth security,"
  "rate limit," "CSRF," "cookie," "session management," or "auth migration."
  This meta skill coordinates: better-auth-best-practices, better-auth-security-best-practices,
  create-auth-skill, email-and-password-best-practices, organization-best-practices,
  two-factor-authentication-best-practices, better-auth-test-utils, and playwright-best-practices.
---

# Better Auth Complete

Single entry point for all Better Auth work. Routes you to the right skill and reference based on what you're building.

## Skills This Coordinates

| Skill | Domain | Load When |
|-------|--------|-----------|
| `create-auth-skill` | Scaffolding new auth from scratch | New project or adding auth |
| `better-auth-best-practices` | Core config, adapters, sessions, plugins | Any auth work |
| `email-and-password-best-practices` | Credential auth, verification, password reset | Email/password flows |
| `better-auth-security-best-practices` | Rate limiting, CSRF, cookies, secrets, audit | Security hardening |
| `organization-best-practices` | Multi-tenant orgs, RBAC, teams, invitations | Org/team features |
| `two-factor-authentication-best-practices` | TOTP, OTP, backup codes, trusted devices | 2FA/MFA |
| `better-auth-test-utils` | Test factories, getCookies, OTP capture | Writing tests |
| `playwright-best-practices` | E2E test structure, locators, assertions | Playwright tests |

## What Are You Doing?

```
What do you need?
│
├─ Starting from scratch?
│  ├─ New project → create-auth-skill + quick-start.md
│  ├─ Adding auth to existing app → create-auth-skill + database-migrations.md
│  └─ Migrating from another lib → create-auth-skill (Phase 1: Migration)
│
├─ Adding a feature?
│  ├─ Social login (Google/GitHub/etc.) → oauth-social-providers.md
│  ├─ Email verification → email-flows.md + email-and-password skill
│  ├─ Password reset → email-flows.md + email-and-password skill
│  ├─ Two-factor auth → 2fa-implementation.md + two-factor skill
│  ├─ Organizations/teams → organizations-implementation.md + organization skill
│  ├─ API bearer tokens → plugin-recipes.md
│  ├─ Admin dashboard → plugin-recipes.md
│  ├─ Passkeys/WebAuthn → plugin-recipes.md
│  └─ Multiple features → plugin-recipes.md (composition patterns)
│
├─ Writing tests?
│  ├─ Integration tests (Vitest) → testing-auth-flows.md + test-utils skill
│  ├─ E2E tests (Playwright) → playwright-auth-patterns.md + playwright skill
│  ├─ Testing auth UI (login/signup) → playwright-auth-patterns.md
│  ├─ Testing behind auth (features) → playwright-auth-patterns.md (cookie injection)
│  ├─ Testing 2FA flows → 2fa-implementation.md (testing section)
│  ├─ Testing org permissions → organizations-implementation.md (testing section)
│  └─ Testing OTP/email verification → testing-auth-flows.md (OTP capture)
│
├─ Securing for production?
│  ├─ Full security audit → security-checklist.md + security skill
│  ├─ Rate limiting → security skill (Rate Limiting section)
│  ├─ Session/cookie config → session-and-cookies.md
│  ├─ CSRF/trusted origins → security skill (CSRF/Trusted Origins)
│  └─ Audit logging → security skill (Database Hooks)
│
├─ Database/infrastructure?
│  ├─ Setting up database → database-migrations.md
│  ├─ Switching ORM/adapter → database-migrations.md
│  ├─ Running migrations → database-migrations.md
│  └─ Session storage (Redis/KV) → session-and-cookies.md
│
└─ Troubleshooting?
   └─ troubleshooting.md (unified across all skills)
```

## Activity-Based Reference Guide

### Getting Started

| Activity | Reference | Skills to Load |
|----------|-----------|----------------|
| **Zero to working auth** | [quick-start.md](references/quick-start.md) | create-auth-skill, best-practices |
| **Add social OAuth providers** | [oauth-social-providers.md](references/oauth-social-providers.md) | best-practices |
| **Set up database & migrations** | [database-migrations.md](references/database-migrations.md) | best-practices |

### Feature Implementation

| Activity | Reference | Skills to Load |
|----------|-----------|----------------|
| **Email verification + password reset** | [email-flows.md](references/email-flows.md) | email-and-password |
| **Two-factor authentication** | [2fa-implementation.md](references/2fa-implementation.md) | two-factor |
| **Organizations, teams, RBAC** | [organizations-implementation.md](references/organizations-implementation.md) | organization |
| **Combine multiple plugins** | [plugin-recipes.md](references/plugin-recipes.md) | best-practices |

### Testing

| Activity | Reference | Skills to Load |
|----------|-----------|----------------|
| **Auth testing strategy** | [testing-auth-flows.md](references/testing-auth-flows.md) | test-utils |
| **Playwright E2E auth tests** | [playwright-auth-patterns.md](references/playwright-auth-patterns.md) | test-utils, playwright |

### Production

| Activity | Reference | Skills to Load |
|----------|-----------|----------------|
| **Security hardening** | [security-checklist.md](references/security-checklist.md) | security |
| **Session & cookie strategy** | [session-and-cookies.md](references/session-and-cookies.md) | security, best-practices |
| **Debugging issues** | [troubleshooting.md](references/troubleshooting.md) | — |

## Speed Patterns

### Fastest Auth Setup (5 minutes)

```bash
npm install better-auth
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "BETTER_AUTH_URL=http://localhost:3000" >> .env
```

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
export const auth = betterAuth({
  database: { url: process.env.DATABASE_URL },
  emailAndPassword: { enabled: true },
});
export type Session = typeof auth.$Infer.Session;
```

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"; // or /vue, /svelte
export const { signIn, signUp, signOut, useSession } = createAuthClient();
```

```bash
npx @better-auth/cli@latest migrate
# Verify: curl http://localhost:3000/api/auth/ok
```

→ Full guide: [quick-start.md](references/quick-start.md)

### Fastest Test Setup

```typescript
// auth.ts — add test-utils plugin
import { testUtils } from "better-auth/plugins";
plugins: [testUtils({ captureOTP: true })]

// fixtures/auth.ts — Playwright fixture
import { test as base } from '@playwright/test';
import { auth } from '../auth';
export const test = base.extend({
  testUtils: async ({}, use) => {
    const ctx = await auth.$context;
    await use(ctx.test);
  },
});
```

→ Full guide: [testing-auth-flows.md](references/testing-auth-flows.md)

### Fastest Social OAuth

```typescript
// Add to auth.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},
```

```typescript
// Client: one-line social login
await signIn.social({ provider: "google", callbackURL: "/dashboard" });
```

→ Full guide: [oauth-social-providers.md](references/oauth-social-providers.md)

## Plugin Compatibility Quick Reference

| Plugin | Works With | Config Notes |
|--------|-----------|--------------|
| `twoFactor` | email/password only | Requires credential account |
| `organization` | all auth methods | Set active org in session |
| `admin` | all | Requires admin role assignment |
| `bearer` | all | Alternative to cookie sessions |
| `passkey` | standalone or + email/password | Scoped package: `@better-auth/passkey` |
| `testUtils` | all | Test environments only |

## Environment Variables Cheat Sheet

```env
# Required
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=<connection string>

# OAuth (as needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# Optional
BETTER_AUTH_TRUSTED_ORIGINS=https://app.example.com,https://admin.example.com
```

## CLI Commands Cheat Sheet

```bash
# Apply schema (built-in adapter)
npx @better-auth/cli@latest migrate

# Generate schema for Prisma
npx @better-auth/cli@latest generate --output prisma/schema.prisma
npx prisma migrate dev

# Generate schema for Drizzle
npx @better-auth/cli@latest generate --output src/db/auth-schema.ts
npx drizzle-kit push

# Health check
curl http://localhost:3000/api/auth/ok
```

**Re-run migrations after adding/changing plugins.**
