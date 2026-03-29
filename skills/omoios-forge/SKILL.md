---
name: omoios-forge
description: >-
  Eval-driven development pipeline for omoios-forge SaaS boilerplate. Reads app plan,
  generates comprehensive evals (schema, actions, pages, permissions, integration),
  then builds until all evals pass. No interview loops. Artifacts first.
  Trigger on "forge", "omoios-forge", "pipeline", "add feature", "build feature",
  or any project with STEERING_RULES.md or .agents/pipeline-config.json.
---

# omoios-forge Pipeline

Generate evals. Build until green. Dogfood. Ship.

**The evals ARE the pipeline.** Not stages. Not interviews. Evals define "done" — you build until they pass.

## Enforcement

**DO NOT ask more than 3 questions total before producing artifacts.**
If an app plan exists (docs/*.md, specs/*.md, ROADMAP.md), read it and START PRODUCING.
Questions are for missing information only, not for confirmation.

---

## Step 1: Assess (2 minutes max)

```bash
bun run forge doctor --json
bun run forge status --json
```

Read `STEERING_RULES.md`. Read `ROADMAP.md`. Read any docs/*.md app plans.

If a spec already exists for the current cycle → skip to Step 3.
If a plan exists but no spec → go to Step 2.
If nothing exists → ask the user what to build (max 3 questions), then Step 2.

---

## Step 2: Generate Spec (produce, don't interview)

Read the app plan. For the current ROADMAP cycle, PRODUCE `specs/{feature}.spec.md`:

```markdown
# Feature: {Name}

## Entities

### {EntityName}
- id: text, primary key
- {field}: {type}, {required/optional}, {default}
- organizationId: text, required
- createdBy: text, required
- createdAt: timestamp, default now

## Commands

### {commandName}
- type: Server Action
- file: actions/{feature}/{name}.ts
- input: { field: type }
- auth: required
- permissions: { owner: Y/N, admin: Y/N, member: Y/N }

## Constraints
- {rules}

## Out of Scope
- {deferred}
```

Show the spec to the user. One round of feedback, then move on.

---

## Step 3: Generate Comprehensive Evals

This is the core of the pipeline. Generate evals that cover EVERYTHING the feature needs.

### Schema Evals
For each entity, check:
- Table exists in `packages/database/schema.ts`
- Every field from spec exists as a column
- Required fields have `.notNull()`
- Primary key is set
- `organizationId`, `createdBy`, `createdAt` columns exist
- Correct types (text, timestamp, integer, etc.)

```bash
#!/bin/bash
# schema-bookmark-table.sh
rg 'export const bookmark = pgTable' packages/database/schema.ts || { echo "FAIL: bookmark table not found"; exit 1; }
rg 'organizationId.*text.*notNull' packages/database/schema.ts || { echo "FAIL: missing organizationId"; exit 1; }
rg 'createdBy.*text.*notNull' packages/database/schema.ts || { echo "FAIL: missing createdBy"; exit 1; }
rg 'createdAt.*timestamp.*defaultNow' packages/database/schema.ts || { echo "FAIL: missing createdAt"; exit 1; }
echo "PASS: bookmark schema correct"
```

### Action Evals
For each command, check:
- File exists at the spec path
- Has `"use server"` directive
- Imports and calls `getSession`
- Scopes queries by `organizationId`
- Has Zod validation on input
- Returns `{ data }` or `{ error }`

```bash
#!/bin/bash
# action-create-bookmark.sh
FILE="apps/app/app/actions/bookmarks/create.ts"
test -f "$FILE" || { echo "FAIL: $FILE not found"; exit 1; }
rg -q '"use server"' "$FILE" || { echo "FAIL: missing use server"; exit 1; }
rg -q 'getSession' "$FILE" || { echo "FAIL: missing getSession"; exit 1; }
rg -q 'organizationId' "$FILE" || { echo "FAIL: missing org scoping"; exit 1; }
rg -q 'data.*:|error.*:' "$FILE" || { echo "FAIL: missing return contract"; exit 1; }
echo "PASS: createBookmark action correct"
```

### Page Evals
For each page, check:
- Route file exists
- Uses Header component with breadcrumbs
- Is Server Component (no `"use client"` at top of page.tsx)
- Client components are in `components/` subfolder

```bash
#!/bin/bash
# page-bookmarks.sh
test -f "apps/app/app/(authenticated)/bookmarks/page.tsx" || { echo "FAIL: bookmarks page not found"; exit 1; }
rg -q 'Header' "apps/app/app/(authenticated)/bookmarks/page.tsx" || { echo "FAIL: missing Header"; exit 1; }
# page.tsx should NOT be a client component
head -1 "apps/app/app/(authenticated)/bookmarks/page.tsx" | rg -q '"use client"' && { echo "FAIL: page.tsx should be Server Component"; exit 1; }
echo "PASS: bookmarks page correct"
```

### Navigation Eval
```bash
#!/bin/bash
# nav-bookmarks-sidebar.sh
rg -q 'bookmarks\|Bookmarks' "apps/app/app/(authenticated)/components/sidebar.tsx" || { echo "FAIL: bookmarks not in sidebar"; exit 1; }
echo "PASS: bookmarks in sidebar"
```

### Permission Evals
For each permission matrix row, generate a Vitest test stub:
```typescript
// __tests__/permissions/bookmarks/owner-create.test.ts
describe("bookmark permissions", () => {
  it("owner can create bookmark", async () => {
    // Test implementation
  });
});
```

### Integration Evals
```bash
#!/bin/bash
# integration-lint.sh
bun run check 2>&1 | tail -5
EXIT_CODE=${PIPESTATUS[0]}
test $EXIT_CODE -eq 0 && echo "PASS: lint clean" || { echo "FAIL: lint errors"; exit 1; }
```

```bash
#!/bin/bash
# integration-db-generate.sh
bun run db:generate 2>&1 | tail -5
test ${PIPESTATUS[0]} -eq 0 && echo "PASS: db:generate succeeds" || { echo "FAIL: db:generate failed"; exit 1; }
```

### Eval Generation Summary

For a typical single-entity feature, generate:
- **5-8 schema evals** (table, each required column, types)
- **3-4 action evals per command** (exists, use server, auth, contract)
- **3-4 page evals** (exists, Header, Server Component, components)
- **1 navigation eval** (sidebar registration)
- **1 eval per permission matrix cell** (role × operation)
- **2-3 integration evals** (lint, db:generate, build)

Total: **25-40 evals** for a single-entity feature. More for complex features.

Make ALL eval scripts executable: `chmod +x .claude/evals/{feature}/*.sh`

Run them: `bun run forge eval {feature} --json`
Expected: ALL FAIL. That's correct. Now build.

---

## Step 4: Build Until Green

Work through this order. Run evals after EACH step.

### 4a. Database Schema
Add Drizzle table to `packages/database/schema.ts`. Export it from `packages/database/index.ts`.
```bash
bun run db:generate && bun run db:push
bun run forge eval {feature} --json   # Schema evals should now PASS
```

### 4b. Server Actions
Create one file per command in `apps/app/app/actions/{feature}/`:
- `"use server"` directive
- `getSession()` from `@repo/auth/session`
- Scope by `session.activeOrganizationId`
- Zod validation on input
- Return `{ data: T }` on success, `{ error: string }` on failure
```bash
bun run forge eval {feature} --json   # Action evals should now PASS
```

### 4c. Page + Components
Create the page and client components. Use shadcn defaults — zero custom styling.
Pull needed components: `bunx --bun shadcn@latest add {table dialog form input}`
```bash
bun run forge eval {feature} --json   # Page evals should now PASS
```

### 4d. Sidebar Registration
Add nav entry to `apps/app/app/(authenticated)/components/sidebar.tsx`.
```bash
bun run forge eval {feature} --json   # Navigation eval should now PASS
```

### 4e. Verify Everything
```bash
bun run forge eval {feature} --json        # ALL feature evals pass
bun run forge eval --regression --json     # 18 pass, 2 skip
bun run check                              # Lint clean
```

---

## Step 5: E2E Tests

Create Page Object + Playwright test:
```
apps/app/e2e/page-objects/{feature}.po.ts
apps/app/e2e/{feature}.spec.ts
```

Run: `bunx playwright test e2e/{feature}.spec.ts`

---

## Step 6: Dogfood

Navigate the feature like a real user. Test each role. Capture screenshots. Report bugs.

After dogfood passes → update ROADMAP.md status to `completed`. Next cycle.

---

## Iteration

| What failed | Fix |
|-------------|-----|
| Schema eval | Fix schema.ts, re-run db:generate |
| Action eval | Fix the action file |
| Page eval | Fix the page/component |
| Navigation eval | Add sidebar entry |
| Lint eval | Run `bun run fix` |
| Regression eval | You broke a steering rule — read STEERING_RULES.md |

---

## CLI Reference

```bash
bun run forge doctor --json                 # Health check
bun run forge status --json                 # Pipeline state
bun run forge eval --regression --json      # Regression (18 pass, 2 skip)
bun run forge eval {feature} --json         # Feature evals
bun run forge gen evals {feature} --spec specs/{feature}.spec.md
bun run forge gen feature {feature} --spec specs/{feature}.spec.md
```

## Steering Rules (Enforced by Regression Evals)

| Rule | What it means |
|------|--------------|
| Zero Styling | shadcn defaults only. Layout utilities fine. No visual CSS. |
| Server Components | Data in Server Components. Mutations via Server Actions. |
| Auth Imports | `@repo/auth/client` only. Never import better-auth directly. |
| camelCase Schema | organizationId, createdBy, createdAt. Always. |
| Action Contract | `{ data }` or `{ error }`. One file per action. No barrel exports. |
