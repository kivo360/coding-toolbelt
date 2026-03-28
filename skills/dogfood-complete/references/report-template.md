# QA Report Template

Table of Contents
1. [Overview](#overview)
2. [Header Section](#header-section)
3. [Summary Section](#summary-section)
4. [Issue Template Block](#issue-template-block)
5. [Wrap-Up Section](#wrap-up-section)
6. [Related References](#related-references)

## Overview
This reference defines the structured QA report produced by the `dogfood-complete` skill. The report is intended to be a single source of truth for the quality of the explored application flow.

## Header Section
The header contains the context for the entire QA session.

```markdown
# QA Report: [Session Name]
- **App Name**: [Name]
- **Target URL**: [Base URL]
- **Date**: [ISO Date]
- **Tester**: [Agent Name / Sisyphus-Junior]
- **Exploration Path**: [Brief description of flows covered]
```

## Summary Section
The summary section provides a high-level overview of the issues found.

```markdown
## Summary
- **Total Issues Found**: [Count]
- **Critical**: [Count]
- **Major**: [Count]
- **Minor**: [Count]
- **Info**: [Count]

### Categories
- Functional: [Count]
- UX: [Count]
- Visual: [Count]
- Console/Runtime: [Count]
- Content/Copy: [Count]
```

## Issue Template Block
Repeat this block for every issue found.

```markdown
### ISSUE-NNN: [Clear, Descriptive Title]

**Severity**: Critical | Major | Minor | Info
**Category**: Functional | UX | Visual | Console | Performance | Content
**URL**: [The page where the issue occurred]

**Repro Steps**:
1. [Step 1] — see: `dogfood-output/screenshots/step1.png`
2. [Step 2] — see: `dogfood-output/screenshots/step2.png`
3. [Step 3]

**Expected**: [What the user or system should have done]
**Actual**: [The unexpected behavior that occurred]

**Visual Proof**:
- **Screenshot**: `dogfood-output/screenshots/annotated-ISSUE-NNN.png`
- **Repro Video**: `dogfood-output/videos/repro-ISSUE-NNN.mp4` (if applicable)

**Developer Context**:
- **Console Errors**: [Paste captured errors or "N/A"]
- **Affected Elements**: `@e4 [button] "Submit"`
```

## Wrap-Up Section
The wrap-up section provides additional context for the development team.

```markdown
## Wrap-Up
- **Environment**: [Node.js version, OS, Browser version]
- **Test Coverage**: [List of generated tests that pass]
- **Notes**: [Any additional insights or blockers encountered]
```

## Related References
- [Validation Workflow](validation-workflow.md)
- [Test Generation Rules](test-generation-rules.md)
- [Auth Testing with Better Auth](auth-testing-patterns.md)
