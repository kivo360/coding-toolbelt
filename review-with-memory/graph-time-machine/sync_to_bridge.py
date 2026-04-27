#!/usr/bin/env -S uv run --quiet
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "code-review-graph",
#     "httpx>=0.27",
# ]
# ///
"""
Read code-review-graph's local graph via its public Python API and POST the
node/edge set to claude-memory-bridge for the current commit.

Uses ``GraphStore`` + ``export_graph_data`` instead of opening graph.db
directly — keeps us inside CRG's supported contract so internal schema
changes don't break the sync.

Pairs with snapshot_graph.py:
    - snapshot_graph.py  -> Hindsight memory (summary stats, narrative recall)
    - sync_to_bridge.py  -> Postgres via bridge (full graph, structural queries)

Usage:
    sync_to_bridge.py                          # HEAD of current repo
    sync_to_bridge.py --commit <sha>
    sync_to_bridge.py --bridge http://localhost:7777
    sync_to_bridge.py --batch-size 1000 --dry-run

Environment:
    BRIDGE_BASE_URL   default http://localhost:7777
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

import httpx
from code_review_graph.graph import GraphStore
from code_review_graph.visualization import export_graph_data

DEFAULT_BRIDGE = os.environ.get("BRIDGE_BASE_URL", "http://localhost:7777")
DB_RELPATH = Path(".code-review-graph/graph.db")


def _run(cmd: list[str], cwd: Path | None = None) -> str:
    return subprocess.check_output(cmd, cwd=cwd, text=True).strip()


def _repo_root() -> Path:
    return Path(_run(["git", "rev-parse", "--show-toplevel"]))


def _commit_sha(commit: str | None) -> str:
    return _run(["git", "rev-parse", commit or "HEAD"])


def _normalize_node(d: dict) -> dict:
    """CRG's node_to_dict + community_id/params/return_type — map to bridge schema."""
    extra = {
        k: d[k]
        for k in ("params", "return_type", "community_id", "parent_name")
        if d.get(k) is not None
    }
    return {
        "qualified_name": d["qualified_name"],
        "kind": d["kind"],
        "name": d["name"],
        "file_path": d["file_path"],
        "line_start": d.get("line_start"),
        "line_end": d.get("line_end"),
        "language": d.get("language"),
        "signature": None,  # CRG's export_graph_data doesn't include this — fine
        "is_test": bool(d.get("is_test", False)),
        "extra": extra,
    }


def _normalize_edge(d: dict) -> dict:
    """CRG uses source/target; bridge expects source_qualified/target_qualified."""
    extra = {k: d[k] for k in ("confidence_tier",) if d.get(k) is not None}
    return {
        "kind": d["kind"],
        "source_qualified": d["source"],
        "target_qualified": d["target"],
        "file_path": d.get("file_path", ""),
        "line": d.get("line"),
        "confidence": d.get("confidence", 1.0),
        "extra": extra,
    }


def _chunked(seq: list[dict], n: int):
    for i in range(0, len(seq), n):
        yield seq[i : i + n]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--commit", help="commit sha (default HEAD)")
    ap.add_argument("--bridge", default=DEFAULT_BRIDGE)
    ap.add_argument("--batch-size", type=int, default=1000)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    root = _repo_root()
    db_path = root / DB_RELPATH
    if not db_path.exists():
        print(f"no graph.db at {db_path} — run `code-review-graph build` first", file=sys.stderr)
        return 0  # fail-open

    sha = _commit_sha(args.commit)
    repo = root.name

    with GraphStore(db_path) as store:
        data = export_graph_data(store)

    nodes = [_normalize_node(n) for n in data["nodes"]]
    edges = [_normalize_edge(e) for e in data["edges"]]

    print(f"{repo}@{sha[:8]}: {len(nodes)} nodes, {len(edges)} edges → {args.bridge}")

    if args.dry_run:
        return 0

    try:
        with httpx.Client(base_url=args.bridge, timeout=60) as client:
            for batch in _chunked(nodes, args.batch_size):
                r = client.post("/graph/ingest", json={
                    "repo": repo, "commit_sha": sha, "nodes": batch, "edges": [],
                })
                r.raise_for_status()
            for batch in _chunked(edges, args.batch_size):
                r = client.post("/graph/ingest", json={
                    "repo": repo, "commit_sha": sha, "nodes": [], "edges": batch,
                })
                r.raise_for_status()
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        print(f"bridge unreachable ({e.__class__.__name__}): skipped", file=sys.stderr)
        return 0
    except httpx.HTTPStatusError as e:
        print(f"bridge rejected payload: {e.response.status_code} {e.response.text[:200]}", file=sys.stderr)
        return 1

    print("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
