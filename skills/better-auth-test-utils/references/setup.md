# Setup & Configuration

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Basic Configuration](#basic-configuration)
- [Plugin Options](#plugin-options)
- [Accessing Test Helpers](#accessing-test-helpers)
- [Environment Considerations](#environment-considerations)
- [Type Imports](#type-imports)
- [Related References](#related-references)

## Introduction
The `testUtils` plugin for Better Auth provides essential utilities for testing authentication flows, including data factories, database helpers, and session generation. It is designed to be used in development and test environments to simplify the creation of authenticated states.

## Installation
The `testUtils` plugin is included in the core `better-auth` package. No additional installation is required beyond `better-auth` itself.

```typescript
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
```

## Basic Configuration
To enable the test utilities, add the `testUtils()` plugin to your Better Auth configuration.

```typescript
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";

export const auth = betterAuth({
    database: myDatabaseAdapter, // Required for database helpers
    plugins: [
        testUtils()
    ]
});
```

## Plugin Options
The `testUtils` plugin accepts an options object to configure specific behaviors.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `captureOTP` | `boolean` | `false` | When true, enables passive capture of generated OTPs for testing verification flows. |

```typescript
export const auth = betterAuth({
    plugins: [
        testUtils({
            captureOTP: true
        })
    ]
});
```

## Accessing Test Helpers
Test helpers are accessed through the `auth.$context` object. Since `$context` is an asynchronous getter, you must await it.

```typescript
const ctx = await auth.$context;
const testHelpers = ctx.test;

// Example usage
const user = testHelpers.createUser();
```

## Environment Considerations
The `testUtils` plugin should ideally only be active during testing. You can conditionally include it based on environment variables.

```typescript
const plugins = [];

if (process.env.NODE_ENV === "test") {
    plugins.push(testUtils());
}

export const auth = betterAuth({
    plugins
});
```

## Type Imports
If you need to type-hint your test utilities or shared helper functions, you can import the `TestHelpers` type.

```typescript
import type { TestHelpers } from "better-auth/plugins";

async function myHelper(test: TestHelpers) {
    return await test.createUser();
}
```

## Related References
- [Test Data Factories](./factories.md)
- [Database Helpers](./database-helpers.md)
- [Authentication Helpers](./auth-helpers.md)
