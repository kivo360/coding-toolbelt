# Exploration Protocol

1. [The Exploration Loop](#the-exploration-loop)
2. [Iterative Steps](#iterative-steps)
3. [When to Re-Snapshot](#when-to-re-snapshot)
4. [Example: Dashboard Walkthrough](#example-dashboard-walkthrough)
5. [Complete Check-In Commands](#complete-check-in-commands)
6. [Related References](#related-references)

## The Exploration Loop

Exploration with `agent-browser` follows an iterative cycle:
Navigate → Snapshot → Screenshot → Analyze → Action.

This loop ensures that you have fresh @refs for interaction and clear evidence for any issues discovered.

## Iterative Steps

1. **Navigate**: Go to a specific page or section.
2. **Snapshot**: Capture the interactive tree to get fresh @eN refs.
3. **Screenshot**: Generate an annotated view to map refs to visual elements.
4. **Check Console**: Look for JS errors or failed network calls.
5. **Interact**: Perform actions (click, fill, type) based on the refs.

## When to Re-Snapshot

@refs (e.g., `@e1`, `@e2`) are invalidated whenever:
- A new page is loaded.
- The URL changes via client-side routing.
- Significant DOM modifications occur (e.g., opening a modal or drawer).

**Rule of Thumb**: If the visual state changed, run `snapshot -i` again.

## Example: Dashboard Walkthrough

A typical 5-step walkthrough of exploring a dashboard application:

```bash
# 1. Navigate to Dashboard
agent-browser --session dogfood open http://localhost:3000/dashboard
agent-browser --session dogfood wait --load networkidle

# 2. Capture initial state
agent-browser --session dogfood snapshot -i
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/dashboard-init.png

# 3. Click navigation menu (assuming @e5 is the Settings link)
agent-browser --session dogfood click @e5

# 4. Handle navigation (re-snapshot required)
agent-browser --session dogfood wait --load networkidle
agent-browser --session dogfood snapshot -i
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/settings-page.png

# 5. Fill profile form (assuming @e2 is the Name field, @e3 is Submit)
agent-browser --session dogfood fill @e2 "John Doe"
agent-browser --session dogfood click @e3
```

## Complete Check-In Commands

At every significant page or state, run this "Check-In" sequence:

```bash
# Capture element tree
agent-browser --session dogfood snapshot -i

# Visual evidence
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/{page_name}.png

# Health check
agent-browser --session dogfood errors
agent-browser --session dogfood console
```

## Related References
- [Setup & Project Detection](setup.md)
- [Console Error Detection](console-error-detection.md)
- [Issue Taxonomy & Exploration Checklist](issue-taxonomy.md)
