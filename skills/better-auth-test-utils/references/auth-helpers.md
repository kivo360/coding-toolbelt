# Authentication Helpers

## Table of Contents
- [Introduction](#introduction)
- [login Method](#login-method)
- [login Return Shape](#login-return-shape)
- [getAuthHeaders Method](#getauthheaders-method)
- [getCookies Method](#getcookies-method)
- [Choosing the Right Helper](#choosing-the-right-helper)
- [Domain Configuration](#domain-configuration)
- [Related References](#related-references)

## Introduction
The `auth-helpers` provide essential methods for generating and retrieving the information needed to simulate authenticated users in your tests. This includes generating sessions, cookies, and HTTP headers.

## login Method
The `login()` method is a powerful utility that generates an active session for a given user ID without requiring an actual password or social login flow.

```typescript
const ctx = await auth.$context;
const test = ctx.test;

const user = await test.saveUser(test.createUser());
const authData = await test.login({ userId: user.id });
```

## login Return Shape
The `login()` method returns an object containing everything you need to authenticate across various contexts:

| Property | Type | Description |
|----------|------|-------------|
| `session` | `Session` | The actual Session object with properties like `userId`, `token`, and `expiresAt`. |
| `user` | `User` | The associated User object. |
| `headers` | `Headers` | A native Headers object containing the session cookie (useful for `fetch` or `Request`). |
| `cookies` | `Cookie[]` | An array of cookie objects compatible with browsers like Playwright and Puppeteer. |
| `token` | `string` | The session token as a raw string. |

## getAuthHeaders Method
If you only need the HTTP headers to make authenticated API requests, use `getAuthHeaders()`. It returns a native `Headers` object with the session cookie already set.

```typescript
const headers = await test.getAuthHeaders({ userId: user.id });

const response = await fetch("/api/protected", {
    headers: headers
});
```

## getCookies Method
The `getCookies()` method returns an array of cookie objects. This is primarily used for setting cookies in a browser automation tool.

```typescript
const cookies = await test.getCookies({
    userId: user.id,
    domain: "localhost" // Optional domain parameter
});
```

The returned cookie objects have the following shape:
- `name`: (e.g., "better-auth.session_token")
- `value`: The actual session token
- `domain`: The domain for the cookie
- `path`: The path (usually "/")
- `httpOnly`: Boolean
- `secure`: Boolean
- `sameSite`: "Lax", "Strict", or "None"

## Choosing the Right Helper
- **API Tests (Vitest/Node):** Use `login()` or `getAuthHeaders()` for simple header-based authentication.
- **E2E Tests (Playwright/Cypress):** Use `getCookies()` to inject authentication directly into the browser context.
- **Full Context:** Use `login()` when you need the `Session` object details for additional logic.

## Domain Configuration
When using `getCookies()`, ensure the `domain` matches the URL you are testing. For local development, this is typically "localhost".

```typescript
const cookies = await test.getCookies({
    userId: user.id,
    domain: "myapp.test"
});
```

## Related References
- [Setup & Configuration](./setup.md)
- [Playwright Integration](./playwright-integration.md)
- [Vitest Integration](./vitest-integration.md)
- [Common Patterns & Fixtures](./common-patterns.md)
