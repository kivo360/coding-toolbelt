#!/usr/bin/env -S uv run --quiet
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "questionary>=2.0",
# ]
# ///
"""
Prompt the user once per repo about bootstrapping code-review-graph.

State is stored in a single JSON file (default ~/.config/review-with-memory/repos.json):

    {
      "/abs/repo/path": {
        "status": "bootstrapped" | "deferred" | "skipped",
        "prompted_at": "<iso8601>",
        "bootstrapped_at": "<iso8601>" | null,
        "manifests": ["pyproject.toml", ...],
        "alias": "<repo-basename>"
      },
      ...
    }

The shell hook (hook.zsh) treats *any* presence of the repo path in this JSON
as "already handled — skip" without parsing the JSON: a substring grep for
`"/abs/repo/path":` is enough (the leading slash + trailing colon make
collisions implausible).
"""
from __future__ import annotations

import datetime as dt
import json
import os
import subprocess
import sys
from pathlib import Path

import questionary

STATE_DIR = Path(os.environ.get(
    "REVIEW_WITH_MEMORY_STATE_DIR",
    str(Path.home() / ".config/review-with-memory"),
))
REPOS_JSON = Path(os.environ.get(
    "REVIEW_WITH_MEMORY_REPOS_JSON", str(STATE_DIR / "repos.json")
))
RWM_HOME = Path(os.environ["REVIEW_WITH_MEMORY_HOME"])


def _now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def _load() -> dict:
    if not REPOS_JSON.exists():
        return {}
    try:
        return json.loads(REPOS_JSON.read_text())
    except json.JSONDecodeError:
        # Corrupt file — back it up so we don't clobber, return empty.
        REPOS_JSON.rename(REPOS_JSON.with_suffix(".json.corrupt"))
        return {}


def _save(state: dict) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = REPOS_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, indent=2, sort_keys=True))
    tmp.replace(REPOS_JSON)


def _record(repo: Path, status: str, manifests: list[str], bootstrapped: bool = False) -> None:
    state = _load()
    entry = state.get(str(repo), {})
    entry["status"] = status
    entry.setdefault("prompted_at", _now())
    entry["manifests"] = manifests
    entry["alias"] = repo.name
    if bootstrapped:
        entry["bootstrapped_at"] = _now()
    state[str(repo)] = entry
    _save(state)


def _signals(repo: Path) -> dict:
    """Cheap features that help the user decide. Skeleton — extend as needed."""
    manifests = [
        "pyproject.toml", "package.json", "Cargo.toml", "go.mod", "Gemfile",
        "pubspec.yaml", "build.gradle", "build.gradle.kts",
    ]
    found = [m for m in manifests if (repo / m).exists()]
    return {"manifests": found}


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: prompt_init.py <repo_root>", file=sys.stderr)
        return 2
    repo = Path(sys.argv[1]).resolve()

    sig = _signals(repo)
    print(f"\n[review-with-memory] new repo detected: {repo}")
    if sig["manifests"]:
        print(f"  manifests: {', '.join(sig['manifests'])}")
    else:
        print("  no known manifest detected — might not be worth bootstrapping")

    answer = questionary.select(
        "Bootstrap code-review-graph here?",
        choices=[
            questionary.Choice("Yes — install, build, register, install hooks, watch", value="yes"),
            questionary.Choice("Not now — ask again next time", value="defer"),
            questionary.Choice("Never — never ask about this repo again", value="never"),
        ],
        default="defer",
    ).ask()

    if answer is None:  # ctrl-C / EOF — leave state untouched, will re-ask
        return 0

    if answer == "never":
        _record(repo, "skipped", sig["manifests"])
        print(f"  recorded as skipped in {REPOS_JSON}")
        return 0

    if answer == "defer":
        _record(repo, "deferred", sig["manifests"])
        return 0

    # answer == "yes"
    bootstrap = RWM_HOME / "ensure-graph" / "bootstrap.sh"
    rc = subprocess.call(["bash", str(bootstrap), str(repo)])
    if rc == 0:
        _record(repo, "bootstrapped", sig["manifests"], bootstrapped=True)
    else:
        # Don't record — leave repo unmarked so user gets re-prompted next cd.
        print(f"  bootstrap exited {rc} — leaving repo unmarked, will re-ask next cd")
    return rc


if __name__ == "__main__":
    sys.exit(main())
