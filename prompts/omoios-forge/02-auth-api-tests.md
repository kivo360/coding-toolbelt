# Prompt: Auth API Integration Tests (Vitest)

> Requires: DATABASE_URL configured
> Skills: eval-driven-dev, better-auth-test-utils, better-auth-complete
> Priority: Run after migration audit passes

```
Using eval-driven-dev workflow, create Vitest integration tests for the Better Auth API in omoios-forge.

Load skills: eval-driven-dev, better-auth-test-utils, better-auth-complete

Project: ~/Coding/Projects/omoios-forge
Auth server: packages/auth/server.ts
Database: packages/database (Drizzle + postgres-js)

Write tests at: apps/app/__tests__/auth-api.test.ts

STAGE 3 (EVAL): Write these tests FIRST (they should fail initially):

1. Auth health check — GET /api/auth/ok returns { status: "ok" }
2. Sign up via API — POST with { email, password, name } returns user + session
3. Sign in via API — POST returns session token + set-cookie
4. Sign in with bad credentials — returns error, no session
5. Get session — with session cookie, returns user + session
6. Sign out — session invalidated, subsequent requests fail
7. Organization creation — after sign-in, create org, verify in DB
8. Organization membership — verify activeOrganizationId, member list

Use better-auth test-utils:
- testUtils.createUser() + saveUser() for test data
- testUtils.login({ userId }) for authenticated requests
- testUtils.deleteUser() for cleanup
```
