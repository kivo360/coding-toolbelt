# Email Verification & Password Reset

## Table of Contents
- [1. Email Verification Setup](#1-email-verification-setup)
- [2. Requiring Verification](#2-requiring-verification)
- [3. Password Reset Flow](#3-password-reset-flow)
- [4. Custom Verification URL](#4-custom-verification-url)
- [5. Password Requirements](#5-password-requirements)
- [6. Custom Hashing](#6-custom-hashing)
- [7. Background Tasks](#7-background-tasks)
- [8. Testing Email Flows](#8-testing-email-flows)
- [9. Email Providers](#9-email-providers)
- [Skills Referenced](#skills-referenced)
- [Related References](#related-references)

## 1. Email Verification Setup

Configure the verification handler on the server.

```typescript
export const auth = betterAuth({
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async (data, request) => {
            const { user, url, token } = data;
            // Send verification link using your provider
            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                text: `Click here to verify: ${url}`
            });
        }
    }
});
```

## 2. Requiring Verification

Block unverified users from logging in or accessing features.

```typescript
export const auth = betterAuth({
    emailVerification: {
        requireEmailVerification: true
    }
});
```

## 3. Password Reset Flow

Configure the password reset email handler.

```typescript
export const auth = betterAuth({
    emailAndPassword: {
        sendResetPassword: async (data, request) => {
            const { user, url, token } = data;
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Click here to reset: ${url}`
            });
        }
    }
});
```

## 4. Custom Verification URL

Build a custom verification page URL instead of the default.

```typescript
emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
        const verificationUrl = `${process.env.BETTER_AUTH_URL}/verify?token=${token}`;
        // send email...
    }
}
```

## 5. Password Requirements

Configure minimum and maximum password length.

```typescript
emailAndPassword: {
    minPasswordLength: 12,
    maxPasswordLength: 64
}
```

## 6. Custom Hashing

Use `scrypt` (default) or provide a custom hashing function.

```typescript
emailAndPassword: {
    password: {
        hash: async (password: string) => {
            // Argon2id example
            return await hashPassword(password);
        }
    }
}
```

## 7. Background Tasks

Ensure the user gets a fast response while the email sends in the background.

```typescript
emailVerification: {
    sendVerificationEmail: async (data, request) => {
        // waitUntil pattern (Vercel/Next.js)
        request.waitUntil(sendEmail(data));
    }
}
```

## 8. Testing Email Flows

Testing without a real email server using `test-utils`.

```typescript
test("verification link flow", async () => {
    const ctx = await auth.$context;
    const email = "user@example.com";
    await ctx.test.createUser({ email });

    // Request reset
    await auth.api.forgetPassword({ body: { email } });

    // Capture the token/OTP
    const { otp, token } = await ctx.test.getOTP(email);
    expect(token).toBeDefined();

    // Reset password using the token
    await auth.api.resetPassword({ body: { token, newPassword: "NewPassword123!" } });
});
```

## 9. Email Providers

- **Resend**: Standard provider choice for Node/React projects.
- **Mock/Console**: For local development.

```typescript
sendVerificationEmail: async ({ user, url }) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`Verification URL for ${user.email}: ${url}`);
        return;
    }
    // real email provider code here...
}
```

## Skills Referenced
- email-and-password-best-practices: Core email flows.
- better-auth-best-practices: Token management and security.

## Related References
- [Testing Auth Flows](./testing-auth-flows.md)
- [Playwright Auth Testing Patterns](./playwright-auth-patterns.md)
