# opencode-skill-tap

OpenCode plugin that taps into every user prompt and surfaces relevant skills from the local index — including cold-storage skills that aren't currently active.

## How it works

1. `chat.message` fires on every user message.
2. Plugin shells out to `toolbelt skills suggest "$prompt" --json`.
3. If matches found, stashes a markdown block in plugin state.
4. `experimental.chat.system.transform` fires next, appending the block to the LLM system prompt.
5. The agent sees the suggestions inline and can either mention them to you or auto-install via `toolbelt skills install <name>`.

## Install

Add to `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "...other plugins...",
    "/Users/kevinhill/Coding/Tooling/coding-toolbelt/plugins/opencode-skill-tap/index.ts"
  ]
}
```

OpenCode loads plugins by file path or npm package name. Local file path is fine for development.

## Configuration

Environment variables:

| Var | Default | Purpose |
|---|---|---|
| `TOOLBELT_BIN` | `toolbelt` | Path to the toolbelt binary |
| `SKILL_TAP_DISABLED` | `false` | Set to `true` to silently disable |
| `SKILL_TAP_MIN_CONFIDENCE` | `0.5` | Minimum match confidence (0–1) |
| `SKILL_TAP_LIMIT` | `3` | Max suggestions per prompt |
| `SKILL_TAP_TIERS` | `B,C` | Which tiers to surface (skip S/A — assumed loaded) |

## Behavior

- Stays silent for prompts under 20 chars.
- Logs to OpenCode's app log under `service: "skill-tap"`.
- Failures are non-fatal — if `toolbelt` is missing or errors out, the plugin no-ops.

## Companion

The Claude Code equivalent lives at `~/.claude/hooks/skill-suggest.sh`, registered as a `UserPromptSubmit` hook in `~/.claude/settings.json`. Both share the same `toolbelt skills suggest --json` backend.
