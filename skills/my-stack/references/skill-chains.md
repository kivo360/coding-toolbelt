# Skill Chains — Task to Skills Mapping

## Table of Contents
1. [Core Project Lifecycle](#core-project-lifecycle)
2. [Authentication & Security](#authentication--security)
3. [Features & Integrations](#features--integrations)
4. [Testing & QA](#testing--qa)
5. [Database & Operations](#database--operations)

## Core Project Lifecycle
- **New project from scratch**: next-forge → turborepo → drizzle-orm → shadcn → better-auth-complete → resend → stripe-best-practices → sentry-fix-issues → posthog-instrumentation
- **Deploy to production**: turborepo → next-forge
- **Database migration**: drizzle-orm

## Authentication & Security
- **Add auth to existing project**: better-auth-complete → create-auth-skill → drizzle-orm → better-auth-ui
- **Add social login**: better-auth-complete (OAuth reference section)
- **Add 2FA**: better-auth-complete → two-factor-authentication-best-practices
- **Add organizations**: better-auth-complete → organization-best-practices
- **Debug auth issues**: better-auth-complete (Troubleshooting section)
- **Production security audit**: better-auth-security-best-practices → sentry-fix-issues → stripe-best-practices

## Features & Integrations
- **Add payments**: stripe-best-practices → drizzle-orm
- **Add email**: resend → react-email → email-and-password-best-practices
- **Add error tracking**: sentry-fix-issues
- **Add analytics**: posthog-instrumentation
- **Add UI component**: shadcn
- **Debug Sentry errors**: sentry-fix-issues

## Testing & QA
- **Write integration tests**: better-auth-test-utils → playwright-best-practices
- **Write E2E tests**: dogfood-complete → agent-browser → playwright-best-practices
- **QA/dogfood the app**: dogfood-complete (QA mode) → agent-browser
- **Test auth flows**: dogfood-complete → better-auth-test-utils → better-auth-ui

## Database & Operations
- **Database schema update**: drizzle-orm
- **Monorepo task management**: turborepo
- **Error investigation**: sentry-fix-issues

**Related References:**
- [Complete Skill Map](skill-map.md)
- [New Project Setup Guide](new-project-setup.md)
