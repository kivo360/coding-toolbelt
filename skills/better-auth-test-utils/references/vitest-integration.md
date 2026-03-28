# Vitest Integration

## Table of Contents
- [Introduction](#introduction)
- [beforeAll Setup Pattern](#beforeall-setup-pattern)
- [Testing Auth API Endpoints](#testing-auth-api-endpoints)
- [Testing Protected Routes](#testing-protected-routes)
- [Testing Session Management](#testing-session-management)
- [User Roles in Tests](#user-roles-in-tests)
- [Organizing Test Suites](#organizing-test-suites)
- [Mocking vs Real Database](#mocking-vs-real-database)
- [Related References](#related-references)

## Introduction
Integrating Vitest with Better Auth test utilities is the standard way to test your authentication logic, protected API endpoints, and database interactions in isolation.

## beforeAll Setup Pattern
Use `beforeAll` to initialize the Better Auth context and `beforeEach` for cleanups.

```typescript
import { beforeAll, beforeEach, describe, it, expect } from "vitest";
import { auth } from "../lib/auth";

describe("Authentication API", () => {
    let test;

    beforeAll(async () => {
        const ctx = await auth.$context;
        test = ctx.test;
    });

    beforeEach(async () => {
        await test.clearOTPs(); // If using OTP capture
    });

    it("should successfully log in a user", async () => {
        const user = await test.saveUser(test.createUser());
        const loginData = await test.login({ userId: user.id });
        expect(loginData.session).toBeDefined();
    });
});
```

## Testing Auth API Endpoints
You can test your own API endpoints using the generated headers from `test.getAuthHeaders()`.

```typescript
it("should return profile information", async () => {
    const user = await test.saveUser(test.createUser());
    const headers = await test.getAuthHeaders({ userId: user.id });

    const response = await fetch("/api/profile", { headers });
    const data = await response.json();

    expect(data.email).toBe(user.email);
});
```

## Testing Protected Routes
Verify that unauthorized users are blocked from accessing protected resources.

```typescript
it("should reject unauthenticated requests", async () => {
    const response = await fetch("/api/private");
    expect(response.status).toBe(401);
});
```

## Testing Session Management
Test session creation, retrieval, and expiration.

```typescript
it("should correctly identify active sessions", async () => {
    const user = await test.saveUser(test.createUser());
    const { token } = await test.login({ userId: user.id });

    const session = await auth.api.getSession({
        headers: {
            cookie: `better-auth.session_token=${token}`
        }
    });
    expect(session.user.id).toBe(user.id);
});
```

## User Roles in Tests
Easily test role-based access control (RBAC) logic.

```typescript
it("should allow admins only", async () => {
    const admin = await test.saveUser(test.createUser({ role: "admin" }));
    const headers = await test.getAuthHeaders({ userId: admin.id });

    const response = await fetch("/api/admin/settings", { headers });
    expect(response.status).toBe(200);
});
```

## Organizing Test Suites
Group tests by functionality using `describe` blocks. For example:
- `describe("Authentication Flow")`
- `describe("User Management")`
- `describe("Organization Features")`

## Mocking vs Real Database
While test-utils support real databases through adapters, you can also use in-memory SQLite for faster test execution without external dependencies.

## Related References
- [Setup & Configuration](./setup.md)
- [Authentication Helpers](./auth-helpers.md)
- [Database Helpers](./database-helpers.md)
- [OTP Capture](./otp-capture.md)
