# New Project Setup Guide

## Table of Contents
1. [Initial Scaffolding](#initial-scaffolding)
2. [Data Layer & UI](#data-layer--ui)
3. [Authentication Setup](#authentication-setup)
4. [Services & Observability](#services--observability)
5. [Environment Variables](#environment-variables)
6. [Initial Testing](#initial-testing)

## Initial Scaffolding
1. **Scaffold with next-forge**: Use **next-forge** to create the monorepo structure.
2. **Configure Turborepo**: Load **turborepo** to define build pipelines and caching rules.

## Data Layer & UI
3. **Set up Drizzle ORM**: Load **drizzle-orm** to define schema, initialize Postgres, and run initial migrations.
4. **Install shadcn/ui**: Use **shadcn** to add baseline components.

## Authentication Setup
5. **Install Better Auth**: Load **better-auth-complete** to configure `auth.ts`, `auth-client.ts`, and API route handlers.
6. **Add Auth UI**: Use **better-auth-ui** for `AuthUIProvider` and pre-built auth pages.

## Services & Observability
7. **Configure Resend + React Email**: Load **resend** and **react-email** for delivery and template design.
8. **Add Stripe**: Load **stripe-best-practices** to set up subscriptions, webhooks, and checkout.
9. **Add Sentry**: Load **sentry-fix-issues** to initialize error tracking and source map uploads.
10. **Add PostHog**: Load **posthog-instrumentation** for event tracking and feature flags.

## Environment Variables
Ensure the following are configured (refer to each specific skill for exact values):
- `DATABASE_URL` (**drizzle-orm**)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (**better-auth-complete**)
- `RESEND_API_KEY` (**resend**)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (**stripe-best-practices**)
- `SENTRY_DSN` (**sentry-fix-issues**)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (**posthog-instrumentation**)

## Initial Testing
11. **Verify Stack**: Load **dogfood-complete** and run a full smoke test to ensure all integrations are working.

**Related References:**
- [Skill Map](skill-map.md)
- [Skill Chains](skill-chains.md)
- [Testing Guide](testing-guide.md)
