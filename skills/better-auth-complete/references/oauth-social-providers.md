# OAuth & Social Providers

## Table of Contents
- [1. Configuration Pattern](#1-configuration-pattern)
- [2. Provider Setup](#2-provider-setup)
- [3. Generic OAuth Provider](#3-generic-oauth-provider)
- [4. Client-Side Sign In](#4-client-side-sign-in)
- [5. Account Linking](#5-account-linking)
- [6. Testing Social Auth](#6-testing-social-auth)
- [7. Common Pitfalls](#7-common-pitfalls)
- [Skills Referenced](#skills-referenced)
- [Related References](#related-references)

## 1. Configuration Pattern

Pass provider credentials in the `socialProviders` object.

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    database: prismaAdapter(prisma),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        }
    }
});
```

## 2. Provider Setup

- **Google**: Use [Google Cloud Console](https://console.cloud.google.com). Redirect URI: `https://yourdomain.com/api/auth/callback/google`.
- **GitHub**: Use [GitHub Developer Settings](https://github.com/settings/developers). Callback URL: `https://yourdomain.com/api/auth/callback/github`.
- **Apple**: Team ID, Key ID, and certificate required. Redirect URI: `https://yourdomain.com/api/auth/callback/apple`.
- **Discord**: Discord Developer Portal. Use the "OAuth2" section for Redirect URI: `https://yourdomain.com/api/auth/callback/discord`.

## 3. Generic OAuth Provider

For custom or unsupported providers.

```typescript
socialProviders: {
    generic: {
        id: "my-custom-provider",
        name: "MyCustom",
        authorizationUrl: "https://custom.com/oauth/authorize",
        tokenUrl: "https://custom.com/oauth/token",
        userinfoUrl: "https://custom.com/oauth/userinfo",
        clientId: process.env.CUSTOM_CLIENT_ID,
        clientSecret: process.env.CUSTOM_CLIENT_SECRET
    }
}
```

## 4. Client-Side Sign In

Initiate the flow with one line on the frontend.

```typescript
import { authClient } from "@/lib/auth-client";

async function loginWithGoogle() {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
    });
}
```

## 5. Account Linking

Enable linking multiple social accounts to the same user.

```typescript
export const auth = betterAuth({
    account: {
        accountLinking: {
            enabled: true
        }
    }
});
```

## 6. Testing Social Auth

Bypass the OAuth redirect UI in automated tests. Instead, use the `test-utils` to inject an authenticated session.

```typescript
// E2E Test (Playwright)
import { test } from "@playwright/test";
import { auth } from "@/lib/auth";

test("bypass social login", async ({ context }) => {
    const ctx = await auth.$context;
    const { cookies } = await ctx.test.login({ userId: "existing_user_id" });
    await context.addCookies(cookies);
    await page.goto("/dashboard");
});
```

## 7. Common Pitfalls

- **Redirect URI Mismatch**: Ensure `BETTER_AUTH_URL` matches exactly the domain registered in provider settings.
- **localhost URLs**: Most providers require `http://localhost:3000` to be explicitly added to the whitelist.
- **Missing Scopes**: Add `scopes: ["extra_scope"]` if your app needs more than basic profile info.

## Skills Referenced
- better-auth-best-practices: Core configuration.
- better-auth-security-best-practices: OAuth token encryption and security.

## Related References
- [Quick Start — Zero to Working Auth](./quick-start.md)
- [Testing Auth Flows](./testing-auth-flows.md)
