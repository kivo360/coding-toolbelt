# Prompt: Database Schema Validation

> Requires: DATABASE_URL (for dry-run comparison)
> Skills: better-auth-complete, drizzle-orm
> Priority: Catches schema drift before E2E tests

```
Verify the Drizzle schema in omoios-forge matches what Better Auth expects.

Load skills: better-auth-complete, drizzle-orm

Project: ~/Coding/Projects/omoios-forge
Schema: packages/database/schema.ts
Auth server: packages/auth/server.ts (plugins: organization, apiKey, admin)

Check:
1. Run @better-auth/cli generate in dry-run and compare against existing schema
2. Verify columns for each plugin:
   - Core: user, session, account, verification
   - Organization: organization, member, invitation
   - API Key: apikey
   - Admin: role, banned, banReason, banExpires on user; impersonatedBy on session
3. Column types match (text IDs, timestamps with timezone)
4. Foreign keys (user → session, user → account, org → member, etc.)
5. camelCase convention consistent
6. Combined schema export includes all tables
7. Check for pending migrations: bun run db:generate then diff

Report missing columns, wrong types, or schema drift.
```
