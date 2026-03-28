# Selector Derivation from @refs

Table of Contents
1. [Overview](#overview)
2. [Ref Mapping to Playwright](#ref-mapping-to-playwright)
3. [Priority Order](#priority-order)
4. [Handling Duplicates](#handling-duplicates)
5. [Common Example Mappings](#common-example-mappings)
6. [Anti-Patterns](#anti-patterns)
7. [Related References](#related-references)

## Overview
This reference defines how to convert `agent-browser` `@ref` identifiers into stable, accessible-first Playwright selectors. The `agent-browser` snapshot provides a unique mapping of an ID to an ARIA role and an accessible name.

## Ref Mapping to Playwright
The core mapping uses `page.getByRole(role, { name: 'name' })`.

| Agent Browser Snapshot Output | Playwright Selector |
| :--- | :--- |
| `@e1 [link] "Dashboard"` | `page.getByRole('link', { name: 'Dashboard' })` |
| `@e2 [button] "Sign In"` | `page.getByRole('button', { name: 'Sign In' })` |
| `@e3 [textbox] "Username"` | `page.getByRole('textbox', { name: 'Username' })` |
| `@e4 [checkbox] "Agree"` | `page.getByRole('checkbox', { name: 'Agree' })` |
| `@e5 [combobox] "Category"` | `page.getByRole('combobox', { name: 'Category' })` |
| `@e6 [heading] "Project Settings"` | `page.getByRole('heading', { name: 'Project Settings' })` |

## Priority Order
When generating selectors, always follow this order of preference to ensure tests remain resilient to structural changes:

1. **getByRole**: Use when a clear ARIA role and accessible name are available.
2. **getByLabel**: Prefer for form fields if the snapshot indicates a clear label association.
3. **getByPlaceholder**: Use when no label is present but a placeholder exists.
4. **getByText**: Use for finding static content that doesn't have a semantic role.
5. **getByTestId**: Use only as a last resort if defined in the source code.
6. **CSS/XPath**: Strictly forbidden unless testing low-level structural issues.

## Handling Duplicates
When multiple elements share the same role and name, use locator chaining to scope the search within a parent container.

### Captured Session Output:
```
@e10 [listitem] "Project Alpha"
@e11 [button] "Delete" (inside @e10)
@e12 [listitem] "Project Beta"
@e13 [button] "Delete" (inside @e12)
```

### Derived Selector:
```typescript
// Chain from the specific list item to the specific button
await page
  .getByRole('listitem', { name: 'Project Alpha' })
  .getByRole('button', { name: 'Delete' })
  .click();
```

## Common Example Mappings

### Example 1: Navigation Link
- **Snapshot**: `@e1 [link] "Settings"`
- **Selector**: `page.getByRole('link', { name: 'Settings' })`
- **Why**: Semantic, easy to read, and survives re-styling.

### Example 2: Input Field with Label
- **Snapshot**: `@e2 [textbox] "Billing Email"`
- **Selector**: `page.getByLabel('Billing Email')`
- **Why**: More specific than `getByRole('textbox')` if there are multiple textboxes.

### Example 3: Modal Close Button
- **Snapshot**: `@e3 [button] "Close"`
- **Selector**: `page.getByRole('button', { name: 'Close' })`
- **Why**: Handles both icons with `aria-label="Close"` and literal text.

## Anti-Patterns
Avoid these brittle selectors when generating tests:
- `page.locator('button:nth-child(3)')`: Breaks if another button is added.
- `page.locator('.btn-primary.save-btn')`: Breaks if the class name changes.
- `page.locator('div > div > p')`: Breaks on any structural shift.

## Related References
- [Test Generation Rules](test-generation-rules.md)
- [Fixture & POM Generation](fixture-generation.md)
