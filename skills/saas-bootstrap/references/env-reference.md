# Environment Variable Reference

- [Authentication (Better Auth)](#authentication-better-auth)
- [OAuth (Social Logins)](#oauth-social-logins)
- [Payments (Stripe)](#payments-stripe)
- [Email (Resend)](#email-resend)
- [Error Tracking (Sentry)](#error-tracking-sentry)
- [Analytics (PostHog)](#analytics-posthog)
- [Notifications (Knock)](#notifications-knock)
- [Framework & Application](#framework--application)
- [Related References](#related-references)

A comprehensive list of environment variables used by the `saas-bootstrap` stack.

### Authentication (Better Auth)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` | `...` |
| `BETTER_AUTH_URL` | Yes | Your application URL | `http://localhost:3000` |
| `DATABASE_URL` | Yes | Your database provider (e.g., Supabase, Neon) | `postgresql://...` |

### OAuth (Social Logins)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Optional | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Optional | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | `GOCSPX-...` |
| `GITHUB_CLIENT_ID` | Optional | [GitHub Developer Settings](https://github.com/settings/developers) | `Ov23...` |
| `GITHUB_CLIENT_SECRET` | Optional | [GitHub Developer Settings](https://github.com/settings/developers) | `...` |
| `APPLE_CLIENT_ID` | Optional | [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list) | `...` |
| `APPLE_CLIENT_SECRET` | Optional | [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list) | `...` |

### Payments (Stripe)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Optional | [Stripe API Keys](https://dashboard.stripe.com/apikeys) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Optional | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | [Stripe API Keys](https://dashboard.stripe.com/apikeys) | `pk_test_...` |

### Email (Resend)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Optional | [Resend API Keys](https://resend.com/api-keys) | `re_...` |
| `EMAIL_FROM` | Optional | Your verified sender address | `support@example.com` |

### Error Tracking (Sentry)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `SENTRY_DSN` | Optional | [Sentry Project Settings](https://sentry.io) | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | [Sentry Project Settings](https://sentry.io) | `https://...@sentry.io/...` |
| `SENTRY_AUTH_TOKEN` | Optional | [Sentry User Settings](https://sentry.io/settings/account/api/auth-tokens/) | `...` |
| `SENTRY_ORG` | Optional | Sentry Organization Slug | `your-org-slug` |
| `SENTRY_PROJECT` | Optional | Sentry Project Slug | `your-project-slug` |

### Analytics (PostHog)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | [PostHog Settings](https://us.posthog.com/project/settings) | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | [PostHog Settings](https://us.posthog.com/project/settings) | `https://us.i.posthog.com` |

### Notifications (Knock)
| Variable | Required | Dashboard / Where to Get | Example Value |
| --- | --- | --- | --- |
| `KNOCK_API_KEY` | Optional | [Knock API Keys](https://dashboard.knock.app/settings/keys) | `sk_test_...` |
| `NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY` | Optional | [Knock API Keys](https://dashboard.knock.app/settings/keys) | `pk_test_...` |

### Framework & Application
| Variable | Required | Description | Example Value |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | The URL for your main application | `http://localhost:3000` |
| `NEXT_PUBLIC_WEB_URL` | Optional | The URL for your marketing site (if separate) | `http://localhost:3001` |
| `VERCEL_URL` | Optional | Automatically set by Vercel | `...vercel.app` |

### Related References
- [Credential Setup Guide](credential-setup-guide.md)
- [Browser Automation Scripts](credential-setup-scripts.md)
- [next-forge Specific Setup](next-forge-setup.md)
