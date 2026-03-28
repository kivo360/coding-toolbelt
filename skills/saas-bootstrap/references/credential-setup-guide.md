# Credential Setup Guide (Human-Readable)

- [Google OAuth](#google-oauth)
- [GitHub OAuth](#github-oauth)
- [Stripe (Payments)](#stripe-payments)
- [Resend (Email)](#resend-email)
- [Sentry (Error Tracking)](#sentry-error-tracking)
- [PostHog (Analytics)](#posthog-analytics)
- [Knock (Notifications)](#knock-notifications)
- [Related References](#related-references)

Follow this checklist for each service to ensure your SaaS application is fully configured.

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth client ID"
3. Select Application type: "Web application"
4. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID → `GOOGLE_CLIENT_ID`
6. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

**Gotcha:** Ensure the Google+ API or People API is enabled in the API Library for profile data access.

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Application name: "Your SaaS App (Dev)"
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Click "Register application"
7. Copy Client ID → `GITHUB_CLIENT_ID`
8. Generate and copy Client Secret → `GITHUB_CLIENT_SECRET`

### Stripe (Payments)
1. Go to [Stripe API Keys](https://dashboard.stripe.com/apikeys)
2. Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy Secret key → `STRIPE_SECRET_KEY`
4. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
5. Click "Add endpoint"
6. Endpoint URL: `http://localhost:3000/api/webhooks/stripe` (Use local tunnel for local dev)
7. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
8. Copy Webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### Resend (Email)
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Create a new API key and copy it → `RESEND_API_KEY`
3. Go to [Domains](https://resend.com/domains)
4. Add and verify your domain for production use.
5. In your `.env`, set `EMAIL_FROM` to your verified sender address.

### Sentry (Error Tracking)
1. Go to [Sentry](https://sentry.io)
2. Create a new project, selecting Next.js.
3. Go to Project Settings → Client Keys (DSN) and copy it → `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
4. Go to User Settings → API Keys and create a token with `project:write` scope → `SENTRY_AUTH_TOKEN`
5. Find your Organization Slug and Project Slug → `SENTRY_ORG`, `SENTRY_PROJECT`

### PostHog (Analytics)
1. Go to [PostHog Settings](https://us.posthog.com/project/settings)
2. Copy Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`
3. Identify your host → `NEXT_PUBLIC_POSTHOG_HOST` (usually `https://us.i.posthog.com`)

### Knock (Notifications)
1. Go to [Knock API Keys](https://dashboard.knock.app/settings/keys)
2. Copy Secret API Key → `KNOCK_API_KEY`
3. Copy Public API Key → `NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY`

### Related References
- [Browser Automation Scripts](credential-setup-scripts.md)
- [Environment Variable Reference](env-reference.md)
