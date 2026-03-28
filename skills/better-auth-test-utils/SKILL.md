---
name: better-auth-test-utils
description: >-
  Use when writing integration or E2E tests for apps using Better Auth. Covers the testUtils plugin
  for creating test users, authenticated sessions, cookie injection for Playwright/Puppeteer,
  OTP capture, database helpers, and test fixtures. Trigger on "test utils," "test helpers,"
  "getCookies," "test factory," "mock auth," "test session," "OTP capture," "authenticated test,"
  "e2e auth setup," "integration test auth," "Playwright cookies," or "test user factory."
  For auth configuration, see better-auth-best-practices. For security hardening, see
  better-auth-security-best-practices.
---

# Better Auth Test Utils

Testing utilities for integration and E2E testing against Better Auth. Provides factories, database helpers, authenticated session creation, and OTP capture.

**This plugin is for test environments only. Never use in production.**

## Quick Start

```typescript
// 1. Add plugin to auth config
import { betterAuth } from "better-auth"
import { testUtils } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [testUtils()]
})

// 2. Access helpers via context
const ctx = await auth.$context
const test = ctx.test
```

## Activity-Based Reference Guide

| Activity | Reference |
|----------|-----------|
| **Installing & configuring the plugin** | [setup.md](references/setup.md) |
| **Creating test data objects** | [factories.md](references/factories.md) |
| **Persisting/cleaning test data** | [database-helpers.md](references/database-helpers.md) |
| **Creating authenticated sessions** | [auth-helpers.md](references/auth-helpers.md) |
| **Testing OTP/email verification flows** | [otp-capture.md](references/otp-capture.md) |
| **Playwright E2E test setup** | [playwright-integration.md](references/playwright-integration.md) |
| **Vitest/integration test setup** | [vitest-integration.md](references/vitest-integration.md) |
| **Reusable patterns & fixtures** | [common-patterns.md](references/common-patterns.md) |

## API Surface

### Factories (no database writes)

| Method | Returns | Notes |
|--------|---------|-------|
| `test.createUser(overrides?)` | User object | Defaults: random email, "Test User", emailVerified: true |
| `test.createOrganization(overrides?)` | Organization object | Requires organization plugin |

### Database Helpers (persist/delete)

| Method | Returns | Notes |
|--------|---------|-------|
| `test.saveUser(user)` | Saved user | Writes to database |
| `test.deleteUser(userId)` | void | Removes user and related data |
| `test.saveOrganization(org)` | Saved org | Requires organization plugin |
| `test.deleteOrganization(orgId)` | void | Requires organization plugin |
| `test.addMember({ userId, organizationId, role })` | Member | Requires organization plugin |

### Auth Helpers (session creation)

| Method | Returns | Notes |
|--------|---------|-------|
| `test.login({ userId })` | `{ session, user, headers, cookies, token }` | Full session with all formats |
| `test.getAuthHeaders({ userId })` | `Headers` object | For fetch/Request usage |
| `test.getCookies({ userId, domain? })` | Cookie array | Playwright/Puppeteer compatible |

### OTP Capture (requires `captureOTP: true`)

| Method | Returns | Notes |
|--------|---------|-------|
| `test.getOTP(identifier)` | OTP string | By email or phone |
| `test.clearOTPs()` | void | Reset captured OTPs between tests |

## Decision Tree

```
What kind of test are you writing?
│
├─ Integration test (no browser)?
│  ├─ Need authenticated API calls → auth-helpers.md, vitest-integration.md
│  ├─ Need test data → factories.md, database-helpers.md
│  └─ Testing OTP flows → otp-capture.md
│
├─ E2E test (Playwright)?
│  ├─ Need authenticated pages → playwright-integration.md (getCookies + addCookies)
│  ├─ Testing login/signup UI → auth-helpers.md (setup only, test UI directly)
│  ├─ Testing OTP verification UI → otp-capture.md, playwright-integration.md
│  └─ Need reusable auth fixture → common-patterns.md
│
└─ Setting up test infrastructure?
   ├─ First time setup → setup.md
   ├─ Creating Playwright fixtures → common-patterns.md
   └─ Organizing test data → factories.md, database-helpers.md
```

## Critical Patterns

### Playwright: Skip Login UI for Feature Tests

```typescript
// DON'T: Navigate login page in every test
test("dashboard test", async ({ page }) => {
  await page.goto("/login");
  await page.fill("[name=email]", "test@example.com"); // slow, flaky
  // ...
});

// DO: Inject auth cookies directly
test("dashboard test", async ({ context, page }) => {
  const cookies = await testUtils.getCookies({ userId: user.id, domain: "localhost" });
  await context.addCookies(cookies);
  await page.goto("/dashboard"); // already authenticated
});
```

### Test Isolation

```typescript
// Every test creates its own user and cleans up
test("feature test", async ({ context, page }) => {
  const user = testUtils.createUser({ email: `test-${Date.now()}@example.com` });
  await testUtils.saveUser(user);

  try {
    const cookies = await testUtils.getCookies({ userId: user.id });
    await context.addCookies(cookies);
    // ... test logic ...
  } finally {
    await testUtils.deleteUser(user.id);
  }
});
```

## Related Skills

- `better-auth-best-practices` — Auth server/client configuration
- `better-auth-security-best-practices` — Rate limiting, CSRF, secrets
- `playwright-best-practices` — Test structure, locators, assertions
- `dogfood-test-pipeline` — Exploratory testing → Playwright test generation
