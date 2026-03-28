# Auth Pages Setup

## Table of Contents
- [Dynamic Auth Route](#dynamic-auth-route)
- [AuthView Router](#authview-router)
- [Individual Auth Pages](#individual-auth-pages)
- [Auth View Customization](#auth-view-customization)
- [Sign Up with Additional Fields](#sign-up-with-additional-fields)
- [Handling Callbacks](#handling-callbacks)
- [Styling Auth Components](#styling-auth-components)
- [Related References](#related-references)

## Dynamic Auth Route
The easiest way to set up all auth pages is using a single dynamic route in the Next.js App Router.

```tsx
// app/auth/[...pathname]/page.tsx
import { AuthView } from "@daveyplate/better-auth-ui";

export function generateStaticParams() {
  return [
    { pathname: ["sign-in"] },
    { pathname: ["sign-up"] },
    { pathname: ["forgot-password"] },
    { pathname: ["reset-password"] },
    { pathname: ["magic-link"] },
  ];
}

export default function AuthPage({ params }: { params: { pathname: string[] } }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <AuthView pathname={params.pathname.join("/")} />
    </div>
  );
}
```

## AuthView Router
The `AuthView` component handles routing between different auth states internally. It maps the current pathname to one of the following views:
- `/auth/sign-in` — `SignInView`
- `/auth/sign-up` — `SignUpView`
- `/auth/forgot-password` — `ForgotPasswordView`
- `/auth/reset-password` — `ResetPasswordView`
- `/auth/magic-link` — `MagicLinkView`

## Individual Auth Pages
If you need custom layouts for specific auth pages, you can use the individual components directly.

```tsx
// app/login/page.tsx
import { SignInView } from "@daveyplate/better-auth-ui";

export default function LoginPage() {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      <div className="bg-muted hidden lg:block" />
      <div className="flex items-center justify-center">
        <SignInView className="w-full max-w-sm" />
      </div>
    </div>
  );
}
```

## Auth View Customization
You can customize which auth methods are enabled per-view or globally in `AuthUIProvider`.

```tsx
// Overriding global config for a specific view
<SignInView 
  socialProviders={["google"]} 
  magicLink={false} 
  emailOTP={true} 
/>
```

## Sign Up with Additional Fields
Define custom fields for the sign-up form in `AuthUIProvider`. These fields are automatically passed to the Better Auth sign-up request.

```tsx
// Inside AuthUIProvider
additionalFields={{
  company: {
    label: "Company Name",
    type: "string",
    required: true,
    placeholder: "Acme Inc.",
  },
  referral: {
    label: "How did you hear about us?",
    type: "string",
  }
}}
```

## Handling Callbacks
Use `onSignIn`, `onSignOut`, and `onSessionChange` to trigger side effects after auth actions.

```tsx
<AuthUIProvider
  onSignIn={(session) => {
    console.log("Welcome back", session.user.name);
    router.push("/dashboard");
  }}
  onSignOut={() => router.push("/")}
  onSessionChange={() => router.refresh()}
  // ... other props
/>
```

## Styling Auth Components
Use the `classNames` prop to style specific parts of the auth cards using Tailwind CSS.

```tsx
<SignInView 
  classNames={{
    card: "border-primary shadow-lg",
    title: "text-2xl font-bold",
    form: "space-y-4",
    submitButton: "w-full bg-primary hover:bg-primary/90",
  }}
/>
```

## Related References
- [Component Reference](./components.md)
- [Account & Settings Pages](./account-pages.md)
- [Customization & Styling](./customization.md)
