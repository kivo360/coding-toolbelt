# Complete Skill Map

## Table of Contents
1. [Authentication Domain](#authentication-domain)
2. [Testing & QA Domain](#testing--qa-domain)
3. [Infrastructure & Monorepo](#infrastructure--monorepo)
4. [Integrations & Services](#integrations--services)
5. [Skill Relationships](#skill-relationships)

## Authentication Domain
| Skill Name | Purpose | Source | When to Load |
|:---|:---|:---|:---|
| **better-auth-complete** | Meta skill for all auth tasks | We built | Any auth-related work |
| better-auth-best-practices | Core config & setup guide | Official | Initial setup / configuration |
| better-auth-security | Security hardening & audit | Official | Production prep / security audit |
| better-auth-test-utils | Auth testing helpers | Official | Writing tests for auth flows |
| better-auth-ui | Ready-to-use UI components | Official | Building login/settings pages |
| create-auth-skill | Rapid auth scaffolding | Community | Starting new auth implementation |
| email-password-bp | Email/Password specific flow | Official | Implementing credential login |
| organization-bp | Multi-tenant & RBAC setup | Official | Adding team/org support |
| two-factor-bp | TOTP & MFA implementation | Official | Adding 2FA security |

## Testing & QA Domain
| Skill Name | Purpose | Source | When to Load |
|:---|:---|:---|:---|
| **dogfood-complete** | Meta skill for QA & Test Gen | We built | Bug hunting or test generation |
| agent-browser | CLI-driven browser control | We built | Interactive debugging/exploration |
| playwright-bp | E2E testing best practices | Official | Writing/fixing Playwright tests |

## Infrastructure & Monorepo
| Skill Name | Purpose | Source | When to Load |
|:---|:---|:---|:---|
| next-forge | Monorepo scaffolding | Community | Starting a new project |
| turborepo | Build optimization & pipeline | Official | Managing monorepo tasks |
| drizzle-orm | Type-safe DB access | Official | Database schema/migration work |
| shadcn | UI component library | Community | Building frontend interfaces |
| sentry-fix-issues | Error tracking & resolution | Official | Debugging production errors |

## Integrations & Services
| Skill Name | Purpose | Source | When to Load |
|:---|:---|:---|:---|
| stripe-bp | Payment & subscription flow | Official | Implementing billing/checkouts |
| resend | Transactional email delivery | Official | Configuring email transport |
| react-email | Email template design | Official | Creating/editing email layouts |
| posthog-instrumentation | Event tracking & flags | Official | Adding analytics/feature flags |

## Skill Relationships
- **better-auth-complete** routes to all `better-auth-*` and `*-best-practices` skills.
- **dogfood-complete** relies on **agent-browser** for execution and **playwright-bp** for test generation.
- **next-forge** assumes use of **turborepo**, **drizzle-orm**, and **shadcn**.
- **stripe-bp** often requires **drizzle-orm** for storing subscription state.
- **resend** and **react-email** work together for all outbound communications.

**Related References:**
- [Skill Chains](skill-chains.md)
- [New Project Setup](new-project-setup.md)
