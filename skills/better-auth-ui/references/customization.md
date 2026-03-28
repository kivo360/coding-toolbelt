# Customization & Styling

## Table of Contents
- [Custom Auth Paths](#custom-auth-paths)
- [Custom Account Paths](#custom-account-paths)
- [Localization & i18n](#localization-i18n)
- [Additional Fields](#additional-fields)
- [Styling with classNames](#styling-with-classnames)
- [Tailwind CSS Customization](#tailwind-css-customization)
- [Dark Mode Support](#dark-mode-support)
- [Error Message Customization](#error-message-customization)
- [Related References](#related-references)

## Custom Auth Paths
Change the default URLs used for auth views in `AuthUIProvider`.

```tsx
<AuthUIProvider
  viewPaths={{
    SIGN_IN: "login",
    SIGN_UP: "register",
    FORGOT_PASSWORD: "reset",
  }}
  // ... other props
/>
```
The views will now respond to `/auth/login` and `/auth/register`.

## Custom Account Paths
Define how settings pages map to URL segments in the account section.

```tsx
<AuthUIProvider
  account={{
    basePath: "/account",
    viewPaths: {
      SETTINGS: "profile",
      SECURITY: "privacy",
      API_KEYS: "developer",
      ORGANIZATIONS: "teams",
    },
  }}
  // ... other props
/>
```
Account views map to `/account/profile`, `/account/privacy`, etc.

## Localization & i18n
Override default text strings across the entire UI.

```tsx
<AuthUIProvider
  localization={{
    SIGN_IN: "Access Account",
    SIGN_UP: "Join Us",
    EMAIL: "Email Address",
    PASSWORD: "Secure Password",
    SIGN_IN_WITH: "Connect with {provider}",
  }}
/>
```
Localization strings can include `{provider}` as a dynamic variable.

## Additional Fields
Add custom fields to the sign-up form and settings.

```tsx
<AuthUIProvider
  additionalFields={{
    phoneNumber: {
      label: "Phone Number",
      type: "string",
      required: true,
      placeholder: "+1 234 567 890",
      validator: (val) => val.length > 8,
    },
    bio: {
      label: "About You",
      type: "string",
      multiline: true,
    }
  }}
/>
```
These fields appear automatically in `SignUpView` and `AccountSettingsCards`.

## Styling with classNames
Pass Tailwind classes directly to components using the `classNames` prop.

```tsx
<UserButton
  classNames={{
    button: "rounded-full p-0.5 border-2 border-primary",
    avatar: "w-10 h-10 shadow-sm",
    dropdown: "w-60 bg-card border-border",
  }}
/>
```
Every component has a `classNames` prop with specific sub-keys.

## Tailwind CSS Customization
Since components use shadcn/ui patterns, you can change themes by editing your `globals.css` colors.

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;
}
```

## Dark Mode Support
The UI respects the standard `dark` class added to `html` or `body`.

```tsx
// Using a theme switcher
<html className={theme === "dark" ? "dark" : ""}>
  <body>
    <AuthUIProvider {...props}>
      {children}
    </AuthUIProvider>
  </body>
</html>
```

## Error Message Customization
Control how server-side auth errors are displayed.

```tsx
<AuthUIProvider
  localizeErrors={true} // Set to false to show raw backend errors
  onErrorMessage={(error) => {
    // Custom logic to handle or log errors
    if (error.code === "INVALID_PASSWORD") {
      return "Your password doesn't meet security requirements.";
    }
  }}
/>
```

## Related References
- [Setup & Installation](./setup.md)
- [Component Reference](./components.md)
- [Auth Pages Setup](./auth-pages.md)
