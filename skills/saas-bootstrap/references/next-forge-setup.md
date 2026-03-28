# next-forge Specific Setup

- [Monorepo Structure](#monorepo-structure)
- [Auth Integration](#auth-integration)
- [Database Configuration](#database-configuration)
- [Environment Variable Strategy](#environment-variable-strategy)
- [Detecting next-forge Projects](#detecting-next-forge-projects)
- [Modified next-forge Patterns](#modified-next-forge-patterns)
- [Related References](#related-references)

`saas-bootstrap` works seamlessly with `next-forge` monorepos. This guide explains how to adapt the standard setup for a monorepo architecture.

### Monorepo Structure
`next-forge` uses a standard Turborepo structure. `saas-bootstrap` targets specific folders:

- **apps/web**: The main marketing and application site.
- **apps/app**: The authenticated application site (if separate).
- **apps/api**: A dedicated API service (if applicable).
- **packages/database**: Shared database client and schema (Drizzle or Prisma).
- **packages/auth**: Shared authentication logic and configuration (Better Auth).
- **packages/design-system**: Shared UI components (Radix, Tailwind).

### Auth Integration
In a `next-forge` setup, authentication is often centralized in `packages/auth/`.
- **Better Auth Config**: Located at `packages/auth/index.ts` or `packages/auth/better-auth.ts`.
- **Better Auth Client**: Located at `packages/auth/client.ts`.
- **API Handler**: Exported from `packages/auth/` and consumed by `apps/web/app/api/auth/[...better-auth]/route.ts`.

### Database Configuration
`next-forge` defaults to Drizzle in `packages/database/`.
- **Drizzle Schema**: `packages/database/schema.ts` or `packages/database/src/schema/*.ts`.
- **Drizzle Client**: `packages/database/index.ts` or `packages/database/src/index.ts`.
- **Migration Script**: `packages/database/migrate.ts`.

### Environment Variable Strategy
`next-forge` uses `dotenv-config` or Turborepo's native `.env` handling.
- **Shared `.env`**: Often a `.env` file exists at the root, with specific `.env.local` files in each app.
- **Turbo Passthrough**: Ensure `turbo.json` includes your environment variables in the `globalEnv` or specific task `env` array.
- **Client Side**: Use the `NEXT_PUBLIC_` prefix for variables needed in the browser.

### Detecting next-forge Projects
Look for these signals to identify a `next-forge` project:
- Existence of `apps/web/` and `packages/database/`.
- `turbo.json` at the project root.
- A `packages/auth/` folder.
- `next-forge` mentioned in `package.json` "author" or "description" fields.

### Modified next-forge Patterns
Many users modify `next-forge` to suit their needs. `saas-bootstrap` supports:
- **Better Auth instead of Clerk**: If `packages/auth/` contains Better Auth logic, bypass Clerk-specific setup.
- **Drizzle instead of Prisma**: If `packages/database/` contains Drizzle configuration, follow Drizzle patterns.
- **Single App Mode**: If `apps/web` and `apps/app` are merged into a single `apps/web`, adjust file targets accordingly.

### Related References
- [Environment Variable Reference](env-reference.md)
- [Credential Setup Guide](credential-setup-guide.md)
