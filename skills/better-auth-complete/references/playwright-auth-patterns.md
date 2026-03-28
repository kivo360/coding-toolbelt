# Playwright Auth Testing Patterns

## Table of Contents
- [1. The Auth Fixture](#1-the-auth-fixture)
- [2. Skip Login UI](#2-skip-login-ui)
- [3. Test Login UI](#3-test-login-ui)
- [4. Test Sign-Up Flow](#4-test-sign-up-flow)
- [5. Test 2FA Flow](#5-test-2fa-flow)
- [6. Test Role-Based Access](#6-test-role-based-access)
- [7. Test Organization Context](#7-test-organization-context)
- [8. Session Expiry & Logout](#8-session-expiry-&-logout)
- [Skills Referenced](#skills-referenced)
- [Related References](#related-references)

## 1. The Auth Fixture

Extend Playwright's base test to include `authContext` and `testUtils`.

```typescript
import { test as base } from "@playwright/test";
import { auth } from "@/lib/auth";

export const test = base.extend({
    authenticatedContext: async ({ browser }, use) => {
        const ctx = await auth.$context;
        const user = await ctx.test.createUser();
        const { cookies } = await ctx.test.login({ userId: user.id });

        const context = await browser.newContext();
        await context.addCookies(cookies);
        await use(context);
        await context.close();
        await ctx.test.deleteUser(user.id);
    }
});
```

## 2. Skip Login UI

Use this pattern for 90% of your tests to speed up the suite.

```typescript
test("authenticated dashboard features", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back!")).toBeVisible();
});
```

## 3. Test Login UI

Specifically test the form, validation, and error states.

```typescript
test("login UI validation", async ({ page }) => {
    await page.goto("/signin");
    await page.click('button[type="submit"]'); // Empty submit
    await expect(page.getByText("Email is required")).toBeVisible();

    await page.fill('input[name="email"]', "invalid-email");
    await expect(page.getByText("Invalid email format")).toBeVisible();
});
```

## 4. Test Sign-Up Flow

Testing form submission + email verification via OTP capture.

```typescript
test("full signup flow", async ({ page }) => {
    const ctx = await auth.$context;
    const email = `new_${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Capture OTP from test-utils
    const { otp } = await ctx.test.getOTP(email);
    await page.fill('input[name="otp"]', otp);
    await page.click('button[name="verify"]');

    await expect(page).toHaveURL("/dashboard");
});
```

## 5. Test 2FA Flow

Pattern for multi-step authentication.

```typescript
test("2FA challenge", async ({ page }) => {
    const ctx = await auth.$context;
    const user = await ctx.test.createUser({ twoFactorEnabled: true });

    await page.goto("/signin");
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/2fa-verify");
    const { otp } = await ctx.test.getOTP(user.email);
    await page.fill('input[name="2fa-code"]', otp);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
});
```

## 6. Test Role-Based Access

Test both Admin and Member perspectives in one file.

```typescript
test.describe("RBAC", () => {
    test("admin can delete users", async ({ browser }) => {
        const ctx = await auth.$context;
        const admin = await ctx.test.createUser({ role: "admin" });
        const { cookies } = await ctx.test.login({ userId: admin.id });

        const context = await browser.newContext();
        await context.addCookies(cookies);
        const page = await context.newPage();
        await page.goto("/admin/users");
        await expect(page.getByRole("button", { name: "Delete" })).toBeEnabled();
    });
});
```

## 7. Test Organization Context

Testing shared workspace features.

```typescript
test("organization features", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    const ctx = await auth.$context;

    // Server-side create organization
    const org = await ctx.test.createOrganization({ name: "Acme Inc" });
    await ctx.test.addMember({ organizationId: org.id, userId: "current_user_id" });

    await page.goto(`/org/${org.id}/settings`);
    await expect(page.getByText("Acme Inc")).toBeVisible();
});
```

## 8. Session Expiry & Logout

Verify token revocation.

```typescript
test("logout flow", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.goto("/dashboard");
    await page.click('button[name="logout"]');

    await expect(page).toHaveURL("/signin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/signin"); // Redirected because session is gone
});
```

## Skills Referenced
- playwright-best-practices: Core Playwright patterns.
- better-auth-best-practices: Auth plugin setup.

## Related References
- [Testing Auth Flows](./testing-auth-flows.md)
- [Organizations, Teams & RBAC](./organizations-implementation.md)
