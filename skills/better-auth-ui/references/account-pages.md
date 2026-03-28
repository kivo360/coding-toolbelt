# Account & Settings Pages

## Table of Contents
- [Account Router](#account-router)
- [Pre-Grouped Settings Cards](#pre-grouped-settings-cards)
- [Custom Settings Pages](#custom-settings-pages)
- [Protecting Account Pages](#protecting-account-pages)
- [Organization Management](#organization-management)
- [Organization Settings Cards](#organization-settings-cards)
- [Customizing Account Paths](#customizing-account-paths)
- [Related References](#related-references)

## Account Router
The `AccountView` component is a complete settings dashboard with built-in sidebar navigation.

```tsx
// app/account/[...view]/page.tsx
import { AccountView, RedirectToSignIn, SignedIn, SignedOut } from "@daveyplate/better-auth-ui";

export function generateStaticParams() {
  return [
    { view: ["settings"] },
    { view: ["security"] },
    { view: ["api-keys"] },
    { view: ["organizations"] },
  ];
}

export default function AccountPage({ params }: { params: { view: string[] } }) {
  const currentView = params.view.join("/");

  return (
    <>
      <SignedIn>
        <AccountView view={currentView} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

## Pre-Grouped Settings Cards
Instead of the full `AccountView`, you can render specific groups of settings using `SettingsCards`.

```tsx
import { SettingsCards } from "@daveyplate/better-auth-ui";

// Inside any page component
<SettingsCards view="SETTINGS" /> // Renders avatar, name, email
<SettingsCards view="SECURITY" /> // Renders password, 2FA, sessions
<SettingsCards view="API_KEYS" /> // Renders API key management
<SettingsCards view="ORGANIZATIONS" /> // Renders organization list
```

## Custom Settings Pages
Build your own settings layout using individual card components.

```tsx
import { 
  UpdateNameCard, 
  ChangeEmailCard, 
  ChangePasswordCard 
} from "@daveyplate/better-auth-ui";

export default function SecurityPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <UpdateNameCard />
      <ChangeEmailCard />
      <hr />
      <h2 className="text-xl font-semibold">Security</h2>
      <ChangePasswordCard />
    </div>
  );
}
```

## Protecting Account Pages
Always use the `SignedIn` and `SignedOut` components (or middleware) to ensure only authenticated users can access account data.

```tsx
<SignedIn>
  <AccountView view="settings" />
</SignedIn>
<SignedOut>
  <RedirectToSignIn redirectTo="/account/settings" />
</SignedOut>
```

## Organization Management
Enable organization features by including the `organization` prop in `AuthUIProvider`.

```tsx
<AuthUIProvider
  // ... rest of config
  organization={{
    basePath: "/organizations",
    customRoles: [
      { role: "dev", label: "Developer" },
      { role: "designer", label: "Designer" },
    ]
  }}
/>
```

### Components for Organizations
- `OrganizationSwitcher` — Toggle between organizations.
- `OrganizationsCard` — List of all organizations with "Create Organization" button.
- `OrganizationSettingsCards` — General settings for the currently active organization.
- `OrganizationMembersCard` — Member management and invitation list.

## Customizing Account Paths
Change the default URL segments for account settings in `AuthUIProvider`.

```tsx
<AuthUIProvider
  // ... rest of config
  account={{
    basePath: "/my-account",
    viewPaths: {
      SETTINGS: "profile",
      SECURITY: "privacy",
    }
  }}
/>
```
Now `/my-account/profile` renders `AccountSettingsCards`.

## Related References
- [Component Reference](./components.md)
- [Auth Pages Setup](./auth-pages.md)
- [Customization & Styling](./customization.md)
