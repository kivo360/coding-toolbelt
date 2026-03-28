# Prompt: Import Rule & Package Boundary Verification

> Requires: no server needed
> Skills: none (direct grep)
> Priority: Run early — catches import violations that cause runtime errors

```
Verify the monorepo auth import rule in omoios-forge is enforced.

Project: ~/Coding/Projects/omoios-forge

RULE: "All app imports MUST go through @repo/auth/client — never import @daveyplate/better-auth-ui directly from apps/"

Search for violations:
1. Grep apps/ for direct imports from @daveyplate/better-auth-ui
2. Grep apps/ for direct imports from better-auth (should use @repo/auth/*)
3. Verify packages/auth/client.ts re-exports everything apps need
4. Verify packages/auth/provider.tsx is the only AuthUIProvider instantiation
5. Verify packages/design-system has the better-auth-ui CSS import

Check for Clerk residue:
- grep -r "@clerk" (excluding node_modules)
- grep -r "CLERK_" in .env files
- grep for ClerkProvider, useClerk, useAuth from Clerk

List all violations with file paths and fix recommendations.
```
