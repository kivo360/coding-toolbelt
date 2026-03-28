# Quick Start — Zero to Working Auth

## Table of Contents
- [1. Installation](#1-installation)
- [2. Environment Variables](#2-environment-variables)
- [3. Server Configuration](#3-server-configuration)
- [4. Client Configuration](#4-client-configuration)
- [5. Route Handlers](#5-route-handlers)
- [6. Database Migrations](#6-database-migrations)
- [7. Verification](#7-verification)
- [8. Basic UI Example](#8-basic-ui-example)
- [Skills Referenced](#skills-referenced)
- [Related References](#related-references)

## 1. Installation

Install the core package and the framework-specific client (React shown here).

```bash
npm install better-auth
```

## 2. Environment Variables

Create a `.env` file with your secret and base URL.

```bash
BETTER_AUTH_SECRET=your_32_char_random_secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://user:pass@localhost:5432/db
```

## 3. Server Configuration

Create `lib/auth.ts` to initialize the server.

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    }
});
```

## 4. Client Configuration

Create `lib/auth-client.ts`.

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
});
```

## 5. Route Handlers

Export the handler based on your framework.

| Framework | File Path | Handler Export |
|-----------|-----------|----------------|
| **Next.js App** | `app/api/auth/[...all]/route.ts` | `const handler = toNextJsHandler(auth); export { handler as GET, handler as POST };` |
| **Next.js Pages** | `pages/api/auth/[...all].ts` | `export default toNextJsHandler(auth);` |
| **SvelteKit** | `src/hooks.server.ts` | `export const handle = svelteKitHandler(auth);` |
| **Express** | `server.ts` | `app.all("/api/auth/*", toNodeHandler(auth));` |
| **Hono** | `index.ts` | `app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));` |

## 6. Database Migrations

Generate and apply the schema to your database.

```bash
npx @better-auth/cli@latest migrate
```

## 7. Verification

Check if the API is responding correctly.

```bash
curl http://localhost:3000/api/auth/ok
# Expected: {"status":"ok"}
```

## 8. Basic UI Example

A minimal sign-in form using the React client.

```typescript
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = async () => {
        await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard"
        });
    };

    return (
        <div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={handleSignIn}>Sign In</button>
        </div>
    );
}
```

## Skills Referenced
- better-auth-best-practices: Detailed server/client setup.
- email-and-password-best-practices: Deep dive into credential auth.

## Related References
- [OAuth & Social Providers](./oauth-social-providers.md)
- [Testing Auth Flows](./testing-auth-flows.md)
