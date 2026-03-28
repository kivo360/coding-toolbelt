---
name: linter-loop-escalation
description: >-
  Hook system for OpenCode/oh-my-openagent that detects when an agent is stuck in a linter/build
  error loop and injects escalating guidance. 4-tier escalation: soft nudge (2 errors) →
  firm redirect (3 errors) → HARD STOP with model switch (4 errors) → NUCLEAR requiring Oracle
  consultation (5+ errors). Includes ping-pong detection, cross-session learning, and TRUE edit
  blocking via PreToolUse hook. Trigger on "linter loop," "stuck on error," "edit blocked,"
  "escalate," "error loop," "hook system," or when agents appear stuck on repeated errors.
---

# Linter Loop Escalation Hook System

Detect stuck agents. Inject escalating guidance. Block harmful edits. Learn across sessions.

## What It Does

The hook system monitors `LspDiagnostics`, `Bash` (build/lint commands), and `Edit` tool calls to detect when an agent is spinning in circles on the same error. It provides escalating interventions:

| Tier | Trigger | Behavior |
|------|---------|----------|
| 1 | 2 identical errors | Soft nudge — "try fundamentally different approach" |
| 2 | 3 identical errors | Firm redirect — explicit `task()` escalation |
| 3 | 4 identical errors | **HARD STOP** — switch models NOW |
| 4 | 5+ identical errors | **NUCLEAR** — consult @oracle before proceeding |

### Advanced Features

- **Language-agnostic fingerprinting** — content-hash approach works with any linter (TypeScript, ESLint, Python, Rust, Go, etc.)
- **Ping-pong detection** — catches alternating errors (fix A breaks B, fix B breaks A)
- **Cross-session learning** — remembers how errors were resolved in previous sessions
- **True edit blocking** — PreToolUse hook prevents editing the same failing file
- **Cooldown** — gives escalated model time to work
- **Resolution summary** — tells agent when errors finally clear

## Quick Install

### Step 1: Copy Hook Files

```bash
# Source location
SRC=~/.config/opencode/hooks/

# Copy to your opencode hooks directory (create if needed)
mkdir -p ~/.config/opencode/hooks
cp $SRC/linter-loop-escalation.mjs ~/.config/opencode/hooks/
cp $SRC/edit-block-on-escalation.mjs ~/.config/opencode/hooks/
```

### Step 2: Register in settings.json

Add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "node ~/.config/opencode/hooks/edit-block-on-escalation.mjs" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "LspDiagnostics",
        "hooks": [{ "type": "command", "command": "node ~/.config/opencode/hooks/linter-loop-escalation.mjs" }]
      },
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "node ~/.config/opencode/hooks/linter-loop-escalation.mjs" }]
      }
    ]
  }
}
```

### Step 3: Run Tests

```bash
node ~/.config/opencode/hooks/test-hooks.mjs
```

See [references/installation.md](references/installation.md) for detailed step-by-step setup.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OMA_SOFT_THRESHOLD` | 2 | Tier 1 trigger |
| `OMA_HARD_THRESHOLD` | 3 | Tier 2/3 trigger |
| `OMA_NUCLEAR_THRESHOLD` | 5 | Tier 4 trigger |
| `OMA_STALE_MINUTES` | 5 | Reset after N minutes of inactivity |
| `OMA_COOLDOWN_MINUTES` | 2 | Cooldown after Tier 3 |
| `OMA_COOLDOWN_NUCLEAR_MINUTES` | 3 | Cooldown after Tier 4 |
| `OMA_PINGPONG_THRESHOLD` | 3 | Ping-pong loop detection sensitivity |
| `OMA_HOOK_DEBUG` | 0 | Enable debug logging (1=on) |

See [references/configuration.md](references/configuration.md) for tuning guide.

## How It Works

### Hook Flow

```
Agent calls tool (LspDiagnostics, Bash, Edit)
    ↓
Tool executes, returns output
    ↓
PostToolUse hook fires with: { session_id, tool_name, tool_input, tool_response }
    ↓
Hook extracts error fingerprint (content-hash of normalized error)
    ↓
Same fingerprint detected N times?
    ├─ No → reset counter
    └─ Yes → escalate based on tier
    ↓
Response: {} (no action) OR { hookSpecificOutput: { additionalContext } }
```

### Edit Blocking Flow

```
Agent attempts Edit tool call
    ↓
PreToolUse hook fires with: { session_id, tool_name, tool_input }
    ↓
Read state from /tmp/omo-linter-state/{session_id}.json
    ↓
consecutiveMatches >= HARD_THRESHOLD AND same file?
    ├─ No → exit 0 (ALLOW)
    └─ Yes → exit 2 (BLOCK) with message
```

### State & Solutions

- **Session state:** `/tmp/omo-linter-state/{session_id}.json`
- **Cross-session solutions:** `~/.config/opencode/hooks/error-solutions.json`
- State auto-resets on: clean output, different error, 5+ min staleness

## Integration with OMO Categories

When escalation triggers, use these category routes:

| Tier | Category | Model | Use When |
|------|----------|-------|----------|
| 2 | `unspecified-high` | Claude Opus 4.6 | Need fresh perspective |
| 3 | `ultrabrain` | GPT-5.4 xhigh | Switch models NOW |
| 3 | `ultrawork` | — | Autonomous model switch |
| 4 | @oracle | GPT-5.4 | Consult architecture |

```javascript
// Tier 2: Firm redirect
task({ category: 'unspecified-high', prompt: 'Debug: [error details]' })

// Tier 3: HARD STOP
ultrawork
// OR
task({ category: 'ultrabrain', prompt: 'Failed Nx on [error]. Tried: [attempts]. Need fresh approach.' })
```

## Available Agents

| Agent | Purpose |
|-------|---------|
| `@oracle` | Architecture consultant, root cause analysis |
| `@librarian` | Documentation search |
| `@explore` | Codebase exploration |

## Troubleshooting

**Hooks not firing?**
- Check `~/.claude/settings.json` has correct hook registration
- Verify paths are absolute (not relative)
- Run with `OMA_HOOK_DEBUG=1` for logging

**Not detecting your linter?**
- The hook uses content-hash fingerprinting — it works with any linter
- For build commands, add patterns to `BUILD_LINT_PATTERNS` in the hook source

See [references/installation.md](references/installation.md) for full troubleshooting guide.
