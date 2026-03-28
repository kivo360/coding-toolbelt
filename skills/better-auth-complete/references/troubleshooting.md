# Troubleshooting Guide

## Table of Contents
- [Common Errors Table](#common-errors-table)
- [Debugging Tools](#debugging-tools)
- [Test-Specific Troubleshooting](#test-specific-troubleshooting)
- [Migration Troubleshooting](#migration-troubleshooting)

## Common Errors Table
Identify and fix the most frequent Better Auth issues.

| Error | Cause | Fix |
|-------|-------|-----|
| "Secret not set" | Missing `BETTER_AUTH_SECRET` | Add to `.env` or `betterAuth({ secret })`. |
| "Invalid Origin" | Request origin not in `trustedOrigins` | Add the domain to `trustedOrigins`. |
| Cookies not setting | `baseURL` mismatch or missing `HTTPS` | Check `baseURL`, use `HTTPS` in prod. |
| OAuth callback error | Redirect URI mismatch | Match URI exactly in provider dashboard. |
| Type errors after plugin | Schema out of date | Re-run CLI `migrate` or `generate`. |
| "User not found" on login | Email not registered or verification required | Check `requireEmailVerification` setting. |
| 2FA redirect loop | Missing 2FA verification page | Create a `/2fa` route to handle the code. |
| Session not persisting | Cookie domain mismatch or `sameSite` | Check `domain` config and `sameSite` flags. |
| Rate limit triggered in dev | Default production rate limits | Set `rateLimit.enabled: false` in development. |
| Organization not found | Active organization not set | Call `setActive` on the organization client first. |

## Debugging Tools
Techniques for investigating authentication failures.

### Curl
Test your auth endpoints directly without the frontend.

```bash
curl -X GET https://api.example.com/api/auth/ok
# Should return { status: "ok" }
```

### Browser Devtools
Check `Application -> Cookies` for:
- `better-auth.session_token`
- `better-auth.session_data` (if using cookie cache)
- `better-auth.two_factor_temp_token` (during 2FA flows)

### Server-Side Debugging
Call the internal API directly on the server.

```typescript
const session = await auth.api.getSession({
    headers: request.headers
});

if (!session) {
    console.error("Session not found with headers:", request.headers);
}
```

### Verbose Logging
Enable verbose logging in your configuration (if supported by your logging layer).

## Test-Specific Troubleshooting
Issues when running Playwright or unit tests.

### `getCookies` returns empty
Ensure the user was actually saved to the database before checking for cookies.

### OTP not captured
Enable `captureOTP` in the `testUtils` configuration to intercept codes.

```typescript
const { user, otp } = await testUtils.createAuthenticatedUser({
    captureOTP: true
});
```

### Playwright cookies not working
Verify that the `domain` parameter in `context.addCookies()` matches the URL used in the test.

## Migration Troubleshooting
Common issues when updating your schema.

- **"Column already exists"**: This means the migration has already run. Skip this step or check your migration history.
- **"Table not found"**: You likely added a plugin (like `organization`) but didn't run `migrate` or `generate`.
- **"Prisma model name mismatch"**: Ensure you use the model name defined in `schema.prisma` (e.g., `User`), not the DB table name (e.g., `users`).

## Skills Referenced
- `better-auth-best-practices`
- `route-tester`

## Related References
- [Production Security Checklist](./security-checklist.md)
- [Database Setup & Migrations](./database-migrations.md)
