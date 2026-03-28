# Prompt: Auth UI E2E Tests (Playwright)

> Requires: dev server running (bunx next dev -p 3000 --webpack)
> Skills: eval-driven-dev, dogfood-complete, better-auth-test-utils, better-auth-ui, playwright-best-practices
> Priority: Core E2E coverage — run after API tests pass

```
Using eval-driven-dev + dogfood-complete, create Playwright E2E tests for all Better Auth UI components in omoios-forge.

Load skills: eval-driven-dev, dogfood-complete, better-auth-test-utils, better-auth-ui, playwright-best-practices

Project: ~/Coding/Projects/omoios-forge
Playwright config: apps/app/playwright.config.ts
Existing dogfood doc: docs/dogfood/001-auth-flow.md (has selectors)
Dev server: cd apps/app && bunx next dev -p 3000 --webpack

Write tests at: apps/app/e2e/

### Auth Pages

1. Sign Up Page (/auth/sign-up) — form renders, fields work, submit creates user, validation errors shown
2. Sign In Page (/auth/sign-in) — form renders, valid login redirects, invalid shows error toast
3. Forgot Password (/auth/forgot-password) — form renders, submit shows success

### Authenticated Components (use getCookies fixture)

4. Dashboard (/) — middleware redirects unauth, auth user sees sidebar
5. UserButton — shows name, dropdown with sign out, sign out clears session
6. OrganizationSwitcher — shows orgs, create new, switch active

### Account Settings

7. Account Settings (/account/settings) — name/email/avatar cards render
8. Security Settings (/account/security) — password change, sessions list

Auth fixture using better-auth test-utils getCookies() for cookie injection.
IMPORTANT: Dev server MUST use --webpack flag.
```
