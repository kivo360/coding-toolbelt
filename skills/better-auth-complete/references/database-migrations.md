# Database Setup & Migrations

## Table of Contents
- [Adapter Selection Guide](#adapter-selection-guide)
- [Setting Up Adapters](#setting-up-adapters)
- [Migration Commands](#migration-commands)
- [Model Name vs Table Name](#model-name-vs-table-name)
- [Custom Field Mapping](#custom-field-mapping)
- [Additional Fields](#additional-fields)
- [Custom ID Generation](#custom-id-generation)
- [Schema Customization](#schema-customization)

## Adapter Selection Guide
- **Direct connections**: Best for simplicity or serverless (PostgreSQL, MySQL, SQLite).
- **ORM adapters**: Best when you already use Prisma or Drizzle for your app's main database.

## Setting Up Adapters
Each adapter requires a connection instance or an ORM client.

### PostgreSQL Direct
```typescript
import { Pool } from "pg";

database: new Pool({
    connectionString: process.env.DATABASE_URL
})
```

### Prisma
```typescript
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
database: prismaAdapter(prisma, {
    provider: "postgresql" // or "mysql", "sqlite", "mongodb"
})
```

### Drizzle
```typescript
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

database: drizzleAdapter(db, {
    provider: "pg" // or "mysql", "sqlite"
})
```

### MongoDB
```typescript
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL!);
database: mongodbAdapter(client.db())
```

## Migration Commands
Always run migrations after adding or changing plugins.

| Adapter | Command |
|---------|---------|
| Built-in (Direct) | `npx @better-auth/cli@latest migrate` |
| Prisma | `npx @better-auth/cli generate --output ./prisma/schema.prisma` |
| Drizzle | `npx @better-auth/cli generate --output ./db/schema.ts` |

## Model Name vs Table Name
Better Auth uses **model names** internally. If your Prisma model is `User` mapping to table `users`, use `modelName: "user"`.

## Custom Field Mapping
Map Better Auth's internal fields to your database's column names.

```typescript
user: {
    modelName: "user",
    fields: {
        email: "user_email",
        name: "full_name"
    }
}
```

## Additional Fields
Add custom data to user, session, or account models.

```typescript
user: {
    additionalFields: {
        role: { type: "string", defaultValue: "user" },
        bio: { type: "string" }
    }
}
```
*Note: Run `migrate` or `generate` after adding fields.*

## Custom ID Generation
Override default random IDs (32-char strings).

```typescript
advanced: {
    database: {
        generateId: "uuid" // or "serial", or a custom function
    }
}
```

## Schema Customization
Plugins like `organization` add several tables (Organization, Member, Invitation).

```typescript
plugins: [
    organization({
        modelNames: {
            organization: "Team",
            member: "TeamMember"
        }
    })
]
```

## Skills Referenced
- `better-auth-best-practices`
- `better-auth-security-best-practices`

## Related References
- [Session & Cookie Management](./session-and-cookies.md)
- [Plugin Recipes](./plugin-recipes.md)
