# Test Generation Rules

Table of Contents
1. [Overview](#overview)
2. [Generation Algorithm](#generation-algorithm)
3. [Auth Boundary Detection](#auth-boundary-detection)
4. [Action Mapping Table](#action-mapping-table)
5. [Complete Conversion Example](#complete-conversion-example)
6. [Related References](#related-references)

## Overview
This guide defines the complete algorithm for converting a captured `agent-browser` session into stable, reproducible Playwright tests. The goal is to transform a raw JSON action log into structured test code with appropriate fixtures and assertions.

## Generation Algorithm
1. **Parse JSON Action Log**: Extract all steps, screenshots, and metadata from the exploration session.
2. **Group Actions**: Cluster actions by URL path or logical flow (e.g., "Create Project", "User Settings").
3. **Detect Auth Boundaries**: Identify steps involving `/login`, `/signup`, or password fields to determine if the test needs full UI auth or if it can use the `getCookies` fixture.
4. **Replace Auth Sequences**: For non-auth feature tests, replace the manual login steps with a setup using the `authenticatedContext` fixture.
5. **Map Actions to Selectors**: Use the `@ref` mapping from the snapshot to derive `page.getByRole` selectors.
6. **Generate Assertions**: Convert `pageState` changes (URL shifts, element visibility) into `expect` calls.
7. **Add Error Handling**: Include assertions for any console errors captured during exploration.
8. **Manual Review Markers**: Insert `// TODO` comments for dynamic values (IDs, dates) that require parameterization.

## Auth Boundary Detection
Detecting an auth boundary is critical for test performance.
- **URL Patterns**: Matches on `/login`, `/signup`, `/register`, `/verify-email`.
- **Field Types**: Any `@ref` with `[password]` or `[textbox]` named "OTP" or "Verification Code".
- **Action Split**: When an auth boundary is detected in a feature test, split the log. Everything before the boundary becomes a fixture setup; everything after becomes the test body.

## Action Mapping Table

| Exploration Action | Playwright Code |
| :--- | :--- |
| `goto(url)` | `await page.goto(url);` |
| `click @e1 [button] "Save"` | `await page.getByRole('button', { name: 'Save' }).click();` |
| `fill @e2 [textbox] "Email" "k@h.com"` | `await page.getByRole('textbox', { name: 'Email' }).fill('k@h.com');` |
| `select @e3 [combobox] "Role" "Admin"` | `await page.getByRole('combobox', { name: 'Role' }).selectOption('Admin');` |
| `check @e4 [checkbox] "Agree"` | `await page.getByRole('checkbox', { name: 'Agree' }).check();` |
| URL change detected | `await expect(page).toHaveURL(/.*\/dashboard/);` |
| Element @e5 appears | `await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();` |

## Complete Conversion Example

### Raw JSON Action Log
```json
[
  { "action": "goto", "url": "http://localhost:3000/projects" },
  { "action": "click", "ref": "@e3", "role": "button", "name": "Create Project" },
  { "action": "fill", "ref": "@e5", "role": "textbox", "name": "Name", "value": "Alpha" },
  { "action": "click", "ref": "@e9", "role": "button", "name": "Submit" }
]
```

### Generated Playwright Test
```typescript
import { test, expect } from '../fixtures/auth';

test('user can create a new project', async ({ page, authenticatedContext }) => {
  // Setup: Start as an authenticated user
  const { user } = await authenticatedContext.asUser();
  
  await page.goto('/projects');
  
  // Step 1: Open creation modal
  await page.getByRole('button', { name: 'Create Project' }).click();
  
  // Step 2: Fill details
  // TODO: Parameterize project name if running in parallel
  await page.getByRole('textbox', { name: 'Name' }).fill('Alpha Project');
  
  // Step 3: Submit and verify
  await page.getByRole('button', { name: 'Submit' }).click();
  
  await expect(page).toHaveURL(/.*\/projects\/[a-zA-Z0-9]+/);
  await expect(page.getByRole('heading', { name: 'Alpha Project' })).toBeVisible();
});
```

## Related References
- [Selector Derivation from @refs](selector-derivation.md)
- [Auth Testing with Better Auth](auth-testing-patterns.md)
- [Fixture & POM Generation](fixture-generation.md)
