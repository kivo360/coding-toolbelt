# Prompt: Visual QA Inspection

> Requires: dev server running, agent-browser installed
> Skills: dogfood-complete, agent-browser, better-auth-ui
> Priority: Catch visual/UX issues before writing more tests

```
Using dogfood-complete QA mode, visually inspect all Better Auth UI components in omoios-forge.

Load skills: dogfood-complete, agent-browser, better-auth-ui

Project: ~/Coding/Projects/omoios-forge
Dev server: cd apps/app && bunx next dev -p 3000 --webpack

Explore and produce QA report with annotated screenshots:

1. /auth/sign-in — layout, fields, buttons, responsive at 375px
2. /auth/sign-up — name/email/password fields, button, link to sign-in
3. /auth/forgot-password — email field, submit, back link
4. / (authenticated) — sidebar, OrganizationSwitcher, UserButton
5. Account settings pages (/account/*)

For each page:
- agent-browser screenshot --annotate
- agent-browser errors (console)
- agent-browser snapshot -i (accessibility)

Issue taxonomy: Functional, UX, Visual, Console, Content
Severity: Critical, Major, Minor, Info

Check: CSS rendering, dark mode, mobile responsive, no FOUC, no console errors
```
