# Browser Automation Scripts for Credential Setup

- [Google OAuth](#google-oauth)
- [GitHub OAuth](#github-oauth)
- [Stripe](#stripe)
- [Stripe Webhooks](#stripe-webhooks)
- [Resend](#resend)
- [Sentry](#sentry)
- [PostHog](#posthog)
- [Related References](#related-references)

Use these scripts with `agent-browser --auto-connect` to navigate to service dashboards and guide the user through credential creation.

### Google OAuth
1. **Navigate**: `https://console.cloud.google.com/apis/credentials`
2. **Action**: Create OAuth 2.0 Client ID for a Web Application.
3. **Redirect URI**: `http://localhost:3000/api/auth/callback/google`

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://console.cloud.google.com/apis/credentials
agent-browser --session $SESSION wait --load networkidle
agent-browser --session $SESSION screenshot --annotate setup-output/google-step1.png
agent-browser --session $SESSION snapshot -i
# Look for "Create Credentials" button -> "OAuth client ID"
# Application type: Web application
# Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
```

### GitHub OAuth
1. **Navigate**: `https://github.com/settings/developers`
2. **Action**: Register a new OAuth application.
3. **Homepage URL**: `http://localhost:3000`
4. **Callback URL**: `http://localhost:3000/api/auth/callback/github`

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://github.com/settings/developers
agent-browser --session $SESSION wait --load networkidle
agent-browser --session $SESSION screenshot --annotate setup-output/github-step1.png
# Click "New OAuth App"
# Homepage URL: http://localhost:3000
# Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

### Stripe
1. **Navigate**: `https://dashboard.stripe.com/apikeys`
2. **Action**: Copy the Publishable key and Secret key.

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://dashboard.stripe.com/apikeys
agent-browser --session $SESSION wait --load networkidle
agent-browser --session $SESSION screenshot --annotate setup-output/stripe-keys.png
# Copy pk_test_... -> NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Copy sk_test_... -> STRIPE_SECRET_KEY
```

### Stripe Webhooks
1. **Navigate**: `https://dashboard.stripe.com/webhooks`
2. **Action**: Add a new endpoint.
3. **Endpoint URL**: `http://localhost:3000/api/webhooks/stripe` (or your public tunnel URL)

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://dashboard.stripe.com/webhooks
agent-browser --session $SESSION wait --load networkidle
agent-browser --session $SESSION screenshot --annotate setup-output/stripe-webhooks.png
# Add endpoint: /api/webhooks/stripe
# Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
```

### Resend
1. **Navigate**: `https://resend.com/api-keys`
2. **Action**: Create a new API key.

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://resend.com/api-keys
agent-browser --session $SESSION wait --load networkidle
agent-browser --session $SESSION screenshot --annotate setup-output/resend-keys.png
# Name it "Development" or "Production"
# Copy key -> RESEND_API_KEY
```

### Sentry
1. **Navigate**: `https://sentry.io`
2. **Action**: Create a new project, then get the DSN and Auth Token.

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://sentry.io/organizations/sentry/projects/
agent-browser --session $SESSION wait --load networkidle
# Create Project -> Select Next.js
# Get DSN from Client Keys (DSN) settings
# Get Auth Token from User Settings -> API Keys
```

### PostHog
1. **Navigate**: `https://us.posthog.com/project/settings`
2. **Action**: Copy the Project API Key and Host URL.

```bash
SESSION="setup"
agent-browser --session $SESSION --auto-connect open https://us.posthog.com/project/settings
agent-browser --session $SESSION wait --load networkidle
agent-browser --session $SESSION screenshot --annotate setup-output/posthog-settings.png
# Copy Project API Key -> NEXT_PUBLIC_POSTHOG_KEY
# Host: https://us.i.posthog.com (standard US)
```

### Related References
- [Credential Setup Guide](credential-setup-guide.md)
- [Environment Variable Reference](env-reference.md)
