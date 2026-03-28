# Video Recording for Evidence

1. [When to Record](#when-to-record)
2. [Pacing for Human Viewers](#pacing-for-human-viewers)
3. [Typing vs. Filling](#typing-vs-filling)
4. [Video Repro Workflow](#video-repro-workflow)
5. [Organizing Evidence Files](#organizing-evidence-files)
6. [Related References](#related-references)

## When to Record

Reserve video recording for issues where static screenshots are insufficient to convey the problem.
- **Record**: Interactive bugs, race conditions, animation glitches, flows requiring multiple steps.
- **Do Not Record**: Typo/content issues, simple layout breaks, single-page UI bugs.

## Pacing for Human Viewers

For clear evidence, use `sleep` between actions to allow the viewer to follow:
- `sleep 1` between navigation and interaction.
- `sleep 2` before taking a final screenshot and stopping the recording.

## Typing vs. Filling

When recording, use `type` instead of `fill`:
- `fill @e1 "text"`: Instantly sets the value.
- `type @e1 "text"`: Types the string character-by-character.

Character-by-character typing provides a much more natural and clear viewing experience in the recorded evidence.

## Video Repro Workflow

```bash
# Start the session and recording
agent-browser --session dogfood record start dogfood-output/videos/BUG-042.webm

# Perform the repro flow
agent-browser --session dogfood open http://localhost:3000/settings
sleep 1

# Take initial state snapshot
agent-browser --session dogfood snapshot -i
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/BUG-042-initial.png

# Perform interactive steps (assuming @e4 is the Save button)
agent-browser --session dogfood type @e2 "User One"
sleep 1
agent-browser --session dogfood click @e4
sleep 2

# Final state screenshot
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/BUG-042-result.png

# Stop the recording
agent-browser --session dogfood record stop
```

## Organizing Evidence Files

Maintain a clean structure for all evidence files:
- Use consistent naming conventions (e.g., `{ISSUE_ID}-{STEP_NUMBER}.png`).
- Store videos in `dogfood-output/videos/`.
- Never delete or overwrite video files until the exploration session is finalized.

## Related References
- [QA Report Generation](qa-report-generation.md)
- [Exploration Protocol](exploration-protocol.md)
- [Issue Taxonomy & Exploration Checklist](issue-taxonomy.md)
