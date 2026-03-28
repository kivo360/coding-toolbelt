---
name: better-auth-ui
description: >-
  Pre-built shadcn/ui authentication components for Better Auth. Use when implementing auth pages
  (sign in, sign up, forgot password, magic link), user buttons, account settings, organization
  management, or API key management with Better Auth. Trigger on "auth UI," "auth components,"
  "sign in page," "sign up page," "user button," "settings page," "auth card," "AuthUIProvider,"
  "better-auth-ui," "shadcn auth," "auth view," "organization switcher," "account settings,"
  or "auth form." Package: @daveyplate/better-auth-ui. For backend auth config, see
  better-auth-complete. For testing auth UI, see dogfood-complete.
---

# Better Auth UI

Pre-built shadcn/ui styled auth components for Next.js and React. Package: `@daveyplate/better-auth-ui`.

**Always consult [better-auth-ui.com](https://better-auth-ui.com) for latest API and examples.**

## Quick Start

```bash
npm install @daveyplate/better-auth-ui
```

```tsx
// providers.tsx
"use client"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  )
}
```

```tsx
// app/auth/[...pathname]/page.tsx
import { AuthView } from "@daveyplate/better-auth-ui"

export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
  const { pathname } = await params
  return (
    <div className="flex grow items-center justify-center">
      <AuthView pathname={pathname} />
    </div>
  )
}
```

That gives you `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/reset-password` out of the box.

## Activity-Based Reference Guide

| Activity | Reference |
|----------|-----------|
| **Installing and setting up AuthUIProvider** | [setup.md](references/setup.md) |
| **All components and when to use each** | [components.md](references/components.md) |
| **Auth pages (sign in, sign up, forgot password)** | [auth-pages.md](references/auth-pages.md) |
| **Account pages (settings, security, orgs)** | [account-pages.md](references/account-pages.md) |
| **Customization (paths, localization, styling)** | [customization.md](references/customization.md) |
| **Testing auth UI with dogfood-complete** | [testing-auth-ui.md](references/testing-auth-ui.md) |

## Component Quick Reference

### Auth Views (Pages)

| Component | Purpose | Default Path |
|-----------|---------|-------------|
| `<AuthView />` | Dynamic auth view router | `/auth/[pathname]` |
| `<AuthCard />` | Sign in/up/forgot/reset/magic link card | Embedded in AuthView |
| `<SignInView />` | Standalone sign-in | `/auth/sign-in` |
| `<SignUpView />` | Standalone sign-up | `/auth/sign-up` |
| `<ForgotPasswordView />` | Password reset request | `/auth/forgot-password` |
| `<ResetPasswordView />` | Set new password | `/auth/reset-password` |

### User Controls

| Component | Purpose |
|-----------|---------|
| `<UserButton />` | Avatar + dropdown (sign out, settings link) |
| `<UserAvatar />` | User avatar image |
| `<OrganizationSwitcher />` | Switch between orgs + personal account |

### Account Settings

| Component | Purpose | Default Path |
|-----------|---------|-------------|
| `<AccountView />` | Full account management with sidebar nav | `/account/[view]` |
| `<SettingsCards />` | All settings for a given view | Embedded in AccountView |
| `<AccountSettingsCards />` | Avatar, name, email, custom fields | `/account/settings` |
| `<SecuritySettingsCards />` | Password, sessions, 2FA, passkeys | `/account/security` |
| `<ApiKeysCard />` | API key management | `/account/api-keys` |
| `<OrganizationSettingsCards />` | Org name, logo, delete | `/account/organization` |
| `<OrganizationMembersCard />` | Member list + invite | `/account/members` |
| `<OrganizationsCard />` | List all user orgs | `/account/organizations` |

### Individual Settings Cards

| Component | Purpose |
|-----------|---------|
| `<UpdateAvatarCard />` | Upload/change avatar |
| `<UpdateNameCard />` | Update display name |
| `<UpdateUsernameCard />` | Change username |
| `<ChangeEmailCard />` | Change email address |
| `<ChangePasswordCard />` | Update password |
| `<ProvidersCard />` | Link/unlink social providers |
| `<SessionsCard />` | Active session management |
| `<DeleteAccountCard />` | Account deletion |
| `<UpdateFieldCard />` | Custom additional fields |

### Conditional Rendering

| Component | Purpose |
|-----------|---------|
| `<SignedIn>` | Render children only when authenticated |
| `<SignedOut>` | Render children only when not authenticated |
| `<RedirectToSignIn />` | Redirect unauthenticated users to sign-in |

## AuthUIProvider Configuration

```tsx
<AuthUIProvider
  authClient={authClient}           // Required: Better Auth client instance
  navigate={router.push}            // Required: navigation function
  replace={router.replace}          // Required: replace navigation
  onSessionChange={() => router.refresh()} // Required: session change handler
  Link={Link}                       // Required: link component

  // Auth behavior
  socialLayout="horizontal"         // "horizontal" | "vertical" | "auto"
  socialProviders={["google", "github"]} // Show specific providers
  enablePasskey={true}              // Enable passkey/WebAuthn
  magicLink={true}                  // Enable magic link sign-in
  emailOTP={true}                   // Enable email OTP sign-in
  phoneNumber={true}                // Enable phone number sign-in

  // View customization
  viewPaths={{ SIGN_IN: "login", SIGN_UP: "register" }}
  basePath="/auth"                  // Base path for auth views (default: "/auth")

  // Account settings
  account={{
    basePath: "/account",           // Base path for account views
    fields: ["image", "name"],      // Fields to show in settings
    viewPaths: { SETTINGS: "profile" }
  }}
  settings={{ fields: ["company", "age"] }}  // Fields in settings view
  signUp={{ fields: ["company"] }}          // Fields in sign-up form

  // Additional fields
  additionalFields={{
    company: { label: "Company", type: "string", required: true },
    age: { label: "Age", type: "number", required: false }
  }}

  // Organization
  organization={{
    logo: { upload: async (file) => url, size: 256, extension: "png" },
    customRoles: [{ role: "developer", label: "Developer" }]
  }}

  // API Keys
  apiKey={true}                     // or { prefix: "app_", metadata: {...} }

  // Localization
  localization={{ SIGN_IN: "Log In", SIGN_UP: "Create Account" }}
  localizeErrors={false}            // Use backend error messages directly

  // Styling
  classNames={{ card: { base: "border-primary/50" } }}

  // Callbacks
  onSignIn={() => console.log("signed in")}
  onSignOut={() => console.log("signed out")}
>
  {children}
</AuthUIProvider>
```

## Plugin Compatibility

| Better Auth Plugin | Auth UI Support | Components |
|---|---|---|
| Email/Password | Built-in | AuthCard sign-in/sign-up forms |
| Social OAuth | Built-in | Social provider buttons |
| Magic Link | `magicLink={true}` | Magic link view |
| Email OTP | `emailOTP={true}` | OTP input view |
| Phone Number | `phoneNumber={true}` | Phone input view |
| Passkey | `enablePasskey={true}` | Passkey button |
| Two-Factor | Auto-detected | 2FA setup in SecuritySettingsCards |
| Organization | `organization={{...}}` | OrgSwitcher, OrgSettings, Members |
| API Key | `apiKey={true}` | ApiKeysCard |
| Username | Auto-detected | UpdateUsernameCard |
| Admin | — | No built-in UI (build custom) |

## Testing Auth UI

Use `dogfood-complete` to explore and test auth UI components:

```bash
# Explore sign-in page
agent-browser --session test open http://localhost:3000/auth/sign-in
agent-browser --session test screenshot --annotate test-output/sign-in.png
agent-browser --session test snapshot -i

# Test sign-up flow
agent-browser --session test open http://localhost:3000/auth/sign-up
agent-browser --session test fill @e1 "Test User"
agent-browser --session test fill @e2 "test@example.com"
agent-browser --session test fill @e3 "password123"
agent-browser --session test click @e4  # Submit
agent-browser --session test wait --load networkidle
```

See [testing-auth-ui.md](references/testing-auth-ui.md) for complete patterns.

## Related Skills

- `better-auth-complete` — Backend auth configuration
- `better-auth-test-utils` — Test factories, getCookies, OTP capture
- `dogfood-complete` — QA + test generation pipeline
- `playwright-best-practices` — E2E test structure
