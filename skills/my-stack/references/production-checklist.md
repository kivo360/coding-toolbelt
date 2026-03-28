# Production Deployment Checklist

## Table of Contents
1. [Security & Authentication](#security--authentication)
2. [E-commerce & Payments](#e-commerce--payments)
3. [Infrastructure & Operations](#infrastructure--operations)
4. [Monitoring & Analytics](#monitoring--analytics)
5. [Testing & QA](#testing--qa)
6. [Monorepo & Build](#monorepo--build)

## Security & Authentication
- [ ] **BETTER_AUTH_SECRET**: Set a strong, random secret.
- [ ] **trustedOrigins**: Define all production and staging domains.
- [ ] **Secure Cookies**: Ensure cookies are HTTP-only and Secure.
- [ ] **Rate Limits**: Enable rate limiting for all auth endpoints.
- [ ] **Email Verification**: Enforce verification before sensitive actions.
- Reference: **better-auth-security-best-practices**

## E-commerce & Payments
- [ ] **Stripe Webhook Signing**: Use a valid `STRIPE_WEBHOOK_SECRET`.
- [ ] **Idempotency Keys**: Ensure critical actions are idempotent.
- [ ] **Test Mode**: Verify Stripe keys are in production/live mode.
- Reference: **stripe-best-practices**

## Infrastructure & Operations
- [ ] **Resend Domains**: Verify all sending domains and set SPF/DKIM.
- [ ] **Drizzle Migrations**: Run `drizzle-kit push` or migrations in CI.
- [ ] **Connection Pooling**: Use a pooler (e.g., PgBouncer) for serverless envs.
- Reference: **resend**, **drizzle-orm**

## Monitoring & Analytics
- [ ] **Sentry DSN**: Configured for both client and server.
- [ ] **Source Maps**: Uploaded during build for accurate error traces.
- [ ] **PostHog Key**: Set to the correct production environment.
- [ ] **Tracking Events**: Verify key conversion events are being logged.
- Reference: **sentry-fix-issues**, **posthog-instrumentation**

## Testing & QA
- [ ] **E2E Tests**: All Playwright tests passing in CI.
- [ ] **QA Report**: Dogfood exploration report is clean.
- Reference: **playwright-best-practices**, **dogfood-complete**

## Monorepo & Build
- [ ] **Turborepo Cache**: Remote caching configured (e.g., Vercel).
- [ ] **Bundle Size**: Build artifacts are optimized and under budgets.
- [ ] **Secrets**: No `.env` files or secrets are committed to git.
- Reference: **turborepo**, **next-forge**

**Related References:**
- [Skill Map](skill-map.md)
- [Add Feature Guide](add-feature-guide.md)
- [Testing Guide](testing-guide.md)
