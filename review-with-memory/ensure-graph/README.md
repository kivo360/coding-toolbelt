# ensure-graph

Prompts the user once per repo (on first `cd`) to bootstrap code-review-graph + review-with-memory hooks. Skeleton — flesh out the commented-out steps in `bootstrap.sh`.

## Files

- `hook.zsh` — chpwd hook. Bails fast when not a git repo, repo is denied, or graph.db already exists. Otherwise hands off to `prompt_init.py`.
- `prompt_init.py` — questionary three-option prompt (yes / not now / never). Records state in `$REVIEW_WITH_MEMORY_STATE_DIR`.
- `bootstrap.sh` — idempotent installer. All actions commented out for now — un-comment as each step is verified.

## State file

Single JSON document at `~/.config/review-with-memory/repos.json`:

```json
{
  "/Users/you/Coding/foo": {
    "status": "bootstrapped",
    "prompted_at": "2026-04-27T18:50:00+00:00",
    "bootstrapped_at": "2026-04-27T18:50:42+00:00",
    "manifests": ["pyproject.toml"],
    "alias": "foo"
  },
  "/Users/you/Coding/throwaway": {
    "status": "skipped",
    "prompted_at": "2026-04-27T18:51:11+00:00",
    "manifests": [],
    "alias": "throwaway"
  }
}
```

Statuses: `bootstrapped` | `deferred` | `skipped`. Hook treats *any* presence of the path as "already handled — skip prompt"; substring grep for `"<path>":` in the JSON is fast enough for the chpwd hot path.

## Wiring

Add to `~/.zshrc`:
```bash
source "$REVIEW_WITH_MEMORY_HOME/ensure-graph/hook.zsh"
```

Requires `REVIEW_WITH_MEMORY_HOME` set in `~/.zshenv` (already done).

## Bail-out criteria (in `hook.zsh`)

1. Not in a git repo → exit
2. Repo path appears in `repos.json` (any status) → exit
3. `.code-review-graph/graph.db` exists but repo not in JSON → run `record_existing.py` (silent, no prompt) → exit
4. Otherwise → invoke `prompt_init.py`

## Decision criteria the prompt surfaces (in `prompt_init.py::_signals`)

Currently shows: presence of known manifests (`pyproject.toml`, `package.json`, `Cargo.toml`, `go.mod`, `Gemfile`, `pubspec.yaml`, `build.gradle`).

TODO ideas:
- Source file count threshold
- Author commit count (filter "repos I just cloned to read")
- Detect submodule of already-bootstrapped repo (avoid duplicate graphs)
- Geographic gate: under `~/Coding/` → strong yes signal

## Bootstrap actions to flesh out (in `bootstrap.sh`)

- [ ] `code-review-graph install` — gate behind a $HOME marker so it runs once per machine, not per repo
- [ ] `code-review-graph build` — full first-time parse
- [ ] `code-review-graph register .` — multi-repo registry
- [ ] `bash $REVIEW_WITH_MEMORY_HOME/git-bridge/install_hooks.sh` — pre/post-commit hooks
- [ ] `sync_to_bridge.py` — initial graph push (already gated on bridge `/health`)
- [x] `code-review-graph daemon add <path> --alias <name>` + `daemon start` if not running — verified CLI; wired but currently no-op since the daemon is the only un-commented action and CRG itself isn't being installed/built yet

Each is currently commented in `bootstrap.sh` — un-comment after a manual dry-run on a real repo.
