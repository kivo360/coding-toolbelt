# Production Security Checklist

## Table of Contents
- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Rate Limiting Configuration](#rate-limiting-configuration)
- [Cookie Security Settings](#cookie-security-settings)
- [Complete Production Config Example](#complete-production-config-example)
- [Testing Security](#testing-security)

## Pre-deployment Checklist
- [ ] **BETTER_AUTH_SECRET**: Set to 32+ characters, high entropy.
- [ ] **BETTER_AUTH_URL**: Uses `https://` (mandatory in prod).
- [ ] **trustedOrigins**: Configured with all frontend domains/subdomains.
- [ ] **Rate Limiting**: Enabled and tested for `/sign-in`, `/sign-up`, and `/change-password`.
- [ ] **CSRF Protection**: Enabled (`disableCSRFCheck: false`).
- [ ] **Secure Cookies**: Enabled (`useSecureCookies: true`).
- [ ] **Email Verification**: Enabled and `sendVerificationEmail` is configured.
- [ ] **Password Reset**: `sendResetPassword` is configured and tested.
- [ ] **Session Expiry**: Set appropriately (e.g., `session.expiresIn: 60 * 60 * 24 * 7`).
- [ ] **OAuth Tokens**: `encryptOAuthTokens: true` if storing tokens for API access.
- [ ] **IP Tracking**: Configure headers (`x-forwarded-for`) if behind a proxy.
- [ ] **Audit Logging**: Implement `databaseHooks` for sensitive events.
- [ ] **Background Tasks**: Configure `waitUntil` for serverless (Vercel/Cloudflare).
- [ ] **2FA**: Available for sensitive apps.
- [ ] **All Auth Flows**: Tested via Integration and E2E (Playwright).

## Rate Limiting Configuration
Default limits: 100 requests / 10s. Sensitive endpoints: 3 requests / 10s.

```typescript
// server/auth.ts
rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
        "/api/auth/sign-in/email": { window: 60, max: 5 },
        "/api/auth/sign-up/email": { window: 60, max: 3 }
    }
}
```

## Cookie Security Settings
Use `sameSite: "lax"` (default) or `"strict"` for high security.

```typescript
// server/auth.ts
advanced: {
    useSecureCookies: true,
    cookiePrefix: "my-app",
    defaultCookieAttributes: {
        sameSite: "lax",
        httpOnly: true,
        path: "/"
    },
    // crossSubDomainCookies: { enabled: true, domain: ".example.com" }
}
```

## Complete Production Config Example
All core security settings in one block.

```typescript
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["https://app.example.com"],
    rateLimit: { enabled: true },
    session: {
        expiresIn: 604800, // 7 days
        updateAge: 86400, // 24 hours
        cookieCache: { enabled: true, strategy: "jwe" }
    },
    account: { encryptOAuthTokens: true },
    advanced: {
        useSecureCookies: true,
        ipAddress: { ipAddressHeaders: ["x-forwarded-for"] }
    }
});
```

## Testing Security
- **Rate Limits**: Run a script to call `/api/auth/sign-in/email` 10 times in 1s. Expect 429.
- **CSRF**: Call a POST endpoint without a proper origin header from a curl command.
- **Cookies**: Check browser devtools for `Secure`, `HttpOnly`, and `SameSite` flags.

## Skills Referenced
- `better-auth-security-best-practices`
- `email-and-password-best-practices`

## Related References
- [Session & Cookie Management](./session-and-cookies.md)
- [2FA Implementation](./2fa-implementation.md)
