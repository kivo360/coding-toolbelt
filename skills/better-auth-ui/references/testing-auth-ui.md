# Testing Auth UI with Dogfood Complete

## Table of Contents
- [Overview](#overview)
- [Testing Sign In](#testing-sign-in)
- [Testing Sign Up](#testing-sign-up)
- [Testing Social Buttons](#testing-social-buttons)
- [Testing Forgot Password](#testing-forgot-password)
- [Testing Account Settings](#testing-account-settings)
- [Testing Organizations](#testing-organizations)
- [Generating Regression Tests](#generating-regression-tests)
- [Related References](#related-references)

## Overview
Use the `dogfood-complete` skill + `agent-browser` + `better-auth-test-utils` to test your auth UI. This allows for both manual exploration and automated regression tests.

## Testing Sign In
Use `agent-browser` to navigate to your sign-in page and simulate a user login.

```bash
# Explore manually
omo-explore-agent "Navigate to /auth/sign-in and login with test@example.com"
```

### Resulting Playwright Test
```tsx
import { test, expect } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
});
```

## Testing Sign Up
Verify that custom fields appear and work correctly on the sign-up page.

```bash
# Explore manually
omo-explore-agent "Go to /auth/sign-up, verify 'Company' field exists, and create account"
```

### Resulting Playwright Test
```tsx
test("user can sign up with custom fields", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await page.fill('input[name="name"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.fill('input[name="company"]', "Acme Inc.");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Welcome, John Doe")).toBeVisible();
});
```

## Testing Social Buttons
Ensure your enabled social providers appear correctly.

```bash
# Explore manually
omo-explore-agent "Snapshot /auth/sign-in and verify Google and GitHub buttons are visible"
```

### Resulting Playwright Test
```tsx
test("social login buttons are present", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
});
```

## Testing Forgot Password
Test the full flow of requesting a reset link.

```bash
# Explore manually
omo-explore-agent "Navigate to forgot password, submit email, verify success message"
```

### Resulting Playwright Test
```tsx
test("forgot password flow", async ({ page }) => {
  await page.goto("/auth/forgot-password");
  await page.fill('input[type="email"]', "test@example.com");
  await page.click('button[type="submit"]');
  await expect(page.getByText(/email has been sent/i)).toBeVisible();
});
```

## Testing Account Settings
Use `better-auth-test-utils` to bypass the sign-in flow and test account settings directly.

```bash
# Pre-authenticate via test utils
omo-explore-agent "Authenticate as test@example.com using test-utils, then go to /account/settings"
```

### Resulting Playwright Test
```tsx
import { getAuthCookies } from "@/lib/test-utils";

test("account settings cards are visible", async ({ page, context }) => {
  const cookies = await getAuthCookies("test@example.com");
  await context.addCookies(cookies);
  
  await page.goto("/account/settings");
  await expect(page.getByText("Update Avatar")).toBeVisible();
  await expect(page.getByText("Update Name")).toBeVisible();
});
```

## Testing Organizations
Test the organization switcher and management views.

```bash
# Explore manually
omo-explore-agent "Authenticate, create an organization, and verify it appears in the switcher"
```

### Resulting Playwright Test
```tsx
test("organization switcher displays created org", async ({ page, context }) => {
  const cookies = await getAuthCookies("test@example.com");
  await context.addCookies(cookies);
  
  await page.goto("/account/organizations");
  await page.fill('input[placeholder="Organization Name"]', "My New Org");
  await page.click('button:has-text("Create")');
  
  await page.click('button:has-text("My New Org")'); // From Switcher
  await expect(page).toHaveURL(/\/organizations\/.*\/settings/);
});
```

## Generating Regression Tests
Use the action log from your `omo-explore-agent` sessions to generate these tests automatically. The `dogfood-complete` skill provides patterns to convert exploration steps into clean Playwright code.

## Related References
- [Setup & Installation](./setup.md)
- [Component Reference](./components.md)
- [Account & Settings Pages](./account-pages.md)
