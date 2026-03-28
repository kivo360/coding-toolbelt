# Fixture & POM Generation

Table of Contents
1. [Overview](#overview)
2. [POM Generation Trigger](#pom-generation-trigger)
3. [POM Structure](#pom-structure)
4. [Fixture Generation](#fixture-generation)
5. [Generated Project Structure](#generated-project-structure)
6. [Related References](#related-references)

## Overview
This reference defines how to generate reusable test infrastructure from `agent-browser` sessions. By extracting common patterns into Page Object Models (POMs) and fixtures, we create stable and maintainable test suites.

## POM Generation Trigger
A Page Object should be generated when:
- **Action Threshold**: 3+ actions are captured on the same URL path or logical group.
- **Complexity Threshold**: Actions involve multi-step form completion (e.g., signup flow).
- **Repetition**: A flow is repeated across multiple sessions (e.g., navigating to Settings).

## POM Structure
The generated POM should be a simple class that encapsulates UI interactions.

```typescript
import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  // Standard navigation method
  async goto() { 
    await this.page.goto('/dashboard'); 
  }

  // Action methods based on captured actions
  async createProject(name: string) {
    await this.page.getByRole('button', { name: 'Create Project' }).click();
    await this.page.getByRole('textbox', { name: 'Project Name' }).fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  // Verification methods based on pageState
  async verifyProjectCreated(name: string) {
    await expect(this.page.getByRole('heading', { name: name })).toBeVisible();
    await expect(this.page).toHaveURL(/.*\/projects\/.*/);
  }
}
```

## Fixture Generation
Fixtures should be used to provide clean, isolated instances of POMs and the `authenticatedContext`.

```typescript
import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { auth } from '../auth';

// Define the fixture types
type MyFixtures = {
  dashboardPage: DashboardPage;
  authenticatedContext: {
    asUser: (overrides?: any) => Promise<{ user: any; cleanup: () => Promise<void> }>;
  };
};

export const test = base.extend<MyFixtures>({
  // Provide the dashboard page
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  
  // Provide the authenticated context
  authenticatedContext: async ({ context }, use) => {
    const ctx = await auth.$context;
    const testUtils = ctx.test;
    
    await use({
      asUser: async (overrides = {}) => {
        const user = await testUtils.createUser(overrides);
        await testUtils.saveUser(user);
        const cookies = await testUtils.getCookies({ userId: user.id, domain: 'localhost' });
        await context.addCookies(cookies);
        return { user, cleanup: () => testUtils.deleteUser(user.id) };
      },
    });
  },
});
```

## Generated Project Structure
The generator should produce files in a structured format:

```text
tests/
├── auth.ts                   # Better Auth config for tests
├── fixtures/
│   ├── auth.ts               # Base test fixture with POMs and auth
│   └── test-data.ts          # Builder pattern for complex objects
├── pages/
│   ├── dashboard.page.ts     # Derived POM for the dashboard
│   └── settings.page.ts      # Derived POM for the settings
└── generated/
    └── project-flow.spec.ts  # The actual test using the fixtures
```

## Related References
- [Test Generation Rules](test-generation-rules.md)
- [Auth Testing with Better Auth](auth-testing-patterns.md)
- [Selector Derivation from @refs](selector-derivation.md)
