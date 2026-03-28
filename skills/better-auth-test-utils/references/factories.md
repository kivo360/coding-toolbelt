# Test Data Factories

## Table of Contents
- [Introduction](#introduction)
- [createUser Factory](#createuser-factory)
- [Default Values](#default-values)
- [Factory Overrides](#factory-overrides)
- [createOrganization Factory](#createorganization-factory)
- [Generating Unique Test Data](#generating-unique-test-data)
- [Factory vs Database Helpers](#factory-vs-database-helpers)
- [Composition Patterns](#composition-patterns)
- [Related References](#related-references)

## Introduction
The `test.createUser()` and `test.createOrganization()` factories generate JavaScript objects with sensible defaults for testing. They do **not** write to the database by themselves, making them ideal for mocking or before being passed to a database helper.

## createUser Factory
The `createUser` method generates a complete user object with random identifiers.

```typescript
const ctx = await auth.$context;
const test = ctx.test;

const user = test.createUser();
```

## Default Values
By default, `createUser()` produces an object with the following properties:
- `id`: Random unique identifier
- `name`: "Test User"
- `email`: `user-xxx@example.com` (where xxx is random)
- `emailVerified`: `true`

## Factory Overrides
You can pass an object to `createUser()` to override any default fields.

```typescript
const admin = test.createUser({
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" // If using role plugin
});
```

## createOrganization Factory
If you have the `organization` plugin enabled, you can generate organization objects.

```typescript
// Requires organization plugin
const org = test.createOrganization({
    name: "Acme Corp",
    slug: "acme-corp"
});
```

## Generating Unique Test Data
To ensure unique emails across multiple tests, you can use `Date.now()` or random string generators within your factory calls.

```typescript
const uniqueUser = test.createUser({
    email: `test-${Date.now()}@example.com`
});

const cryptoUser = test.createUser({
    email: `user-${crypto.randomUUID()}@example.com`
});
```

## Factory vs Database Helpers
It is important to distinguish between creating the data and saving it.

| Tool | Action | Use Case |
|------|--------|----------|
| `test.createUser()` | Returns object | Mocking, data preparation, unit testing without DB. |
| `test.saveUser()` | Writes to DB | Integration testing, E2E testing, authentication flows. |

```typescript
// Pattern: Create then Save
const userData = test.createUser();
const savedUser = await test.saveUser(userData);
```

## Composition Patterns
You can create wrapper functions to generate specific types of test users.

```typescript
function createPremiumUser(test: any) {
    return test.createUser({
        plan: "premium",
        emailVerified: true
    });
}

const premiumUser = createPremiumUser(test);
```

## Related References
- [Setup & Configuration](./setup.md)
- [Database Helpers](./database-helpers.md)
- [Common Patterns & Fixtures](./common-patterns.md)
