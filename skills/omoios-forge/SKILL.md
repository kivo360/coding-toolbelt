---
name: omoios-forge
description: >-
  Agent-driven development pipeline for omoios-forge SaaS boilerplate. 7-stage workflow
  with strong enforcement: Scope → PRD → Spec → Evals → Build → E2E → Dogfood.
  Trigger on "forge", "omoios-forge", "pipeline", "add feature", "build feature",
  "scaffold", or any project with STEERING_RULES.md or .agents/pipeline-config.json.
  Extends eval-driven-dev with forge-specific tooling.
---

# omoios-forge Pipeline

Seven stages. Tests before code. Real UI, not stubs. Proof before shipping.

## Enforcement

**Strong nudge.** Follow each stage in order. Skipping a stage requires explicit justification stated in your response: "I'm skipping Stage N because [reason]."

**DO NOT jump to code. DO NOT skip scoping. DO NOT generate bare stubs.**

---

## Stage 0: SETUP

**Goal:** Verify the project is healthy and determine where to start.

**Actions:**
```bash
bun run forge doctor --json
bun run forge status --json
```

Read `STEERING_RULES.md` — internalize these rules. They're enforced by regression evals.
Read `ROADMAP.md` — find the current state and next feature cycle.

**Routing:**

| Status | Next Stage |
|--------|-----------|
| `features: []` | Stage 1 (Scope) — read ROADMAP.md for first pending cycle |
| Feature in `"specced"` | Stage 4 (Evals) |
| Feature in `"building"` | Stage 5 (Build) — continue eval loop |
| Feature evals all pass | Stage 6 (E2E) |
| All features done | Stage 1 (Scope) — next pending cycle from ROADMAP.md |

**DO NOT proceed past this stage without a healthy doctor check.**

---

## Stage 1: SCOPE (Socratic Method)

**Goal:** Narrow one feature to what ships in one build cycle.

**DO NOT write code, create files, or run commands in this stage.**

Ask deep, layered questions:

**Layer 1 — Problem Space:**
- What problem does this feature solve?
- Who uses it? (Map to roles: owner/admin/member)
- What does "done" look like from the user's perspective?

**Layer 2 — Scope Narrowing:**
- You listed N things. Which ONE ships first?
- What is explicitly NOT in this cycle?
- Can this be split smaller?

**Layer 3 — Dependencies:**
- Does this depend on an entity that doesn't exist yet?
- Does this need an external integration? (Stripe, email, webhooks)

### Output

Update `ROADMAP.md` with the scoped brief:

```markdown
### Cycle N: {Feature Name}
**Scope:** {One sentence — what this cycle delivers}
**Status:** in-progress
**Spec:** specs/{feature}.spec.md
**Depends on:** {Previous cycle, if any}
```

**Gate:** One-sentence scope. User confirms. Scope is narrow enough for one build cycle. Move to Stage 2.

---

## Stage 2: PRD (Permission Matrices + Flows)

**Goal:** Define WHO can do WHAT, and what happens when things go wrong.

**DO NOT write code in this stage.**

Interview the user through 5 rounds. Ask until every cell is filled:

### Round 1: Actors
```markdown
| Actor | Role | Main Job |
|-------|------|----------|
| {Who} | owner/admin/member | {What they do in this feature} |
```

### Round 2: Entities
For each entity, list ALL fields with types:
```markdown
### {EntityName}
- id: text, primary key
- {field}: {type}, {required/optional}, {default}
- organizationId: text, required
- createdBy: text, required
- createdAt: timestamp, default now
```

### Round 3: Permission Matrix
```markdown
| Entity | Operation | Owner | Admin | Member |
|--------|-----------|-------|-------|--------|
| {Entity} | Create | Y/N | Y/N | Y/N |
| {Entity} | Read (own) | Y/N | Y/N | Y/N |
| {Entity} | Read (all) | Y/N | Y/N | Y/N |
| {Entity} | Update (own) | Y/N | Y/N | Y/N |
| {Entity} | Delete | Y/N | Y/N | Y/N |
```

**Every cell MUST be Y or N. No blanks. No "maybe".**

### Round 4: User Flows
For each primary action, document:
- **Happy path** — step by step, what happens
- **Failure path** — invalid input, unauthorized, server error
- **Edge case** — concurrent edits, scale, empty state

### Round 5: Cross-Actor Effects
```markdown
| When this happens... | ...this user is affected | ...in this way |
|---------------------|-------------------------|----------------|
```

**Gate:** Every actor has role. Every entity has complete permission matrix. Flows have failure paths. User approves. Move to Stage 3.

---

## Stage 3: SPEC (Machine-Readable)

**Goal:** Convert PRD into a spec file the CLI can parse.

Write to `specs/{feature}.spec.md`:

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
- file: actions/{feature}/{action-name}.ts
- input: { field: type }
- auth: required
- permissions: { owner: Y/N, admin: Y/N, member: Y/N }

## Constraints
- {Validation rules, uniqueness, business rules}

## Out of Scope
- {What's deferred to later cycles}
```

**Rules:**
- One command per Server Action file
- Column names are camelCase (organizationId, not organization_id)
- Every entity MUST have: id, organizationId, createdBy, createdAt
- File paths are relative to `apps/app/app/`

**Gate:** Every entity typed. Every command documented. Every permission has Y or N. Move to Stage 4.

---

## Stage 4: EVALS (Tests Before Code)

**Goal:** Generate eval scripts that define "done." All evals should FAIL right now — that's correct.

```bash
bun run forge gen evals {feature} --spec specs/{feature}.spec.md
```

Review generated scripts:
- Entity evals check if Drizzle table exists in schema.ts
- Command evals check if action files exist with getSession + org scoping
- Permission test stubs in `apps/app/__tests__/permissions/{feature}/`

Verify scripts are executable:
```bash
ls -la .claude/evals/{feature}/
bun run forge eval {feature} --json
```

Expected: most evals FAIL (code doesn't exist yet). This is correct.

**Gate:** Eval scripts exist and run. Move to Stage 5.

---

## Stage 5: BUILD (Code Until Tests Pass)

**Goal:** Write code until feature evals pass.

### Step 1: Scaffold
```bash
bun run forge gen feature {feature} --spec specs/{feature}.spec.md
```

### Step 2: Select Layout Pattern
Read the spec commands. Classify:

| Spec has... | Page pattern | Components needed |
|------------|-------------|-------------------|
| list command | Data table page | table, dialog, form, input |
| get/update command | Detail page with [id] route | card, tabs, form |
| Overview/metrics | Dashboard | card, chart |
| Configuration | Settings with tabs | tabs, form |

Pull components: `bunx --bun shadcn@latest add {table dialog form input}` in packages/design-system/

### Step 3: Database
Add Drizzle table to `packages/database/schema.ts`:
- camelCase column names
- Include organizationId, createdBy, createdAt
- Run: `bun run db:generate && bun run db:push`

### Step 4: Server Actions
Implement each command in `apps/app/app/actions/{feature}/{action}.ts`:
- `"use server"` directive
- `getSession()` from `@repo/auth/session`
- Check `session.activeOrganizationId` for org scoping
- Zod validation on input
- Return `{ data }` on success, `{ error }` on failure

### Step 5: Pages
Create page files per pattern:
- `apps/app/app/(authenticated)/{feature}/page.tsx` (Server Component)
- `apps/app/app/(authenticated)/{feature}/components/*.tsx` (Client components)
- Import Header from `../components/header`
- Use shadcn components with default variants — NO custom styling

### Step 6: Sidebar Registration
Edit `apps/app/app/(authenticated)/components/sidebar.tsx`:
- Add nav entry: `{ title: "{Feature}", url: "/{feature}", icon: {Icon} }`
- Import icon from lucide-react

### Step 7: Eval Loop
```bash
bun run forge eval {feature} --json         # Run after each change
bun run forge eval --regression --json      # When feature evals pass
bun run check                               # Lint check
```

Fix one failing eval at a time. Never delete or weaken an eval to make it pass.

**Conditional skills** — load based on spec content:
- Spec mentions email → load `react-email`, `resend`
- Spec mentions payments → load `stripe-best-practices`
- Spec mentions org roles → load `organization-best-practices`

**Gate:** All feature evals pass. Regression: 18 pass, 2 skip. `bun run check` passes. Move to Stage 6.

---

## Stage 6: E2E (Playwright Tests)

**Goal:** Generate and run Playwright tests for the feature.

### Page Object
Create `apps/app/e2e/page-objects/{feature}.po.ts`:
- Locators for all UI elements (use `getByRole`, `getByText`, `getByLabel`)
- Navigation: `goto()`, `expectLoaded()`
- Actions: one method per command (create, delete, edit)

### Test Suite
Create `apps/app/e2e/{feature}.spec.ts`:
- Test per permission matrix row: `test('{role} can/cannot {action}')`
- Navigation test: feature appears in sidebar
- Empty state test
- Auth fixtures from `e2e/fixtures/auth.ts`

### Run
```bash
bunx playwright test e2e/{feature}.spec.ts
```

**Gate:** All E2E tests pass. Page Object covers CRUD operations. Move to Stage 7.

---

## Stage 7: DOGFOOD (Visual QA)

**Goal:** Navigate the feature like a real user. Find what tests miss.

Use `agent-browser` to:
1. Navigate to feature via sidebar
2. Test CRUD as each role (owner, admin, member)
3. Capture annotated screenshots of each state
4. Check for console errors, broken layouts, missing empty states
5. Report bugs with severity classification

**Gate:** No P0/P1 bugs. All screenshots captured. QA report produced.

After Stage 7 → feature is DONE. Update ROADMAP.md status to `completed`. Start next cycle at Stage 0.

---

## Iteration

| Signal | Action |
|--------|--------|
| Spec was wrong | → Back to Stage 3 (fix spec, re-gen evals) |
| New edge case during build | → Back to Stage 4 (add eval) |
| Feature needs expansion | → Back to Stage 1 (re-scope) |
| QA found UI bugs | → Back to Stage 5 (fix, re-run evals) |
| All stages pass, user confirms | → **DONE** — update ROADMAP, next cycle |

---

## CLI Quick Reference

```bash
bun run forge doctor --json                  # Health check
bun run forge status --json                  # Pipeline state
bun run forge eval --regression --json       # Regression suite (18 pass, 2 skip)
bun run forge eval {feature} --json          # Feature evals
bun run forge gen evals {feature} --spec specs/{feature}.spec.md    # Generate evals
bun run forge gen feature {feature} --spec specs/{feature}.spec.md  # Scaffold code
```

## Steering Rules (Enforced by Evals)

| Rule | Enforcement |
|------|------------|
| Zero Styling | shadcn defaults only. No custom visual CSS. |
| Server Components | Data in Server Components. Mutations via Server Actions. |
| Auth Imports | `@repo/auth/client` only. Never import better-auth directly. |
| camelCase Schema | organizationId, createdBy, createdAt. Always. |
| Action Contract | `{ data }` or `{ error }`. One file per action. |
