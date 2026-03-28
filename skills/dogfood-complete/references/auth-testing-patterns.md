# Auth Testing with Better Auth

Table of Contents
1. [Overview](#overview)
2. [Testing Categories](#testing-categories)
3. [The Auth Fixture](#the-auth-fixture)
4. [Using the Test Utils](#using-the-test-utils)
5. [Auth Boundary Detection](#auth-boundary-detection)
6. [Related References](#related-references)

## Overview
This reference defines how to handle authentication in `dogfood-complete` generated tests. It utilizes the Better Auth `test-utils` API to create fast, reliable, and isolated test contexts.

## Testing Categories
There are two primary ways we test auth-related features:

### Category 1: Testing Auth UI
Used for testing the login, signup, and OTP flows.
- **Workflow**: `agent-browser` explores the UI; we generate full interaction tests.
- **Setup**: Use `testUtils.createUser` and `testUtils.saveUser` to prepare the database.
- **Cleanup**: Auto-handled by the `afterEach` hook or fixture cleanup.
- **Verification**: Use `testUtils.getOTP(identifier)` to retrieve codes for email verification tests.

### Category 2: Testing Features Behind Auth
Used for testing application features once logged in.
- **Workflow**: Bypass the login UI entirely for speed and stability.
- **Setup**: Use `getCookies()` and `context.addCookies()` via the `authenticatedContext` fixture.
- **Start State**: The test begins on the dashboard or internal URL, already authenticated.

## The Auth Fixture
Use this base fixture to enable automatic authentication.

```typescript
import { test as base } from '@playwright/test';
import { auth } from '../auth'; // Your better-auth config

export const test = base.extend({
  // Expose better-auth test utilities
  testUtils: async ({}, use) => {
    const ctx = await auth.$context;
    await use(ctx.test);
  },
  
  // Custom fixture to handle fast authentication
  authenticatedContext: async ({ context, testUtils }, use) => {
    const cleanups: (() => Promise<void>)[] = [];
    
    await use({
      asUser: async (overrides = {}) => {
        // Create and persist a test user
        const user = await testUtils.createUser(overrides);
        await testUtils.saveUser(user);
        
        // Retrieve and apply cookies to the context
        const cookies = await testUtils.getCookies({ 
          userId: user.id, 
          domain: 'localhost' 
        });
        await context.addCookies(cookies);
        
        const cleanup = async () => {
          await testUtils.deleteUser(user.id);
        };
        cleanups.push(cleanup);
        
        return { user, cleanup };
      },
    });
    
    // Global cleanup for this test context
    for (const cleanup of cleanups) await cleanup();
  },
});

export { expect } from '@playwright/test';
```

## Using the Test Utils
- `testUtils.createUser(overrides?)`: Creates a user object in memory.
- `testUtils.saveUser(user)`: Writes the user to the test database.
- `testUtils.getOTP(email)`: Returns the latest verification code for a user.
- `testUtils.login({ userId })`: Returns session data for manual header insertion.

### Example: Testing Email Verification
```typescript
test('user can verify email via OTP', async ({ page, testUtils }) => {
  const user = await testUtils.createUser({ email: 'test@example.com' });
  await testUtils.saveUser(user);
  
  await page.goto('/verify-email');
  await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
  await page.getByRole('button', { name: 'Send Code' }).click();
  
  const otp = await testUtils.getOTP(user.email);
  await page.getByRole('textbox', { name: 'Code' }).fill(otp);
  await page.getByRole('button', { name: 'Verify' }).click();
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Auth Boundary Detection
When generating tests from a session:
1. **Identify Boundary**: Look for `/login`, `/signup`, or `password` inputs.
2. **Split Sequence**: Everything before the boundary is ignored (if testing a feature) or kept (if testing auth).
3. **Inject Fixture**: If it's a feature test, start with `await authenticatedContext.asUser()`.

## Related References
- [Test Generation Rules](test-generation-rules.md)
- [Fixture & POM Generation](fixture-generation.md)
