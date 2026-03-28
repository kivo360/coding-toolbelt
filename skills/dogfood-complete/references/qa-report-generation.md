# QA Report Generation

1. [Report Structure](#report-structure)
2. [Issue Numbering](#issue-numbering)
3. [Evidence Levels](#evidence-levels)
4. [Repro Workflow](#repro-workflow)
5. [Summary Severity Counts](#summary-severity-counts)
6. [Related References](#related-references)

## Report Structure

The QA report is a comprehensive document that aggregates all issues discovered during exploration. It should be formatted as a Markdown file for readability.

## Issue Numbering

Use a consistent prefix for all identified issues:
- `ISSUE-001`: Broken submit button on Login page
- `ISSUE-002`: Console error on Profile save
- `ISSUE-003`: Responsive layout break at 768px

## Evidence Levels

Match the evidence to the issue type for maximum clarity.

### Static Issues
For simple UI bugs (typos, layout breaks), provide:
- A single annotated screenshot.
- A concise description of the bug.
- The URL where it occurred.

### Interactive Issues
For complex functional bugs (broken flows, incorrect states), provide:
- A screen recording (video).
- Step-by-step screenshots mapping to specific user actions.
- Precise reproduction steps.

## Repro Workflow

Use this sequence to capture high-quality reproduction evidence for interactive bugs:

```bash
# 1. Start the recording
agent-browser --session dogfood record start dogfood-output/videos/ISSUE-001.webm

# 2. Perform reproduction steps (with pauses for clarity)
agent-browser --session dogfood open http://localhost:3000/login
sleep 1

# Capture initial state for repro step 1
agent-browser --session dogfood snapshot -i
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/ISSUE-001-step-1.png

# 3. Perform action (assuming @e4 is Submit)
agent-browser --session dogfood click @e4
sleep 2

# 4. Final state check
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/ISSUE-001-result.png
agent-browser --session dogfood record stop
```

## Summary Severity Counts

The report should include a summary table at the top:

| Severity | Count |
|----------|-------|
| Critical | 1     |
| Major    | 2     |
| Minor    | 4     |
| Info     | 1     |

## Related References
- [Issue Taxonomy & Exploration Checklist](issue-taxonomy.md)
- [Video Recording for Evidence](video-evidence.md)
- [Console Error Detection](console-error-detection.md)
