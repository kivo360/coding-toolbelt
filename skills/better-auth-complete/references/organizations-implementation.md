# Organizations, Teams & RBAC

## Table of Contents
- [1. Quick Setup](#1-quick-setup)
- [2. Creating Organizations](#2-creating-organizations)
- [3. Active Organization](#3-active-organization)
- [4. Members & Roles](#4-members-&-roles)
- [5. Invitations](#5-invitations)
- [6. Teams](#6-teams)
- [7. Roles & Permissions](#7-roles-&-permissions)
- [8. Custom Roles](#8-custom-roles)
- [9. Testing Organizations](#9-testing-organizations)
- [Skills Referenced](#skills-referenced)
- [Related References](#related-references)

## 1. Quick Setup

Add the organization plugin to the server and client.

```typescript
// Server (auth.ts)
import { organization } from "better-auth/plugins/organization";

export const auth = betterAuth({
    plugins: [organization()]
});

// Client (auth-client.ts)
import { organizationClient } from "better-auth/plugins/organization/client";

export const authClient = createAuthClient({
    plugins: [organizationClient()]
});
```

## 2. Creating Organizations

Frontend creation using the client.

```typescript
async function createOrg() {
    await authClient.organization.create({
        name: "Acme Inc",
        slug: "acme-inc"
    });
}
```

## 3. Active Organization

Better Auth automatically tracks the `activeOrganizationId` in the session.

```typescript
// Client
const { activeOrg } = authClient.useSession();

// Change active org
await authClient.organization.setActive({
    organizationId: "new-org-id"
});
```

## 4. Members & Roles

Members belong to an organization and have a role (default: "owner", "admin", "member").

```typescript
// Add a member (server-side)
await auth.api.addMember({
    organizationId: "org-id",
    userId: "user-id",
    role: "member"
});
```

## 5. Invitations

Enable email-based invitations.

```typescript
organization({
    sendInvitationEmail: async (data, request) => {
        const { invitation, url } = data;
        await sendEmail({
            to: invitation.email,
            subject: `Join ${invitation.organizationName}`,
            text: `Click here to join: ${url}`
        });
    }
})
```

## 6. Teams

Enable smaller sub-groups within an organization.

```typescript
organization({
    teams: {
        enabled: true,
        limit: 10 // Max teams per org
    }
})
```

## 7. Roles & Permissions

Check if a user can perform an action.

```typescript
// Server-side
const member = await auth.api.getMember({ organizationId, userId });
if (member.role === "admin") {
    // allow action...
}
```

## 8. Custom Roles

Define your own role structure.

```typescript
organization({
    roles: {
        editor: ["post:create", "post:edit"],
        viewer: ["post:read"]
    }
})
```

## 9. Testing Organizations

Using `test-utils` and Playwright for organization flows.

```typescript
test("authenticated org member fixture", async ({ browser }) => {
    const ctx = await auth.$context;
    const user = await ctx.test.createUser();
    const org = await ctx.test.createOrganization({ name: "Acme Corp" });
    await ctx.test.addMember({ organizationId: org.id, userId: user.id, role: "admin" });

    const { cookies } = await ctx.test.login({ userId: user.id });
    const context = await browser.newContext();
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto(`/org/${org.id}/dashboard`);
    await expect(page.getByText("Acme Corp")).toBeVisible();
});
```

## Skills Referenced
- organization-best-practices: Deep dive into the plugin.
- better-auth-best-practices: Core configuration.
- playwright-best-practices: Test fixtures and locators.

## Related References
- [Playwright Auth Testing Patterns](./playwright-auth-patterns.md)
- [Testing Auth Flows](./testing-auth-flows.md)
