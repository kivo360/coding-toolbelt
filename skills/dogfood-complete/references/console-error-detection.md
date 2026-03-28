# Console Error Detection

1. [Capturing JS Errors](#capturing-js-errors)
2. [When to Check](#when-to-check)
3. [Error Categorization](#error-categorization)
4. [Finding Failed API Calls](#finding-failed-api-calls)
5. [Reporting Errors](#reporting-errors)
6. [Related References](#related-references)

## Capturing JS Errors

`agent-browser` provides two primary commands for capturing console activity:

```bash
# Capture uncaught exceptions and standard error messages
agent-browser --session dogfood errors

# Capture all console log, info, and warn messages
agent-browser --session dogfood console
```

## When to Check

Check the console frequently during exploration to catch silent failures:
- On initial page load.
- After every navigation.
- After submitting any form.
- Before clicking buttons that trigger background actions.

## Error Categorization

Categorize console errors into these primary types:
- **Uncaught Exceptions**: JS runtime errors that crash the execution.
- **Failed Fetch/XHR**: Network requests that return a non-2xx status code.
- **CORS Errors**: Blocked requests due to cross-origin resource sharing.
- **Deprecation Warnings**: Use of outdated APIs or syntax.

## Finding Failed API Calls

Use the `network` command to track and filter network requests:

```bash
# Find all failed API calls (4xx and 5xx)
agent-browser --session dogfood network requests --status 4xx
agent-browser --session dogfood network requests --status 5xx

# Filter by method (e.g., failed POST requests)
agent-browser --session dogfood network requests --method POST --status 500
```

## Reporting Errors

Include console and network errors in your QA report and JSON action log:

```json
{
  "seq": 14,
  "action": { "type": "click", "target": { "ref": "@e5", "name": "Save" } },
  "evidence": {
    "consoleErrors": ["Uncaught ReferenceError: profileData is not defined at saveProfile (settings.js:42)"],
    "networkFailures": ["POST http://localhost:3000/api/profile 500 (Internal Server Error)"]
  }
}
```

## Related References
- [Issue Taxonomy & Exploration Checklist](issue-taxonomy.md)
- [QA Report Generation](qa-report-generation.md)
- [Exploration Protocol](exploration-protocol.md)
