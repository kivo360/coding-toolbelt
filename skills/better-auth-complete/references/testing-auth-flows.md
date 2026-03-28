# Testing Auth Flows

## Table of Contents
- [1. Test Strategy](#1-test-strategy)
- [2. Setting Up Test-Utils](#2-setting-up-test-utils)
- [3. Integration Tests (Vitest)](#3-integration-tests-vitest)
- [4. E2E Tests (Playwright)](#4-e2e-tests-playwright)
- [5. OTP Capture Pattern](#5-otp-capture-pattern)
- [6. Test Data Management](#6-test-data-management)
- [Skills Referenced](#skills-referenced)
- [Related References](#related-references)

## 1. Test Strategy

- **Unit/Integration**: Test server-side auth logic, session generation, and API endpoint protection with `test-utils`.
- **E2E**: Test UI components, forms, redirects, and state persistence with Playwright.

## 2. Setting Up Test-Utils

Add the test plugin to your auth server config. Access the test tools through `auth.$context`.

```typescript
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins/test-utils";

export const auth = betterAuth({
    database: prismaAdapter(prisma),
    plugins: [
        testUtils({
            captureOTP: true // Capture OTPs for testing
        })
    ]
});
```

## 3. Integration Tests (Vitest)

Fast tests for API security and user data.

```typescript
import { auth } from "@/lib/auth";
import { expect, test } from "vitest";

test("sign-up flow", async () => {
    const ctx = await auth.$context;
    const user = await ctx.test.createUser({ email: "test@example.com" });
    const { session } = await ctx.test.login({ userId: user.id });

    expect(session.userId).toBe(user.id);
});

test("protected route", async () => {
    const ctx = await auth.$context;
    const user = await ctx.test.createUser();
    const headers = await ctx.test.getAuthHeaders({ userId: user.id });

    const response = await fetch("http://localhost:3000/api/protected", { headers });
    expect(response.status).toBe(200);
});
```

## 4. E2E Tests (Playwright)

Full UI interactions.

```typescript
import { test, expect } from "@playwright/test";
import { auth } from "@/lib/auth";

test("login form interaction", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
});
```

## 5. OTP Capture Pattern

Testing flows like email verification without a real email server.

```typescript
test("email verification", async () => {
    const ctx = await auth.$context;
    const email = "user@example.com";
    await ctx.test.createUser({ email });

    // Trigger verification email
    await auth.api.sendVerificationEmail({ body: { email } });

    // Get the code from test-utils
    const { otp } = await ctx.test.getOTP(email);
    expect(otp).toBeDefined();

    // Verify
    await auth.api.verifyEmail({ body: { code: otp, email } });
});
```

## 6. Test Data Management

Ensure isolation between tests.

```typescript
import { auth } from "@/lib/auth";

test.beforeEach(async () => {
    const ctx = await auth.$context;
    await ctx.test.clearOTPs();
});

test("isolated user test", async () => {
    const ctx = await auth.$context;
    const uniqueEmail = `user_${Date.now()}@example.com`;
    const user = await ctx.test.createUser({ email: uniqueEmail });

    try {
        // Test logic...
    } finally {
        await ctx.test.deleteUser(user.id);
    }
});
```

## Skills Referenced
- better-auth-best-practices: Core configuration.
- playwright-best-practices: Playwright-specific test setup.

## Related References
- [Playwright Auth Testing Patterns](./playwright-auth-patterns.md)
- [Email Verification & Password Reset](./email-flows.md)
