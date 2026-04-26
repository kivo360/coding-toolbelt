# toolbelt — Coding Toolbelt CLI

Skill / hook / agent / command management for AI coding agents (Claude Code, OpenCode, Omoi).

Built with Bun. Single-binary distribution. Zero runtime dependencies.

## Install

```bash
cd ~/Coding/Tooling/coding-toolbelt/cli
bun install
bun run install:local         # builds + symlinks to ~/.local/bin/toolbelt
toolbelt --version
```

Or develop without compiling:

```bash
bun src/index.ts skills list
```

## Quick start

```bash
# Build the index from current ~/.agents/skills/, skills-staging/, skills-cold/
toolbelt skills reindex

# See what you have
toolbelt skills list
toolbelt skills list --tier S
toolbelt skills list --rich
toolbelt skills list --protected

# Search
toolbelt skills find rust testing
toolbelt skills suggest "I'm building a Stripe webhook"

# Move skills around
toolbelt skills tier smart-docs C        # set tier
toolbelt skills demote smart-docs        # active → staging → cold
toolbelt skills promote smart-docs       # cold → staging → active
toolbelt skills install smart-docs       # cold/staging → active

# Cleanup
toolbelt skills doctor                   # find broken symlinks, stray caches
toolbelt skills doctor --fix             # apply safe fixes
```

## Three storage tiers

| Tier | Path | Purpose |
|---|---|---|
| Active | `~/.agents/skills/` | Eagerly discoverable by the harness |
| Staging | `~/.agents/skills-staging/` | Indexed but not eager — load on context match |
| Cold | `~/.agents/skills-cold/` | Hidden until explicitly installed |

The four-letter tiers (`S`, `A`, `B`, `C`) are stored in `~/.agents/skills-index.json` and indicate intent / behavior, not physical location:

- `S` — daily driver, always loaded
- `A` — load on stack/context match
- `B` — explicit invocation only
- `C` — cold storage candidate

## Protection

Some skills cannot be demoted without `--force`:

- `gstack` (OpenCode harness root)
- `creating-opencode-extensions`, `oh-my-openagent`, `find-skills`
- All Anthropic-published skills (`docx`, `pptx`, `xlsx`, `pdf`, `skill-creator`)
- The full `ads-*` and `better-auth-*` families

## Hook integration

### Claude Code `UserPromptSubmit` hook

```bash
#!/usr/bin/env bash
prompt="$1"
toolbelt skills suggest "$prompt" --json --min-confidence 0.6 \
  | jq -r '.suggestions[] | "📚 \(.name) [\(.tier)] — \(.description)"'
```

### OpenCode plugin

Use the `--json` flag to get machine-readable output for `@opencode-ai/plugin`-style integrations.

## Output flags

Most commands accept:
- `--json` — machine-readable output
- `--dry-run` — preview a destructive op without applying
- `NO_COLOR=1` env var — disable ANSI colors

## File layout

```
cli/
├── src/
│   ├── index.ts                  Entry point + dispatcher
│   ├── types.ts                  TypeScript interfaces
│   ├── lib/
│   │   ├── paths.ts              Hardcoded paths + protection rules
│   │   ├── tiers.ts              Tier constants
│   │   ├── frontmatter.ts        Mini YAML parser for SKILL.md frontmatter
│   │   ├── scan.ts               Walk skill dirs, build SkillEntry records
│   │   ├── index-store.ts        Read/write ~/.agents/skills-index.json
│   │   ├── matcher.ts            Token-based scoring
│   │   └── output.ts             ANSI colors, table rendering
│   └── commands/
│       └── skills/
│           ├── reindex.ts        Rebuild the index
│           ├── list.ts           Display by tier
│           ├── doctor.ts         Find broken state, optionally --fix
│           ├── find.ts           Search index by query
│           ├── suggest.ts        Match a free-text prompt → top skills
│           ├── tier.ts           Get/set a skill's tier
│           └── move.ts           install/promote/demote
├── bin/
│   └── toolbelt                  Compiled single binary (after `bun run build`)
└── package.json
```

## Roadmap

See `~/.config/opencode/docs/skill-ontology.md` "Future / Wishlist Features" for the full list. Near-term:

- Embedding-based suggest (semantic match, not just keyword)
- Project-context priors (auto-warm staging on `cd` into a known project)
- Telemetry-driven `prune --unused 60d`
- Remote sources: GitHub direct + skills.sh marketplace fallback
- `toolbelt skills explain <name>` — debug why a skill is in its tier
