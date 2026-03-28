---
name: oh-my-openagent
description: >-
  Complete guide for oh-my-openagent (OMO) multi-model orchestration harness. Covers installation,
  agent selection, category system, cost optimization, and troubleshooting for OpenCode. Use when
  configuring OMO, setting up agents, optimizing costs, delegating to specialized models, or
  understanding the OMO agent team (Sisyphus, Hephaestus, Prometheus, Atlas, Oracle, etc.).
---

# Oh My OpenAgent (OMO)

Multi-model orchestration for OpenCode. The right brain for the right job.

> **Quick Start:** Type `ultrawork` or `ulw` for autonomous execution. Press **Tab** for Prometheus planning mode.

## What Is OMO?

Oh My OpenAgent transforms a single AI agent into a **coordinated development team** through multi-model orchestration. Instead of one model doing everything, OMO routes tasks to specialized agents based on intent.

**Core Philosophy:** The right brain for the right job.
- Claude/Kimi/GLM for orchestration and communication
- GPT-5.4 for deep reasoning and architecture
- Gemini for visual/frontend tasks
- MiniMax/Grok for speed and utility

---

## Installation

### Step 1: Install OpenCode (Prerequisite)

```bash
opencode --version  # Should be 1.0.150 or higher
```

### Step 2: Install OMO Plugin

```bash
# Interactive installer (recommended)
bunx oh-my-opencode install

# Non-interactive with common providers
bunx oh-my-opencode install --no-tui \
  --claude=max20 \
  --openai=yes \
  --gemini=yes \
  --copilot=yes \
  --opencode-go=yes
```

### Step 3: Authenticate Providers

```bash
# Claude (Anthropic)
opencode auth login
# → Select Anthropic → Claude Pro/Max

# OpenAI
opencode auth login
# → Select OpenAI

# Google Gemini
opencode auth login
# → Select Google → OAuth

# Verify setup
bunx oh-my-opencode doctor
```

---

## The Agent Team

OMO provides 11 specialized agents:

| Agent | Model | Role | When to Use |
|-------|-------|------|-------------|
| **Sisyphus** | Claude Opus/Kimi K2.5/GLM 5 | Main orchestrator | Default for most tasks. Plans, delegates, drives to completion. |
| **Hephaestus** | GPT-5.4 | Deep autonomous worker | Complex architecture, debugging, cross-domain synthesis. Give goal, not recipe. |
| **Prometheus** | Claude Opus/Kimi/GPT-5.4 | Strategic planner | Press **Tab** or type `@plan`. Interviews you, builds detailed plan. |
| **Atlas** | Claude Sonnet/Kimi/GPT-5.4 | Todo orchestrator | Executes Prometheus plans. Distributes tasks, verifies completion. |
| **Oracle** | GPT-5.4 (preferred) | Architecture consultant | Complex decisions, unfamiliar patterns, security concerns. |
| **Metis** | Claude Opus | Gap analyzer | Catches what Prometheus missed. Pre-plan review. |
| **Momus** | GPT-5.4 (xhigh) | Ruthless reviewer | High-accuracy plan validation. |
| **Explore** | Grok Code Fast/MiniMax | Fast codebase grep | Pattern discovery, code search. Speed > intelligence. |
| **Librarian** | MiniMax/Claude Haiku | Docs/OSS search | Documentation, remote repos, library examples. |
| **Multimodal Looker** | GPT-5.4/Kimi/GLM-4.6v | Vision/screenshots | Screenshot analysis, diagrams, PDFs. |

---

## Two Primary Modes

### Mode 1: Ultrawork (Autonomous)

```
ultrawork
```
or
```
ulw
```

- Agent explores codebase automatically
- Researches patterns
- Implements the feature
- Verifies with diagnostics
- Keeps working until done

**Best for:** Complex tasks where explaining context is tedious.

### Mode 2: Prometheus (Planning)

```
# Press Tab → Select Prometheus
# OR type from Sisyphus:
@plan "your task description"
```

1. Prometheus interviews you with clarifying questions
2. Metis analyzes for gaps/ambiguities
3. Plan written to `.sisyphus/plans/{name}.md`
4. Optional: Momus reviews for high accuracy
5. Run `/start-work` → Atlas executes

**Best for:** Multi-day projects, critical production changes.

---

## Category System

Routes intent to optimal model. Use **categories** not model names.

| Category | Model | Use Case |
|----------|-------|----------|
| `visual-engineering` | Gemini 3.1 Pro | Frontend, UI/UX, CSS, design, animation |
| `ultrabrain` | GPT-5.4 xhigh | Maximum reasoning, architecture decisions |
| `deep` | GPT-5.3 Codex | Goal-oriented autonomous problem-solving |
| `artistry` | Gemini 3.1 Pro high | Creative, novel approaches |
| `quick` | GPT-5.4 Mini | Trivial tasks, single-file changes |
| `unspecified-high` | Claude Opus max | General complex work |
| `unspecified-low` | Claude Sonnet | General standard work |
| `writing` | Gemini 3 Flash | Documentation, prose |

**Example delegation:**
```typescript
task(
  category: "visual-engineering",
  load_skills: ["frontend-ui-ux"],
  prompt: "Redesign the sidebar with new spacing..."
)
```

---

## Essential Commands

| Command | Purpose |
|---------|---------|
| `ultrawork` / `ulw` | Autonomous execution mode |
| `@plan "task"` | Switch to Prometheus for planning |
| `/start-work` | Execute Prometheus plan with Atlas |
| `/init-deep` | Generate hierarchical AGENTS.md files |
| `/ralph-loop` | Self-referential development loop |
| `/ulw-loop` | Ultrawork with Ralph loop combined |
| Tab key | Switch between agents |
| `@filename` | Fuzzy file search and reference |
| `/undo` | Revert recent changes |
| `/redo` | Restore undone changes |

---

## Agent Delegation Patterns

### Pattern 1: Research First
```
User: "How should I implement auth?"

Sisyphus:
1. Fire @explore (background) → Find existing auth code
2. Fire @librarian (background) → Research auth patterns
3. Synthesize findings
4. Recommend approach
```

### Pattern 2: Complex Implementation
```
User: "Build a new payment system"

Sisyphus:
1. Fire @explore → Find payment-related code
2. Fire @librarian → Research PCI compliance
3. Fire @oracle (if needed) → Architecture decisions
4. Create TODO list
5. Delegate implementation tasks
6. Verify with lsp_diagnostics
```

### Pattern 3: Frontend Work
```
User: "Redesign the dashboard"

Sisyphus:
1. Fire task(category="visual-engineering", load_skills=["frontend-ui-ux"])
2. Junior agent implements with MUI/Tailwind patterns
3. Verify with lsp_diagnostics
4. Return results
```

### Pattern 4: Deep Debugging
```
User: "Fix this race condition"

Sisyphus → Switch to Hephaestus:
1. Autonomous exploration across 15 files
2. Trace execution paths
3. Identify root cause
4. Implement fix
5. Verify with tests
```

---

## Troubleshooting

### Issue: "No active plan found" when running `/start-work`

**Cause:** No Prometheus plan exists.

**Fix:**
```bash
# Option 1: Create plan first
@plan "your task description"

# Option 2: Clear boulder and retry
rm .sisyphus/boulder.json
/start-work
```

### Issue: Model not available / fallback chain failing

```bash
# Check available models
opencode models

# Refresh model cache
opencode models --refresh

# Verify authentication
opencode auth list

# Run diagnostics
bunx oh-my-opencode doctor
```

### Issue: OMO not loading

```bash
# Ensure plugin is registered
cat ~/.config/opencode/opencode.json | jq '.plugin'

# Should contain "oh-my-openagent" or "oh-my-opencode"
```

---

## Session Recovery

OMO tracks progress in `.sisyphus/boulder.json`:

```
project/
├── .sisyphus/
│   ├── boulder.json          # Current work state
│   ├── plans/
│   │   └── your-plan.md      # Prometheus plan
│   └── notepads/
│       └── your-plan/
│           ├── learnings.md   # Patterns discovered
│           ├── decisions.md   # Architectural choices
│           ├── issues.md      # Problems encountered
│           └── verification.md # Test results
```

**Resume work:**
```bash
/start-work  # Automatically resumes from boulder.json
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│  OH-MY-OPENAGENT QUICK REFERENCE                           │
├─────────────────────────────────────────────────────────────┤
│  MODES:                                                    │
│    ultrawork / ulw  → Autonomous "just do it" mode         │
│    @plan            → Prometheus interview mode             │
│    /start-work      → Atlas execution mode                 │
├─────────────────────────────────────────────────────────────┤
│  AGENTS:                                                   │
│    Sisyphus    → Main orchestrator (default)              │
│    Hephaestus  → Deep worker (Tab → select)               │
│    Prometheus  → Planner (Tab → select, or @plan)         │
│    Atlas       → Conductor (auto-activated on /start)      │
│    Oracle      → Consultant (for architecture)             │
│    Explore     → Fast grep (background tasks)              │
│    Librarian   → Docs/OSS search (background)             │
├─────────────────────────────────────────────────────────────┤
│  CATEGORIES:                                               │
│    visual-engineering → Gemini 3.1 Pro (UI/UX)             │
│    ultrabrain         → GPT-5.4 xhigh (reasoning)          │
│    deep               → GPT-5.3 Codex (autonomous)         │
│    quick              → GPT-5.4 Mini (fast tasks)           │
├─────────────────────────────────────────────────────────────┤
│  COMMANDS:                                                 │
│    /init-deep       → Generate AGENTS.md hierarchy         │
│    /ralph-loop      → Self-referential dev loop           │
│    /ulw-loop        → Ultrawork + Ralph combined          │
│    Tab key          → Switch agent                         │
│    @filename        → Fuzzy file search                    │
│    /undo /redo      → Change history                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Further Reading

- [OMO Features Reference](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/reference/features.md)
- [Orchestration Guide](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)
- [Agent-Model Matching](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/agent-model-matching.md)
- [Installation Guide](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/installation.md)
