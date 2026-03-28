# Common Patterns & Fixtures

## Table of Contents
- [Introduction](#introduction)
- [Playwright Base Fixture](#playwright-base-fixture)
- [Auto-Cleanup Fixture Pattern](#auto-cleanup-fixture-pattern)
- [Role-Based Testing Fixture](#role-based-testing-fixture)
- [Multi-User Test Fixture](#multi-user-test-fixture)
- [OTP Verification Fixture](#otp-verification-fixture)
- [Test Data Builder Pattern](#test-data-builder-pattern)
- [Combining with Organization Plugin](#combining-with-organization-plugin)
- [Related References](#related-references)

## Introduction
Using common patterns and reusable fixtures improves test readability, ensures consistency, and automates repetitive tasks like user creation and cleanup.

## Playwright Base Fixture
This foundational fixture extends Playwright's `test` with `testUtils` and an `authenticatedContext` helper.

```typescript
import { test as base } from '@playwright/test';
import { auth } from '../auth';
import type { TestHelpers } from 'better-auth/plugins';

type AuthFixtures = {
  testUtils: TestHelpers;
  authenticatedContext: {
    asUser: (overrides?: Record<string, any>) => Promise<{
      user: any;
      cleanup: () => Promise<void>;
    }>;
  };
};

export const test = base.extend<AuthFixtures>({
  testUtils: async ({}, use) => {
    const ctx = await auth.$context;
    await use(ctx.test);
  },
  authenticatedContext: async ({ context, testUtils }, use) => {
    const cleanups: (() => Promise<void>)[] = [];
    await use({
      asUser: async (overrides = {}) => {
        const user = testUtils.createUser(overrides);
        await testUtils.saveUser(user);
        const cookies = await testUtils.getCookies({
          userId: user.id,
          domain: 'localhost',
        });
        await context.addCookies(cookies);
        cleanups.push(() => testUtils.deleteUser(user.id));
        return { user, cleanup: () => testUtils.deleteUser(user.id) };
      },
    });
    for (const cleanup of cleanups) await cleanup();
  },
});

export { expect } from '@playwright/test';
```

## Auto-Cleanup Fixture Pattern
The above `authenticatedContext` fixture demonstrates the auto-cleanup pattern using a `cleanups` array and `await use()`. This ensures every user created within the test is removed afterward.

## Role-Based Testing Fixture
You can extend the base fixture to provide specific user roles.

```typescript
export const test = base.extend({
  adminUser: async ({ authenticatedContext }, use) => {
    const { user } = await authenticatedContext.asUser({ role: "admin" });
    await use(user);
  },
  memberUser: async ({ authenticatedContext }, use) => {
    const { user } = await authenticatedContext.asUser({ role: "member" });
    await use(user);
  }
});
```

## Multi-User Test Fixture
Testing collaborative features like teams or messaging often requires multiple authenticated contexts.

```typescript
test("user A can invite user B", async ({ authenticatedContext, page }) => {
  const userA = await authenticatedContext.asUser();
  const userB = await authenticatedContext.asUser();
  // ... run test ...
});
```

## OTP Verification Fixture
Create a helper to automate the OTP verification flow.

```typescript
const verifyFlow = async (email: string) => {
  const otp = await testUtils.getOTP(email);
  await auth.api.verifyEmail({ email, otp });
};
```

## Test Data Builder Pattern
Combine `test.createUser()` with custom domain logic to build complex test data.

```typescript
const buildProject = async (test: any, user: any) => {
  const project = await db.project.create({
    data: { name: "Test Project", userId: user.id }
  });
  return project;
};
```

## Combining with Organization Plugin
Create full organizational structures for testing enterprise features.

```typescript
const setupTeam = async (test: any) => {
  const admin = await test.saveUser(test.createUser());
  const org = await test.saveOrganization(test.createOrganization({ name: "Team" }));
  await test.addMember({ userId: admin.id, organizationId: org.id, role: "admin" });
  return { admin, org };
};
```

## Related References
- [Playwright Integration](./playwright-integration.md)
- [Vitest Integration](./vitest-integration.md)
- [Database Helpers](./database-helpers.md)
- [OTP Capture](./otp-capture.md)
