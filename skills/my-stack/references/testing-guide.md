# Testing Your App

## Table of Contents
1. [QA & Dogfooding](#qa--dogfooding)
2. [Test Generation](#test-generation)
3. [Authentication Testing](#authentication-testing)
4. [Frontend & UI Testing](#frontend--ui-testing)
5. [Backend & API Testing](#backend--api-testing)
6. [CI/CD Integration](#cicd-integration)

## QA & Dogfooding
- **QA Mode**: Load **dogfood-complete**. Run automated exploration to find bugs, logic errors, and broken UI elements.
- **Reporting**: Generates a detailed report with evidence (screenshots/videos) in `.agents/reports`.

## Test Generation
- **Test Gen Mode**: Load **dogfood-complete**. After exploration, the agent can generate Playwright tests based on discovered flows.
- **Standards**: Follows **playwright-best-practices** for reliable, non-flaky selectors.

## Authentication Testing
- **Auth Fixtures**: Load **better-auth-test-utils**. Use `getCookies` and `test-auth-route` for authenticated testing without manual login.
- **OTP Testing**: Intercept email/SMS OTP codes using **better-auth-test-utils** for automated sign-in flows.

## Frontend & UI Testing
- **UI Components**: Load **better-auth-ui** to verify component states (loading, success, error).
- **Interactive Exploration**: Use **agent-browser** to manually step through complex multi-step UI flows.

## Backend & API Testing
- **Unit/Integration**: Load **backend-dev-guidelines**. Use Vitest for business logic and data access layers.
- **Database**: Load **drizzle-orm**. Mock DB or use isolated test database with migrations.

## CI/CD Integration
- **GitHub Actions**: Configure workflows to run Playwright tests on every PR.
- **Optimization**: Use **turborepo** to only run tests affected by code changes.

**Related References:**
- [Skill Map](skill-map.md)
- [Production Deployment Checklist](production-checklist.md)
