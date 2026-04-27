#!/usr/bin/env -S uv run --quiet
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""
Replay code-review-graph snapshots across historical commits.

Walks `git rev-list --since=… --until=…`, samples at the chosen interval
(weekly / daily / monthly) or every Nth commit, then for each selected
commit:

  1. git checkout <sha>
  2. code-review-graph build
  3. snapshot_graph.py  → Hindsight (summary)
  4. sync_to_bridge.py  → Postgres via bridge (full graph)

Restores original HEAD on exit (including SIGINT/SIGTERM).

Refuses to run without --interval or --every-nth — walking every commit
in a year-long range is almost never what you want.

Examples
--------
    # 52 weekly snapshots covering the past year
    replay_history.py --since=1y --interval=weekly

    # Every 10th commit since a fixed date
    replay_history.py --since=2026-01-01 --every-nth=10

    # Preview without doing work
    replay_history.py --since=6m --interval=monthly --dry-run

    # Skip the bridge if it's down
    replay_history.py --since=1y --interval=weekly --no-bridge
"""
from __future__ import annotations

import argparse
import datetime as dt
import os
import shutil
import signal
import subprocess
import sys
from pathlib import Path

RWM_HOME = Path(
    os.environ.get(
        "REVIEW_WITH_MEMORY_HOME",
        str(Path.home() / "Coding/Tooling/coding-toolbelt/review-with-memory"),
    )
)
SNAPSHOT = RWM_HOME / "graph-time-machine" / "snapshot_graph.py"
SYNC = RWM_HOME / "graph-time-machine" / "sync_to_bridge.py"


def _run(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    check: bool = True,
    capture: bool = False,
) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd, cwd=cwd, text=True,
        capture_output=capture,
        check=check,
    )


def _repo_root() -> Path:
    out = _run(["git", "rev-parse", "--show-toplevel"], capture=True).stdout
    return Path(out.strip())


def _is_dirty(repo: Path) -> bool:
    out = _run(["git", "status", "--porcelain"], cwd=repo, capture=True).stdout
    return bool(out.strip())


def _current_ref(repo: Path) -> str:
    """Branch name if on a branch, else the bare SHA for detached HEAD."""
    r = _run(
        ["git", "symbolic-ref", "--short", "-q", "HEAD"],
        cwd=repo, check=False, capture=True,
    )
    if r.returncode == 0 and r.stdout.strip():
        return r.stdout.strip()
    return _run(["git", "rev-parse", "HEAD"], cwd=repo, capture=True).stdout.strip()


def _list_commits(repo: Path, since: str | None, until: str | None) -> list[tuple[str, int]]:
    """Returns list of (sha, unix_timestamp), oldest first."""
    cmd = ["git", "rev-list", "--reverse", "--pretty=format:%H %ct"]
    if since:
        cmd.append(f"--since={since}")
    if until:
        cmd.append(f"--until={until}")
    cmd.append("HEAD")
    out = _run(cmd, cwd=repo, capture=True).stdout
    pairs: list[tuple[str, int]] = []
    for line in out.splitlines():
        if not line or line.startswith("commit "):
            continue
        parts = line.strip().split(maxsplit=1)
        if len(parts) == 2:
            try:
                pairs.append((parts[0], int(parts[1])))
            except ValueError:
                continue
    return pairs


def _bucket_key(ts: int, interval: str) -> str:
    d = dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc)
    if interval == "daily":
        return d.strftime("%Y-%m-%d")
    if interval == "weekly":
        y, w, _ = d.isocalendar()
        return f"{y}-W{w:02d}"
    return d.strftime("%Y-%m")  # monthly


def _sample(commits: list[tuple[str, int]], args: argparse.Namespace) -> list[tuple[str, int]]:
    if args.every_nth:
        return commits[:: args.every_nth]
    if args.interval:
        # Latest commit per period — most representative of period-end state.
        buckets: dict[str, tuple[str, int]] = {}
        for sha, ts in commits:
            buckets[_bucket_key(ts, args.interval)] = (sha, ts)
        return sorted(buckets.values(), key=lambda x: x[1])
    return []


def _has_crg() -> bool:
    return shutil.which("code-review-graph") is not None


def _snapshot_one(repo: Path, sha: str, args: argparse.Namespace) -> bool:
    """Returns True on full success, False if any non-fatal step failed."""
    short = sha[:8]
    print(f"  ▸ checkout {short}", flush=True)
    _run(["git", "checkout", "--quiet", sha], cwd=repo)

    ok = True
    if not args.no_build:
        if _has_crg():
            print(f"  ▸ build",  flush=True)
            try:
                _run(["code-review-graph", "build"], cwd=repo)
            except subprocess.CalledProcessError as e:
                print(f"    build failed (rc={e.returncode}) — skipping snapshot+sync", file=sys.stderr)
                return False
        else:
            print("    code-review-graph not on PATH — skipping build (snapshot will reflect last graph)",
                  file=sys.stderr)

    if not args.no_hindsight and SNAPSHOT.exists():
        print(f"  ▸ snapshot → hindsight", flush=True)
        try:
            _run([str(SNAPSHOT), "--commit", sha, "--quiet"], cwd=repo)
        except subprocess.CalledProcessError as e:
            print(f"    snapshot failed (rc={e.returncode})", file=sys.stderr)
            ok = False

    if not args.no_bridge and SYNC.exists():
        print(f"  ▸ sync → bridge", flush=True)
        # sync_to_bridge fails open on bridge unreachable, so don't gate `ok` on it.
        _run([str(SYNC)], cwd=repo, check=False)

    return ok


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--since", help="git --since= expression (1y, 6 months, 2026-01-01)")
    ap.add_argument("--until", default=None, help="git --until= expression; default HEAD")
    sample = ap.add_mutually_exclusive_group()
    sample.add_argument("--interval", choices=["daily", "weekly", "monthly"],
                        help="latest commit per period")
    sample.add_argument("--every-nth", type=int, metavar="N",
                        help="every Nth commit")
    ap.add_argument("--no-build", action="store_true",
                    help="skip code-review-graph build (snapshot reflects pre-checkout graph)")
    ap.add_argument("--no-hindsight", action="store_true", help="skip Hindsight summary retain")
    ap.add_argument("--no-bridge", action="store_true", help="skip bridge ingest")
    ap.add_argument("--max", type=int, default=200,
                    help="hard cap on selected commits (default: 200)")
    ap.add_argument("--dry-run", action="store_true",
                    help="print selected commits and exit; no checkouts")
    ap.add_argument("--allow-dirty", action="store_true",
                    help="proceed even if working tree is dirty (DANGER: changes may be lost)")
    args = ap.parse_args()

    if not args.interval and not args.every_nth:
        print("error: must specify --interval=daily|weekly|monthly OR --every-nth=N",
              file=sys.stderr)
        print("       (refusing to walk every commit in the range)", file=sys.stderr)
        return 2

    repo = _repo_root()
    # Dirty check only matters when we're about to actually checkout commits.
    if not args.dry_run and _is_dirty(repo) and not args.allow_dirty:
        print(f"error: working tree at {repo} is dirty.", file=sys.stderr)
        print("       commit/stash first, or pass --allow-dirty (will not stash for you).",
              file=sys.stderr)
        return 2

    commits = _list_commits(repo, args.since, args.until)
    if not commits:
        print(f"no commits matched (since={args.since!r}, until={args.until!r})")
        return 0

    selected = _sample(commits, args)
    if not selected:
        print("sampling produced 0 commits")
        return 0

    if len(selected) > args.max:
        print(f"error: {len(selected)} commits selected (cap {args.max}). "
              "tighten --since/--interval or raise --max.", file=sys.stderr)
        return 2

    earliest = dt.datetime.fromtimestamp(selected[0][1], tz=dt.timezone.utc)
    latest = dt.datetime.fromtimestamp(selected[-1][1], tz=dt.timezone.utc)
    print(f"selected {len(selected)} of {len(commits)} commits  "
          f"({earliest.date()} … {latest.date()})")

    if args.dry_run:
        for sha, ts in selected:
            d = dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc).isoformat(timespec="seconds")
            print(f"  {sha[:8]}  {d}")
        return 0

    if not _has_crg() and not args.no_build:
        print("warn: code-review-graph not on PATH — graph won't actually rebuild between commits",
              file=sys.stderr)

    original_ref = _current_ref(repo)
    print(f"original ref: {original_ref}")

    restored = False

    def restore(reason: str = "exit") -> None:
        nonlocal restored
        if restored:
            return
        restored = True
        print(f"\nrestoring HEAD to {original_ref} ({reason})")
        _run(["git", "checkout", "--quiet", original_ref], cwd=repo, check=False)
        if _has_crg() and not args.no_build:
            _run(["code-review-graph", "build"], cwd=repo, check=False)

    def _on_signal(signum: int, _frame) -> None:
        restore(f"signal {signum}")
        sys.exit(128 + signum)

    signal.signal(signal.SIGINT, _on_signal)
    signal.signal(signal.SIGTERM, _on_signal)

    failures = 0
    try:
        for i, (sha, ts) in enumerate(selected, start=1):
            d = dt.datetime.fromtimestamp(ts, tz=dt.timezone.utc).date()
            print(f"\n[{i}/{len(selected)}] {sha[:8]}  {d}")
            if not _snapshot_one(repo, sha, args):
                failures += 1
    finally:
        restore()

    print(f"\ndone — {len(selected) - failures}/{len(selected)} successful")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
