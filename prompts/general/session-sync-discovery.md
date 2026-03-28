# Session Sync: Discovery Prompt

> Paste this into OTHER sessions to get a structured summary of their work.
> Bring the response back to the skills ecosystem session for reconciliation.

```
I have parallel development sessions running. I need you to summarize everything you've built or planned in THIS session so I can sync it with other sessions.

Please provide a structured summary in EXACTLY this format:

## Session Summary

### What Was Built
List every artifact (files, skills, configs, scripts) with:
- Name
- Location (file path)
- Purpose (one sentence)
- Status (done / in-progress / planned)

### Key Concepts & Decisions
List any architectural decisions, workflow definitions, or design patterns you established:
- [Decision]: [Rationale]

### Integration Points
What does this session's work connect to?
- What does it DEPEND on? (other tools, skills, configs)
- What DEPENDS on it? (what would break if this changed)
- What OVERLAPS with? (similar functionality that might exist elsewhere)

### Eval/Test Infrastructure
If you built any testing, eval, or quality infrastructure:
- What types of tests/evals exist?
- What frameworks/tools are used?
- Where do test files live?
- How are they run?

### Escalation Strategies
If you defined any escalation or error-handling workflows:
- What triggers escalation?
- What are the escalation levels?
- Where is this documented?

### Open Items
What's unfinished, blocked, or planned but not started?
- [Item]: [Status] — [What's needed to unblock]

### Sync Recommendations
Based on what you know about THIS session, what should other sessions be aware of? What should they NOT duplicate?
```
