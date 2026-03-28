# Component Reference

## Table of Contents
- [Auth Views](#auth-views)
- [User Controls](#user-controls)
- [Account Views](#account-views)
- [Individual Cards](#individual-cards)
- [Conditional Rendering](#conditional-rendering)
- [Hooks](#hooks)
- [Related References](#related-references)

## Auth Views
All auth views can be used individually or via the `AuthView` router.
- `AuthView` — Dynamic router that renders appropriate auth view based on URL.
- `AuthCard` — Wrapper component for custom auth cards.
- `SignInView` — Sign in page with email/password, social, OTP, or magic link.
- `SignUpView` — Sign up page with support for custom additional fields.
- `ForgotPasswordView` — Form to request password reset email.
- `ResetPasswordView` — Form to set a new password.

### Usage
```tsx
import { AuthView, SignInView } from "@daveyplate/better-auth-ui";

// As a dynamic router
export default function AuthPage({ params }: { params: { pathname: string[] } }) {
  return <AuthView pathname={params.pathname.join("/")} />;
}

// Or individual components
const LoginPage = () => <SignInView />;
```

## User Controls
- `UserButton` — Avatar button with a dropdown menu for profile, settings, and sign-out.
- `UserAvatar` — Simple avatar display for the current user.
- `OrganizationSwitcher` — Dropdown to switch between or manage organizations.

### Usage
```tsx
import { UserButton, OrganizationSwitcher } from "@daveyplate/better-auth-ui";

export function Navbar() {
  return (
    <div className="flex gap-4">
      <OrganizationSwitcher />
      <UserButton />
    </div>
  );
}
```

## Account Views
- `AccountView` — Complete account dashboard with sidebar navigation.
- `SettingsCards` — Grouping of settings cards for a specific view (e.g., SETTINGS, SECURITY).
- `AccountSettingsCards` — Pre-grouped cards for general profile settings.
- `SecuritySettingsCards` — Pre-grouped cards for passwords, 2FA, and sessions.

### Usage
```tsx
import { AccountView } from "@daveyplate/better-auth-ui";

export default function AccountPage({ params }: { params: { view: string[] } }) {
  return <AccountView view={params.view.join("/")} />;
}
```

## Individual Cards
Used to build custom settings pages.
- `UpdateAvatarCard` — UI for changing profile image.
- `UpdateNameCard` — UI for changing display name.
- `UpdateUsernameCard` — UI for changing unique username.
- `ChangeEmailCard` — Flow for changing and verifying email.
- `ChangePasswordCard` — Flow for updating existing password.
- `ProvidersCard` — List and manage linked social accounts.
- `SessionsCard` — List active sessions with logout capability.
- `DeleteAccountCard` — Confirmation flow to delete the user account.
- `UpdateFieldCard` — Generic card for updating any user field.
- `ApiKeysCard` — CRUD interface for managing API keys.
- `OrganizationSettingsCards` — Settings for the active organization.
- `OrganizationMembersCard` — List and manage organization members/invites.
- `OrganizationsCard` — List of all organizations the user belongs to.
- `AcceptInvitationCard` — Form to accept an organization invitation.

## Conditional Rendering
- `SignedIn` — Render children only when user is authenticated.
- `SignedOut` — Render children only when user is not authenticated.
- `RedirectToSignIn` — Forces a redirect to the sign-in page if user is not authenticated.

### Usage
```tsx
import { SignedIn, SignedOut, RedirectToSignIn } from "@daveyplate/better-auth-ui";

export default function ProtectedPage() {
  return (
    <>
      <SignedIn>
        <h1>Welcome Back!</h1>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

## Hooks
Access auth state and utilities using `AuthUIContext`.

### Usage
```tsx
import { useContext } from "react";
import { AuthUIContext } from "@daveyplate/better-auth-ui";

export function MyComponent() {
  const { hooks } = useContext(AuthUIContext);
  const session = hooks.useSession();
  const activeOrg = hooks.useActiveOrganization();
  const listOrgs = hooks.useListOrganizations();
  const hasPermission = hooks.useHasPermission({ permission: "admin" });

  return <div>Logged in as: {session.data?.user.name}</div>;
}
```

## Related References
- [Setup & Installation](./setup.md)
- [Auth Pages Setup](./auth-pages.md)
- [Account & Settings Pages](./account-pages.md)
