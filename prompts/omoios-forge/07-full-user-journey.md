# Prompt: End-to-End Full User Journey

> Requires: dev server running, database configured
> Skills: eval-driven-dev, dogfood-complete, better-auth-test-utils, playwright-best-practices
> Priority: Run LAST — the ultimate integration test

```
Using eval-driven-dev, create a single Playwright test covering the complete user journey through omoios-forge.

Load skills: eval-driven-dev, dogfood-complete, better-auth-test-utils, playwright-best-practices

Project: ~/Coding/Projects/omoios-forge
Dev server: cd apps/app && bunx next dev -p 3000 --webpack

ONE test that covers the entire flow a new user experiences:

1. Visit / → redirected to /sign-in (middleware)
2. Click "Create an account" → /auth/sign-up
3. Fill name, email, password → submit
4. Verify sign-up succeeded
5. Navigate to /auth/sign-in → fill credentials → submit
6. Verify redirect to / (dashboard)
7. Sidebar renders: OrganizationSwitcher + UserButton
8. Dashboard shows empty/404 state (expected: no org yet)
9. Create organization via OrganizationSwitcher
10. Verify org is active
11. Navigate to account settings
12. Verify settings cards render
13. Sign out via UserButton
14. Verify redirect to sign-in
15. Verify / redirects to sign-in (session cleared)

This test uses NO shortcuts — tests the REAL UI flow.
Only use test-utils for cleanup (deleteUser) in afterAll.
```
