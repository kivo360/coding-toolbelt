# Two-Factor Authentication Implementation

## Table of Contents
- [Quick Setup](#quick-setup)
- [Enabling 2FA for a User](#enabling-2fa-for-a-user)
- [TOTP Setup & QR Codes](#totp-setup--qr-codes)
- [OTP via Email/SMS](#otp-via-emailsms)
- [Backup Codes](#backup-codes)
- [Sign-in Flow with 2FA](#sign-in-flow-with-2fa)
- [Trusted Devices](#trusted-devices)
- [Testing 2FA](#testing-2fa)

## Quick Setup
Add the `twoFactor` plugin to your server and the `twoFactorClient` to your frontend.

```typescript
// server/auth.ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";

export const auth = betterAuth({
    plugins: [
        twoFactor({
            issuer: "My App",
            // otpOptions: { digits: 6, period: 30 }
        })
    ]
});

// client/auth.ts
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/plugins/two-factor";

export const authClient = createAuthClient({
    plugins: [twoFactorClient()]
});
```
*Run `npx @better-auth/cli@latest migrate` after adding the plugin.*

## Enabling 2FA for a User
Users must verify their password before enabling 2FA.

```typescript
const enable2FA = async () => {
    // 1. Start the enable process (returns TOTP URI)
    const { data, error } = await authClient.twoFactor.enable({
        password: "user-password" 
    });
    
    if (data) {
        // data.totpURI is used for the QR code
        // data.backupCodes should be shown to the user once
    }
};
```

## TOTP Setup & QR Codes
Use a library like `react-qr-code` to display the `totpURI`.

```typescript
import QRCode from "react-qr-code";

// In your component:
<QRCode value={data.totpURI} />

// 2. Verify the first code to finalize activation
await authClient.twoFactor.verify({
    code: "123456"
});
```

## OTP via Email/SMS
Configure `sendOTP` in the server plugin to support non-app-based 2FA.

```typescript
// server/auth.ts
twoFactor({
    sendOTP: async ({ user, code }) => {
        await sendEmail({
            to: user.email,
            subject: "Your 2FA Code",
            text: `Your code is ${code}`
        });
    }
})
```

## Backup Codes
Backup codes are generated during the enable flow. Users can also regenerate them.

```typescript
// Regenerate codes (invalidates old ones)
const { data } = await authClient.twoFactor.regenerateBackupCodes();

// Use a backup code during sign-in
await authClient.twoFactor.verifyBackupCode({
    code: "backup-code-1"
});
```

## Sign-in Flow with 2FA
If 2FA is enabled, `signIn` will return a `twoFactorRedirect` flag.

1. User calls `signIn.email()`.
2. Client receives `twoFactorRedirect: true`.
3. Redirect user to `/2fa` page.
4. User enters code and calls `authClient.twoFactor.verify()`.

## Trusted Devices
Allow users to skip 2FA on the same device for a period.

```typescript
await authClient.twoFactor.verify({
    code: "123456",
    trustDevice: true // Persists 2FA status via cookie
});
```

## Testing 2FA
Use `testUtils` to bypass or automate 2FA testing.

```typescript
import { testUtils } from "better-auth/plugins/test-utils";

// In your test:
const { user, session } = await testUtils.createAuthenticatedUser();
// Manually enable 2FA in test DB or use API calls
```

## Skills Referenced
- `two-factor-authentication-best-practices`
- `playwright-best-practices` (for E2E flows)

## Related References
- [Security Checklist](./security-checklist.md)
- [Plugin Recipes](./plugin-recipes.md)
