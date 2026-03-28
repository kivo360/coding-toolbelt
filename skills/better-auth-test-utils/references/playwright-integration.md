# Playwright Integration

## Table of Contents
- [Introduction](#introduction)
- [Authenticated Browser Context](#authenticated-browser-context)
- [Adding Cookies Pattern](#adding-cookies-pattern)
- [Full E2E Test Example](#full-e2e-test-example)
- [Setting Up Global Fixtures](#setting-up-global-fixtures)
- [StorageState Alternative](#storagestate-alternative)
- [Testing Protected Pages](#testing-protected-pages)
- [Role-Based Access Testing](#role-based-access-testing)
- [Screenshot Comparison](#screenshot-comparison)
- [Related References](#related-references)

## Introduction
Playwright integration allows you to run end-to-end tests against your application while seamlessly authenticating as different users. Better Auth's `test.getCookies()` is the primary tool for this.

## Authenticated Browser Context
An authenticated browser context is one where the necessary session cookies have already been injected, making the user appear "logged in" when navigating to protected pages.

```typescript
import { test, expect } from "@playwright/test";
import { auth } from "../lib/auth";

test("authenticated user can see dashboard", async ({ context, page }) => {
    const ctx = await auth.$context;
    const testHelpers = ctx.test;

    // 1. Create and save user
    const user = await testHelpers.saveUser(testHelpers.createUser());

    // 2. Get cookies for Playwright
    const cookies = await testHelpers.getCookies({
        userId: user.id,
        domain: "localhost"
    });

    // 3. Inject cookies into Playwright context
    await context.addCookies(cookies);

    // 4. Navigate to protected page
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back!")).toBeVisible();
});
```

## Adding Cookies Pattern
Using `context.addCookies()` is the recommended way to authenticate Playwright tests dynamically without hardcoding session data.

```typescript
const cookies = await testHelpers.getCookies({ userId: user.id });
await context.addCookies(cookies);
```

## Full E2E Test Example
Here is a complete test that creates a user, logs them in, and verifies page access.

```typescript
import { test, expect } from "@playwright/test";
import { auth } from "../lib/auth";

test.describe("Dashboard Access", () => {
    test("should redirect guest to login", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page).toHaveURL("/login");
    });

    test("should allow authenticated user", async ({ context, page }) => {
        const ctx = await auth.$context;
        const test = ctx.test;
        const user = await test.saveUser(test.createUser());
        const cookies = await test.getCookies({ userId: user.id, domain: "localhost" });
        
        await context.addCookies(cookies);
        await page.goto("/dashboard");
        await expect(page.locator("h1")).toContainText("Dashboard");
    });
});
```

## Setting Up Global Fixtures
For better maintainability, you can encapsulate the authentication logic into a custom Playwright fixture.

```typescript
// fixtures.ts
import { test as base } from "@playwright/test";
import { auth } from "./auth";

export const test = base.extend({
  authenticatedUser: async ({ context }, use) => {
    const ctx = await auth.$context;
    const user = await ctx.test.saveUser(ctx.test.createUser());
    const cookies = await ctx.test.getCookies({ userId: user.id, domain: "localhost" });
    await context.addCookies(cookies);
    await use(user);
    await ctx.test.deleteUser(user.id); // Cleanup
  }
});
```

## StorageState Alternative
While `storageState` is standard Playwright, `addCookies()` is more flexible for per-test user generation.

## Testing Protected Pages
Test that specific UI elements are only visible to authenticated users.

## Role-Based Access Testing
Use `test.saveUser()` with role overrides to verify different levels of access.

## Screenshot Comparison
Ensure the UI renders correctly for authenticated users using `expect(page).toHaveScreenshot()`.

## Related References
- [Authentication Helpers](./auth-helpers.md)
- [Common Patterns & Fixtures](./common-patterns.md)
- [Database Helpers](./database-helpers.md)
