---
name: dogfood-complete
description: >-
  Unified skill for exploring web apps, finding bugs with full evidence, AND generating Playwright
  tests from the same session. Uses agent-browser for video recording, annotated screenshots,
  console error capture, and session persistence. Produces both QA reports (with repro videos,
  severity classification, issue taxonomy) and Playwright test files (with Better Auth integration,
  POM generation, auth fixtures). Trigger on "dogfood," "QA," "find bugs," "exploratory test,"
  "generate tests," "test my app," "check my app," "smoke test," "regression test,"
  "record test," "annotated screenshot," or "test like a user." Coordinates: agent-browser,
  playwright-best-practices, better-auth-test-utils, and better-auth-complete.
---

# Dogfood Complete

Explore your app like a real user. Find bugs with full evidence. Generate Playwright tests from the same session. One exploration, two outputs.

## Architecture

```
agent-browser (Rust CLI — fast, video, annotated screenshots)
        ↓
  Shared Exploration Phase
  (annotated screenshots + JSON action log + video + console errors)
        ↓                          ↓
  QA Mode                       Test Gen Mode
  ├─ Issue taxonomy             ├─ Selector derivation (@refs → Playwright)
  ├─ Severity classification    ├─ Auth boundary detection
  ├─ report.md                  ├─ POM generation
  ├─ Repro videos               ├─ Better Auth fixtures
  └─ Console error capture      └─ .spec.ts files
```

## Prerequisites

| Tool | Install | Purpose |
|------|---------|---------|
| agent-browser | `npm i -g agent-browser && agent-browser install` | Browser engine (Rust CLI) |
| Playwright | `npm install -D @playwright/test` | Test framework (test gen mode) |

## Workflow

```
1. Setup       Install agent-browser, create output dirs, start session
2. Authenticate Sign in if needed, save state for reuse
3. Orient       Navigate to starting point, take annotated snapshot
4. Explore      Systematically visit pages, test features, capture everything
5. Output       Choose mode: QA report, Playwright tests, or both
6. Validate     (Test gen mode) Run generated tests, fix, iterate
```

## Quick Start

```bash
# Install
npm i -g agent-browser && agent-browser install

# Create output dirs
mkdir -p dogfood-output/{screenshots,videos}

# Start session and explore
agent-browser --session dogfood open http://localhost:3000
agent-browser --session dogfood wait --load networkidle
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/initial.png
agent-browser --session dogfood snapshot -i
agent-browser --session dogfood errors
```

## Activity-Based Reference Guide

### Setup & Exploration

| Activity | Reference |
|----------|-----------|
| **Installing agent-browser & project setup** | [setup.md](references/setup.md) |
| **Running an exploration session** | [exploration-protocol.md](references/exploration-protocol.md) |
| **JSON action log format** | [capture-format.md](references/capture-format.md) |
| **Recording video evidence** | [video-evidence.md](references/video-evidence.md) |
| **Capturing console errors** | [console-error-detection.md](references/console-error-detection.md) |

### QA Mode (Finding Bugs)

| Activity | Reference |
|----------|-----------|
| **What to look for (categories & severity)** | [issue-taxonomy.md](references/issue-taxonomy.md) |
| **Writing the QA report** | [qa-report-generation.md](references/qa-report-generation.md) |
| **Report template** | [report-template.md](references/report-template.md) |

### Test Gen Mode (Creating Playwright Tests)

| Activity | Reference |
|----------|-----------|
| **Converting captures to tests** | [test-generation-rules.md](references/test-generation-rules.md) |
| **Deriving selectors from @refs** | [selector-derivation.md](references/selector-derivation.md) |
| **Auth testing with Better Auth** | [auth-testing-patterns.md](references/auth-testing-patterns.md) |
| **Generating fixtures & POMs** | [fixture-generation.md](references/fixture-generation.md) |
| **Running & validating tests** | [validation-workflow.md](references/validation-workflow.md) |

## The Exploration Phase (Shared)

Every exploration step captures 5 things simultaneously:

```bash
SESSION="dogfood"

# 1. Annotated screenshot (element labels match refs)
agent-browser --session $SESSION screenshot --annotate dogfood-output/screenshots/step-01.png

# 2. Accessibility snapshot (structured element tree with @refs)
agent-browser --session $SESSION snapshot -i

# 3. Console errors
agent-browser --session $SESSION errors

# 4. Console logs
agent-browser --session $SESSION console

# 5. Video runs throughout (start at session begin, stop at end)
# Started earlier: agent-browser --session $SESSION record start dogfood-output/videos/session.webm
```

After each capture, log the action to JSON (see [capture-format.md](references/capture-format.md)):

```bash
# The AI records each action as structured JSON for test generation
# Example entry:
{
  "seq": 1,
  "action": "goto",
  "url": "/dashboard",
  "refs": { "@e3": { "role": "button", "name": "Create Project" } },
  "consoleErrors": [],
  "screenshot": "step-01.png",
  "pageState": { "url": "http://localhost:3000/dashboard", "title": "Dashboard" }
}
```

## QA Mode: Finding Bugs

Read [issue-taxonomy.md](references/issue-taxonomy.md) at the start of every session.

**When you find an issue:**

1. Verify it's reproducible (retry once)
2. Choose evidence level:
   - **Interactive bug** (needs clicks to reproduce) → start video, step-by-step screenshots, stop video
   - **Static bug** (visible on load) → single annotated screenshot
3. Append to report immediately (never batch for later)
4. Aim for 5-10 well-documented issues — depth beats quantity

```bash
# Interactive issue repro
agent-browser --session $SESSION record start dogfood-output/videos/issue-001.webm
sleep 1
agent-browser --session $SESSION screenshot dogfood-output/screenshots/issue-001-step-1.png
# ... perform actions ...
sleep 1
agent-browser --session $SESSION screenshot --annotate dogfood-output/screenshots/issue-001-result.png
sleep 2
agent-browser --session $SESSION record stop
```

See [qa-report-generation.md](references/qa-report-generation.md) and [report-template.md](references/report-template.md).

## Test Gen Mode: Creating Playwright Tests

After exploration, transform the JSON action log into Playwright tests.

**Key derivation: `@refs` → Playwright selectors**

```
Snapshot output:  @e3 [button] "Create Project"
   ↓ derives
Playwright:       page.getByRole('button', { name: 'Create Project' })

Snapshot output:  @e5 [textbox] "Email"
   ↓ derives
Playwright:       page.getByRole('textbox', { name: 'Email' })

Snapshot output:  @e7 [link] "Dashboard"
   ↓ derives
Playwright:       page.getByRole('link', { name: 'Dashboard' })
```

**Auth boundary detection:** When the action log contains login/signup steps followed by feature interactions, split into:
- Auth fixture (uses Better Auth `getCookies()` — skip login UI)
- Feature tests (start authenticated via cookie injection)

See [test-generation-rules.md](references/test-generation-rules.md) and [selector-derivation.md](references/selector-derivation.md).

## Dual Mode: Get Both Outputs

Run exploration once, produce both a QA report AND Playwright tests:

```
Explore app (single session)
    ↓ captured: screenshots, video, JSON log, console errors
    ↓
    ├── QA Output:
    │   ├── dogfood-output/report.md
    │   ├── dogfood-output/screenshots/issue-*.png
    │   └── dogfood-output/videos/issue-*.webm
    │
    └── Test Output:
        ├── tests/fixtures/auth.ts
        ├── tests/pages/*.page.ts
        └── tests/generated/*.spec.ts
```

## Skills Loaded by This Pipeline

| Skill | When | Purpose |
|-------|------|---------|
| `agent-browser` | Phase 1-4 | Browser automation (install this skill too) |
| `playwright-best-practices` | Test gen mode | Test structure, locators, assertions |
| `better-auth-test-utils` | Test gen mode | Auth fixtures, getCookies, factories |
| `better-auth-complete` | Test gen mode (if auth detected) | Full auth implementation context |

## Philosophy

- **Test like a user.** Never read source code during exploration. Everything comes from what you observe in the browser.
- **Repro is everything.** Every issue needs proof. Match evidence to the issue — video for interactive bugs, screenshot for static bugs.
- **Explore, then generate.** Don't guess at test structure. Let the real app behavior drive what tests get created.
- **Annotated screenshots are the bridge.** The `@eN` refs appear in screenshots AND derive into Playwright selectors. One capture serves both QA and test generation.
- **Write findings incrementally.** Append each issue and each test as you find/generate them. If the session is interrupted, work is preserved.
