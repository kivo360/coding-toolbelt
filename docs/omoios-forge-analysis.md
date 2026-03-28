# omoios-forge Project Analysis

> Custom next-forge fork at ~/Coding/Projects/omoios-forge
> Last analyzed: 2026-03-28

## Architecture

```
apps/                          packages/
├── app     (3000) main app    ├── auth           Better Auth + UI (was Clerk)
├── web     (3001) marketing   ├── database       Drizzle + postgres-js (was Prisma)
├── api     (3002) API server  ├── design-system  shadcn/ui + Tailwind
├── diag    (3006) diagnostics ├── payments       Stripe
├── docs    Mintlify           ├── email          Resend
├── email   React Email        ├── analytics      PostHog + GA
├── storybook                  ├── observability   Sentry + BetterStack
└── studio  Drizzle Studio     ├── notifications   Knock
                               ├── security       Arcjet + Nosecone
                               ├── rate-limit     Upstash Redis
                               ├── ai             AI SDK + OpenAI
                               ├── cms            BaseHub
                               ├── collaboration  Liveblocks
                               ├── webhooks       Svix
                               ├── storage        Vercel Blob
                               ├── feature-flags  Flags
                               ├── internationalization  next-international
                               ├── seo            Metadata + JSON-LD
                               ├── next-config    Next.js config
                               └── typescript-config

## Custom Modifications (vs stock next-forge)

| Aspect | Stock next-forge | omoios-forge |
|--------|------------------|--------------|
| Auth | Clerk | Better Auth + @daveyplate/better-auth-ui |
| Auth plugins | N/A | organization, apiKey, admin |
| DB ORM | Prisma | Drizzle ORM (postgres-js driver) |
| Package manager | npm/pnpm | Bun (hoisted node_modules) |
| Schema convention | snake_case | camelCase (Better Auth) + snake_case (app) |
| Auth env vars | CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY | BETTER_AUTH_SECRET, BETTER_AUTH_URL |

## Auth Stack Details

**Server** (packages/auth/server.ts):
- betterAuth with drizzleAdapter, provider: "pg"
- Plugins: organization(), apiKey(), admin()
- emailAndPassword: enabled
- Exports toNextJsHandler

**Client** (packages/auth/client.ts):
- createAuthClient with organizationClient, apiKeyClient, adminClient
- Re-exports: AuthView, UserButton, OrganizationSwitcher, SignedIn, SignedOut

**Provider** (packages/auth/provider.tsx):
- AuthUIProvider wrapping with authClient, navigate, replace, onSessionChange
- credentials.forgotPassword: true

**Route handler**: apps/app/app/api/auth/[...all]/route.ts
**Middleware**: packages/auth/proxy.ts (skips /api/auth, /auth, /sign-in, /sign-up)

**CRITICAL RULE**: All app imports MUST go through @repo/auth/client, never directly from @daveyplate/better-auth-ui

## Database Schema

Tables: user, session, account, verification, organization, member, invitation, apikey, page
- Better Auth tables use camelCase columns
- App tables use snake_case columns
- Admin fields: role, banned, banReason, banExpires on user
- Org fields: activeOrganizationId on session, impersonatedBy on session

## Eval System Status

- 168 eval IDs mapped across surfaces
- Phase 1 (infra): 27 pass / 0 fail / 5 blocked
- 17 eval tasks planned: 6 done, 11 TODO
- Zero Playwright .spec.ts files exist
- One dogfood doc: docs/dogfood/001-auth-flow.md
- Eval harness: tests/eval-harness/ (README + grading strategy only)

## Known Issues

- apps/diag crashes on Turbopack workspace root inference
- New users without org see 404 on / (expected: page.tsx requires orgId)
- CSS cache bug requires --webpack flag for dev server
- Knock/AI/Storage blocked (no API keys)

## Dev Commands

```bash
bun run dev                    # Start all apps (Turbopack)
bun run test                   # Run all tests via turbo
bun run db:generate            # Generate Drizzle migrations
bun run db:migrate             # Apply migrations
bun run db:push                # Push schema directly
bun run db:studio              # Open Drizzle Studio
bunx next dev -p 3000 --webpack  # Start app with webpack (CSS fix)
```
```

## Required Env Vars

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ chars>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```
