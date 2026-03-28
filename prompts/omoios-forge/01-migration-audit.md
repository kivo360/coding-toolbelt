# Prompt: Migration Correctness Audit

> Requires: no server needed
> Skills: better-auth-complete, better-auth-ui, drizzle-orm
> Priority: Run FIRST — catches config issues before E2E

```
Audit the Better Auth migration in omoios-forge at ~/Coding/Projects/omoios-forge.

Load skills: better-auth-complete, better-auth-ui, drizzle-orm

Compare the ACTUAL implementation against the official next-forge migration guide AND Better Auth best practices. Check:

**Server config** (packages/auth/server.ts):
- [ ] Uses drizzleAdapter (NOT prismaAdapter)
- [ ] Provider set to "pg"
- [ ] Schema passed to adapter
- [ ] Plugins match client plugins (organization, apiKey, admin)
- [ ] Secret from BETTER_AUTH_SECRET env var
- [ ] baseURL from BETTER_AUTH_URL env var
- [ ] emailAndPassword enabled
- [ ] Exports toNextJsHandler

**Client config** (packages/auth/client.ts):
- [ ] Uses createAuthClient from better-auth/react
- [ ] Client plugins match server plugins (organizationClient, apiKeyClient, adminClient)
- [ ] Re-exports AuthView, UserButton, OrganizationSwitcher, SignedIn, SignedOut from @daveyplate/better-auth-ui
- [ ] Re-exports authViewPaths from @daveyplate/better-auth-ui/server

**Route handler** (apps/app/app/api/auth/[...all]/route.ts):
- [ ] Imports auth + toNextJsHandler from @repo/auth/server
- [ ] Exports both GET and POST

**AuthUIProvider** (packages/auth/provider.tsx):
- [ ] Wraps with AuthUIProvider from @daveyplate/better-auth-ui
- [ ] Passes authClient, navigate, replace, onSessionChange, Link
- [ ] credentials.forgotPassword enabled

**Middleware** (packages/auth/proxy.ts):
- [ ] Skips /api/auth, /auth, /sign-in, /sign-up paths
- [ ] Redirects unauthenticated users

**Database schema** (packages/database/schema.ts):
- [ ] Has all Better Auth required tables: user, session, account, verification
- [ ] Has organization plugin tables: organization, member, invitation
- [ ] Has apiKey plugin table: apikey
- [ ] Uses camelCase column names (Better Auth convention)
- [ ] Admin fields on user: role, banned, banReason, banExpires
- [ ] Session has activeOrganizationId and impersonatedBy

**Zero Clerk residue**:
- [ ] No @clerk imports anywhere
- [ ] No CLERK_ env vars
- [ ] No ClerkProvider

**Import rule**:
- [ ] All apps import from @repo/auth/client, NEVER directly from @daveyplate/better-auth-ui

Report any mismatches, missing fields, or inconsistencies.
```
