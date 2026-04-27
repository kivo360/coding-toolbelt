#!/usr/bin/env -S uv run --quiet
# /// script
# requires-python = ">=3.10"
# ///
"""
Record a pre-existing bootstrapped repo (graph.db already present) into
repos.json without re-prompting. Called by hook.zsh as a fast no-op when
encountering an already-built repo for the first time.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import sys
from pathlib import Path

STATE_DIR = Path(os.environ.get(
    "REVIEW_WITH_MEMORY_STATE_DIR",
    str(Path.home() / ".config/review-with-memory"),
))
REPOS_JSON = Path(os.environ.get(
    "REVIEW_WITH_MEMORY_REPOS_JSON", str(STATE_DIR / "repos.json")
))


def main() -> int:
    if len(sys.argv) != 2:
        return 2
    repo = Path(sys.argv[1]).resolve()
    state = json.loads(REPOS_JSON.read_text()) if REPOS_JSON.exists() else {}
    if str(repo) in state:
        return 0
    state[str(repo)] = {
        "status": "bootstrapped",
        "prompted_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "bootstrapped_at": None,  # we didn't run bootstrap; graph.db pre-existed
        "manifests": [],
        "alias": repo.name,
        "note": "discovered pre-existing graph.db — not bootstrapped by ensure-graph",
    }
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = REPOS_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, indent=2, sort_keys=True))
    tmp.replace(REPOS_JSON)
    return 0


if __name__ == "__main__":
    sys.exit(main())
