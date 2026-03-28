# Setup & Installation

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Minimal Setup](#minimal-setup)
- [Full Provider Config](#full-provider-config)
- [Tailwind CSS Setup](#tailwind-css-setup)
- [Verifying the Setup](#verifying-the-setup)
- [Related References](#related-references)

## Requirements
Before installing `@daveyplate/better-auth-ui`, ensure your project meets these prerequisites:
- **Next.js 13+** (App Router recommended) or **React 18+**.
- **Better Auth** configured on the server and client.
- **shadcn/ui** components installed (Button, Card, Input, Label, etc.).
- **Tailwind CSS** for styling.

## Installation
Install the package using your preferred package manager:

```bash
npm install @daveyplate/better-auth-ui
# or
yarn add @daveyplate/better-auth-ui
# or
pnpm add @daveyplate/better-auth-ui
```

## Configuration
The `AuthUIProvider` component is the heart of the library. It must wrap your application to provide auth context, routing integration, and global styling configuration.

### Create a Providers Component
In Next.js App Router, create a client component to house your providers.

```tsx
// app/providers.tsx
"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client"; // Your better-auth client
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
  );
}
```

### Wrap the Root Layout
Import your `Providers` component into your root layout.

```tsx
// app/layout.tsx
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Minimal Setup
A minimal configuration only requires basic routing hooks and your auth client.

```tsx
<AuthUIProvider
  authClient={authClient}
  navigate={router.push}
  Link={Link}
/>
```

## Full Provider Config
A production-ready configuration often includes social providers, custom paths, and additional signup fields.

```tsx
<AuthUIProvider
  authClient={authClient}
  navigate={router.push}
  replace={router.replace}
  onSessionChange={() => router.refresh()}
  Link={Link}
  socialLayout="horizontal"
  socialProviders={["google", "github"]}
  magicLink={true}
  emailOTP={true}
  enablePasskey={true}
  viewPaths={{ SIGN_IN: "login", SIGN_UP: "register" }}
  basePath="/auth"
  account={{ 
    basePath: "/account", 
    fields: ["image", "name"] 
  }}
  additionalFields={{ 
    company: { label: "Company", type: "string", required: true } 
  }}
/>
```

## Tailwind CSS Setup
Ensure your `tailwind.config.js` includes the package paths to pick up necessary styles.

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@daveyplate/better-auth-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
};
```

## Verifying the Setup
1. Start your development server.
2. Visit `/auth/sign-in` (or your custom `basePath`).
3. You should see the default Better Auth sign-in card rendered with your shadcn/ui styles.

## Related References
- [Component Reference](./components.md)
- [Auth Pages Setup](./auth-pages.md)
- [Customization & Styling](./customization.md)
