# Adding Features

## Table of Contents
1. [Authentication Features](#authentication-features)
2. [E-commerce & Payments](#e-commerce--payments)
3. [Infrastructure & Services](#infrastructure--services)
4. [UI & Frontend](#ui--frontend)
5. [Analytics & Operations](#analytics--operations)

## Authentication Features
- **Social Login**: Load **better-auth-complete**. Modify `auth.ts` to add providers. Add env vars for `CLIENT_ID` and `CLIENT_SECRET`.
- **2FA**: Load **two-factor-authentication-best-practices**. Add plugin to `auth.ts`. Create 2FA setup UI.
- **Organizations**: Load **organization-best-practices**. Enable plugin in `auth.ts`. Create org switcher and member management UI.

## E-commerce & Payments
- **Payments**: Load **stripe-best-practices**. Create products in Stripe Dashboard. Set up webhook route. Update DB schema using **drizzle-orm** to track status.

## Infrastructure & Services
- **Email**: Load **resend** and **react-email**. Create templates in `/emails`. Add `RESEND_API_KEY` to env.
- **Error Tracking**: Load **sentry-fix-issues**. Add `Sentry.init` to client/server layouts. Configure `SENTRY_DSN`.

## UI & Frontend
- **UI Components**: Load **shadcn**. Run `npx shadcn@latest add [component]`. Verify styling in Tailwind.
- **Custom Fields**: Load **drizzle-orm** to update DB. Update Zod schemas in **backend-dev-guidelines**. Add input to frontend using **shadcn**.

## Analytics & Operations
- **Analytics**: Load **posthog-instrumentation**. Wrap app in `PostHogProvider`. Add event tracking to key CTAs.
- **Feature Flags**: Load **posthog-instrumentation**. Use `useFeatureFlag` hook to gate features.

## Verification Steps
- **Auth**: Use **better-auth-test-utils** to verify session creation.
- **Payments**: Use Stripe CLI to trigger test webhooks.
- **Email**: Send test emails to a verified address.
- **Errors**: Manually trigger an error and check Sentry dashboard.

**Related References:**
- [New Project Setup Guide](new-project-setup.md)
- [Testing Guide](testing-guide.md)
- [Production Deployment Checklist](production-checklist.md)
