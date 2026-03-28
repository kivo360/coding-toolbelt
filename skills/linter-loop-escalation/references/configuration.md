# Configuration Guide

All thresholds and behavior can be tuned via environment variables.

## Environment Variables

### Escalation Thresholds

| Variable | Default | Description |
|----------|---------|-------------|
| `OMA_SOFT_THRESHOLD` | 2 | Tier 1 (soft guidance) trigger |
| `OMA_HARD_THRESHOLD` | 3 | Tier 2/3 (firm redirect + HARD STOP) trigger |
| `OMA_NUCLEAR_THRESHOLD` | 5 | Tier 4 (NUCLEAR) trigger |

**Tuning recommendations:**

| Use Case | SOFT | HARD | NUCLEAR |
|----------|------|------|---------|
| Aggressive (faster escalation) | 1 | 2 | 3 |
| Balanced (default) | 2 | 3 | 5 |
| Conservative (slower escalation) | 3 | 4 | 6 |

### Timing

| Variable | Default | Description |
|----------|---------|-------------|
| `OMA_STALE_MINUTES` | 5 | Reset state after N minutes of inactivity |
| `OMA_COOLDOWN_MINUTES` | 2 | Cooldown after Tier 3 escalation |
| `OMA_COOLDOWN_NUCLEAR_MINUTES` | 3 | Cooldown after Tier 4 escalation |

**Cooldown explanation:** After a Tier 3/4 escalation, the hook enters cooldown to give the escalated model time to work. During cooldown, the hook returns `{}` (no action).

### Ping-Pong Detection

| Variable | Default | Description |
|----------|---------|-------------|
| `OMA_PINGPONG_THRESHOLD` | 3 | How many times fingerprint must appear in window |
| `OMA_PINGPONG_WINDOW` | 10 | Rolling window size for detection |

**Ping-pong detection:** Catches when you alternate between the same errors (e.g., fix A breaks B, fix B breaks A).

Lower values = more sensitive, higher values = less sensitive.

### Debugging

| Variable | Default | Description |
|----------|---------|-------------|
| `OMA_HOOK_DEBUG` | 0 | Enable debug logging (1=on) |

Debug output goes to `/tmp/omo-linter-state/hook-debug.log`.

## Setting Environment Variables

### Per-Session

```bash
OMA_HARD_THRESHOLD=2 OMA_SOFT_THRESHOLD=1 opencode
```

### In OpenCode Config

Add to your shell profile or `~/.zshrc`:

```bash
export OMA_HARD_THRESHOLD=3
export OMA_SOFT_THRESHOLD=2
export OMA_STALE_MINUTES=5
export OMA_COOLDOWN_MINUTES=2
export OMA_COOLDOWN_NUCLEAR_MINUTES=3
```

### Inline for Testing

```bash
OMA_HOOK_DEBUG=1 OMA_HARD_THRESHOLD=2 node ~/.config/opencode/hooks/test-hooks.mjs
```

## Tuning Guide

### Reduce False Positives

If the hook escalates too aggressively:

1. Increase `OMA_SOFT_THRESHOLD` to 3
2. Increase `OMA_HARD_THRESHOLD` to 4
3. Increase `OMA_STALE_MINUTES` to 10

### Make Hook More Responsive

If the hook doesn't escalate enough:

1. Decrease `OMA_SOFT_THRESHOLD` to 1
2. Decrease `OMA_HARD_THRESHOLD` to 2
3. Decrease `OMA_PINGPONG_THRESHOLD` to 2

### Adjust Cooldown

If you need more time for escalated models:

```bash
export OMA_COOLDOWN_MINUTES=5
export OMA_COOLDOWN_NUCLEAR_MINUTES=10
```

If escalation is too slow:

```bash
export OMA_COOLDOWN_MINUTES=1
export OMA_COOLDOWN_NUCLEAR_MINUTES=2
```

## State Files

### Session State

Location: `/tmp/omo-linter-state/{session_id}.json`

```json
{
  "consecutiveMatches": 3,
  "lastFingerprint": "abc123def456",
  "lastTimestamp": 1711651200000,
  "history": [...],
  "attempts": [...],
  "lastFile": "/path/to/file.ts",
  "lastEscalationTier": 2,
  "lastEscalationTime": 1711651200000,
  "fingerprintWindow": ["abc123", "def456", "abc123", "def456"]
}
```

### Cross-Session Solutions

Location: `~/.config/opencode/hooks/error-solutions.json`

```json
{
  "abc123def456": {
    "displayCodes": ["TS2345"],
    "lastFix": "Added type annotation to resolve argument type mismatch",
    "successCount": 3,
    "avgAttempts": 2.5,
    "lastSeen": "2026-03-28T12:00:00.000Z"
  }
}
```

The solutions file is read once at startup and written only when an error is resolved. It has a 100-entry LRU eviction policy.
