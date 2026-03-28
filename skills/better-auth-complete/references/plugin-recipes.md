# Plugin Recipes & Composition

## Table of Contents
- [Plugin Installation Pattern](#plugin-installation-pattern)
- [Import Paths](#import-paths)
- [Recipe 1: Email/Password + Google OAuth + Verification](#recipe-1-emailpassword--google-oauth--verification)
- [Recipe 2: 2FA + Organizations](#recipe-2-2fa--organizations)
- [Recipe 3: Full SaaS Auth Stack](#recipe-3-full-saas-auth-stack)
- [Recipe 4: API-First Auth (Bearer + Keys)](#recipe-4-api-first-auth-bearer--keys)
- [Recipe 5: Passwordless (Magic Link + Passkey)](#recipe-5-passwordless-magic-link--passkey)
- [Plugin Ordering & Configuration](#plugin-ordering--configuration)

## Plugin Installation Pattern
Each plugin requires server-side, client-side, and CLI registration.

1. **Server**: Add to `plugins: [...]` in `betterAuth()`.
2. **Client**: Add to `plugins: [...]` in `createAuthClient()`.
3. **CLI**: Run `npx @better-auth/cli@latest migrate` (or generate) to add tables/columns.

## Import Paths
Import from dedicated paths for better tree-shaking and type safety.

```typescript
// Good
import { twoFactor } from "better-auth/plugins/two-factor";
// Bad
import { twoFactor } from "better-auth/plugins";
```

## Recipe 1: Email/Password + Google OAuth + Verification
The classic B2C setup.

```typescript
// server/auth.ts
plugins: [
    emailAndPassword({
        requireEmailVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerification(user.email, url);
        }
    })
],
socialProviders: {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
}
```

## Recipe 2: 2FA + Organizations
Common for B2B applications.

```typescript
// server/auth.ts
plugins: [
    twoFactor({ issuer: "B2B SaaS" }),
    organization()
]
```

## Recipe 3: Full SaaS Auth Stack
Email, Social, 2FA, Orgs, Admin, Bearer.

```typescript
// server/auth.ts
plugins: [
    emailAndPassword({ enabled: true }),
    twoFactor({ issuer: "My App" }),
    organization(),
    admin(),
    bearer()
]
```

## Recipe 4: API-First Auth (Bearer + Keys)
For mobile apps and third-party developers.

```typescript
// server/auth.ts
import { apiKey } from "better-auth/plugins/api-key";

plugins: [
    bearer(),
    apiKey()
]
```

## Recipe 5: Passwordless (Magic Link + Passkey)
Maximum UX with modern standards.

```typescript
// server/auth.ts
import { magicLink } from "better-auth/plugins/magic-link";
import { passkey } from "better-auth/plugins/passkey";

plugins: [
    magicLink({
        sendMagicLink: async ({ user, url }) => {
            await sendLink(user.email, url);
        }
    }),
    passkey()
]
```

## Plugin Ordering & Configuration
Plugins don't strictly require a specific order, but they are executed in the order they appear.

| Plugin | Server Import | Client Import | Scoped Package? |
|--------|---------------|---------------|-----------------|
| twoFactor | better-auth/plugins/two-factor | twoFactorClient | No |
| organization | better-auth/plugins/organization | organizationClient | No |
| admin | better-auth/plugins/admin | adminClient | No |
| bearer | better-auth/plugins/bearer | — | No |
| passkey | better-auth/plugins/passkey | passkeyClient | No |
| sso | better-auth/plugins/sso | — | No |

*Note: Passkey and SSO are built-in, no longer separate scoped packages in v1.*

## Skills Referenced
- `better-auth-best-practices`
- `organization-best-practices`

## Related References
- [Two-Factor Implementation](./2fa-implementation.md)
- [Security Checklist](./security-checklist.md)
