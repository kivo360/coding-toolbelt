# Installation Guide

Step-by-step instructions for installing the Linter Loop Escalation hook system.

## Prerequisites

- OpenCode with hook support
- Node.js 18+ (for running .mjs hook files)

## Step 1: Copy Hook Files

The hook files are located in your OMO config directory. Copy them to your OpenCode hooks directory:

```bash
# Source directory (OMO config)
SRC=~/.config/opencode/hooks/

# Target directory (OpenCode hooks)
DEST=~/.config/opencode/hooks/

# Create destination if needed
mkdir -p "$DEST"

# Copy the hook files
cp "$SRC/linter-loop-escalation.mjs" "$DEST/"
cp "$SRC/edit-block-on-escalation.mjs" "$DEST/"
cp "$SRC/test-hooks.mjs" "$DEST/"  # Optional: for testing

# Verify files exist
ls -la "$DEST"/*.mjs
```

## Step 2: Register Hooks in settings.json

Edit your `~/.claude/settings.json` to register the hooks:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.config/opencode/hooks/edit-block-on-escalation.mjs"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "LspDiagnostics",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.config/opencode/hooks/linter-loop-escalation.mjs"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.config/opencode/hooks/linter-loop-escalation.mjs"
          }
        ]
      }
    ]
  }
}
```

### Hook Registration Explained

| Hook Type | Matcher | Purpose |
|-----------|---------|---------|
| `PreToolUse` | `Edit` | Block editing on escalated files |
| `PostToolUse` | `LspDiagnostics` | Monitor LSP errors |
| `PostToolUse` | `Bash` | Monitor build/lint command output |

## Step 3: Create State Directory

The hooks need a directory for session state:

```bash
mkdir -p /tmp/omo-linter-state
```

Note: This directory is in `/tmp` so it clears on reboot. If you want persistence across reboots, you can change `STATE_DIR` in the hook files to a permanent location.

## Step 4: Run Tests

Verify the installation:

```bash
node ~/.config/opencode/hooks/test-hooks.mjs
```

Expected output:
```
═══════════════════════════════════════════════════════════
   Linter Loop Escalation Hook System - Test Suite
═══════════════════════════════════════════════════════════

PostToolUse Hook Tests (linter-loop-escalation.mjs)
────────────────────────────────────────────────────
  ✓ C1: Clean lsp_diagnostics returns {}
  ✓ C2: Single error returns {} (below threshold)
  ✓ C3: 2 identical errors → Tier 1 soft guidance
  ✓ C4: 3 identical errors → Tier 2 firm redirect
  ✓ C5: 4 identical errors → Tier 3 HARD STOP
  ...

Test Summary
────────────────────────────────────────────────────────────
  Total:  21
  Passed: 21
  Failed: 0
  Pass@1: 100%
═══════════════════════════════════════════════════════════
```

## Step 5: Enable Debug Mode (Optional)

For debugging, enable debug logging:

```bash
OMA_HOOK_DEBUG=1 node ~/.config/opencode/hooks/linter-loop-escalation.mjs < /dev/null
```

Debug output goes to `/tmp/omo-linter-state/hook-debug.log`.

## File Locations Reference

| File | Purpose |
|------|---------|
| `linter-loop-escalation.mjs` | PostToolUse hook — escalation logic |
| `edit-block-on-escalation.mjs` | PreToolUse hook — edit blocking |
| `test-hooks.mjs` | Test suite |
| `/tmp/omo-linter-state/` | Session state directory |
| `~/.config/opencode/hooks/error-solutions.json` | Cross-session solutions |

## Uninstallation

To remove the hook system:

1. Remove the hook entries from `~/.claude/settings.json`
2. Optionally delete the hook files: `rm ~/.config/opencode/hooks/linter-loop-escalation.mjs ~/.config/opencode/hooks/edit-block-on-escalation.mjs`
3. Optionally delete state: `rm -rf /tmp/omo-linter-state`

## Troubleshooting

### Hooks not firing

1. Check settings.json syntax: `jq '.' ~/.claude/settings.json`
2. Verify paths are absolute (not `~/...` or relative)
3. Check OpenCode logs for hook errors

### Edit blocking not working

1. Ensure PreToolUse hook is registered BEFORE Edit matcher
2. Check that `OMA_HARD_THRESHOLD` is set correctly
3. Verify `/tmp/omo-linter-state/` is writable

### Tests failing

1. Ensure Node.js 18+ is installed: `node --version`
2. Check that all files were copied correctly
3. Try running with debug enabled
