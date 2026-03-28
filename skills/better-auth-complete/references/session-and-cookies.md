# Session & Cookie Management

## Table of Contents
- [Session Storage Priority](#session-storage-priority)
- [Session Configuration](#session-configuration)
- [Cookie Cache Strategies](#cookie-cache-strategies)
- [Cookie Attributes](#cookie-attributes)
- [Cross-Subdomain Cookies](#cross-subdomain-cookies)
- [Secondary Storage Setup](#secondary-storage-setup)
- [Session in Next.js Server Components](#session-in-nextjs-server-components)
- [Stateless Mode](#stateless-mode)
- [Session Invalidation Patterns](#session-invalidation-patterns)

## Session Storage Priority
Better Auth manages session data in three ways:

1. **`secondaryStorage`**: If defined (Redis/KV), sessions go there first.
2. **`session.storeSessionInDatabase`**: If `true`, ALSO persist to the database.
3. **`cookieCache`**: If no database + `cookieCache` is configured, fully stateless.

## Session Configuration
Set expiration and refresh intervals.

```typescript
session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (default)
    updateAge: 60 * 60 * 24, // Refresh every 24h (default)
    freshAge: 60 * 60 // 1 hour for "fresh" actions
}
```

## Cookie Cache Strategies
Reduce database lookups by caching session data in cookies.

- **`compact`**: Base64url + HMAC, smallest size (default).
- **`jwt`**: Standard JWT, readable but signed.
- **`jwe`**: Encrypted, best for sensitive session data.

```typescript
session: {
    cookieCache: {
        enabled: true,
        maxAge: 300, // 5 minutes
        strategy: "jwe"
    }
}
```

## Cookie Attributes
Security and scoping for auth cookies.

```typescript
advanced: {
    defaultCookieAttributes: {
        sameSite: "lax",
        httpOnly: true,
        secure: true,
        path: "/",
        prefix: "better-auth"
    }
}
```

## Cross-Subdomain Cookies
Share auth status between subdomains (e.g., `app.example.com` and `admin.example.com`).

```typescript
advanced: {
    crossSubDomainCookies: {
        enabled: true,
        domain: ".example.com" // Note the leading dot
    }
}
```

## Secondary Storage Setup
Use Redis or Upstash for high-performance session management.

```typescript
secondaryStorage: {
    get: async (key) => redis.get(key),
    set: async (key, value, ttl) => redis.set(key, value, { EX: ttl }),
    delete: async (key) => redis.del(key)
}
```

## Session in Next.js Server Components
Use the `nextCookies` plugin to access sessions on the server.

```typescript
// server/auth.ts
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    plugins: [nextCookies()]
});

// app/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
    headers: await headers()
});
```

## Stateless Mode
No database required. Sessions are stored entirely in signed/encrypted cookies.

```typescript
export const auth = betterAuth({
    session: {
        cookieCache: {
            enabled: true,
            strategy: "jwe"
        }
    }
});
```

## Session Invalidation Patterns
Programmatically revoke sessions.

```typescript
// Client-side
await authClient.signOut(); // Current session
await authClient.revokeSessions(); // All sessions for current user

// Server-side
await auth.api.revokeSession({ body: { id: "session-id" } });
```

## Skills Referenced
- `better-auth-best-practices`
- `better-auth-security-best-practices`

## Related References
- [Security Checklist](./security-checklist.md)
- [Database Setup & Migrations](./database-migrations.md)
