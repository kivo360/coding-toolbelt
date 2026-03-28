# Validation Workflow

Table of Contents
1. [Overview](#overview)
2. [Testing Cycle](#testing-cycle)
3. [Running Generated Tests](#running-generated-tests)
4. [Failure Diagnostics](#failure-diagnostics)
5. [Stability Check](#stability-check)
6. [CI/CD Integration](#cicd-integration)
7. [Related References](#related-references)

## Overview
This reference defines the feedback loop for validating generated Playwright tests. No test is complete until it passes on a clean environment, survives parallel execution, and matches the intended exploration outcome.

## Testing Cycle
1. **Generate**: Create the initial `.spec.ts` and POMs from the exploration.
2. **Execute**: Run against a headless or headed Chromium browser.
3. **Diagnose**: Analyze failures using Trace Viewer and screenshots.
4. **Refine**: Update selectors, add waits, or parameterize data.
5. **Verify**: Run with `repeat-each` to ensure stability.

## Running Generated Tests
Use the Playwright CLI to run only the relevant generated tests.

```bash
# Run all generated tests in the background
npx playwright test tests/generated/ --reporter=list

# Run a specific test in headed mode to see what's happening
npx playwright test tests/generated/my-test.spec.ts --headed

# Debugging with full tracing enabled
npx playwright test --trace on
```

## Failure Diagnostics
If a test fails, perform these checks:
- **Selector Match**: Compare the `agent-browser` screenshot with the test's failure screenshot. Did the UI change?
- **Auth State**: Ensure the `authenticatedContext` successfully injected cookies before the test started.
- **Timing**: Check if the test failed due to a race condition (e.g., clicking before a modal opened).
- **Data Conflict**: Verify that multiple tests aren't trying to create the same unique entity (e.g., "Project A").

### Trace Viewer Usage
The Trace Viewer is the most powerful tool for diagnosing failures.

```bash
# Open the trace for a failed run
npx playwright show-trace test-results/my-test-failed/trace.zip
```
Inside the viewer, you can inspect the action log, console errors, and the DOM at every step of the test execution.

## Stability Check
Flaky tests are a significant burden. Before committing a test, verify its stability.

```bash
# Run the test 5 times consecutively to check for flakiness
npx playwright test tests/generated/my-test.spec.ts --repeat-each=5
```

## CI/CD Integration
Generated tests should be integrated into the existing CI pipeline to ensure continued health.

```yaml
# Example GitHub Actions snippet
- name: Run Playwright Tests
  run: npx playwright test tests/generated/
  env:
    BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
    BETTER_AUTH_URL: "http://localhost:3000"
```

## Related References
- [Test Generation Rules](test-generation-rules.md)
- [QA Report Template](report-template.md)
- [Auth Testing with Better Auth](auth-testing-patterns.md)
