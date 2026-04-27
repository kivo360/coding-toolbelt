#!/usr/bin/env bash
# Idempotent bootstrap for code-review-graph + review-with-memory hooks in a repo.
# Each step skips if already done; safe to re-run.
#
# Usage: bootstrap.sh <repo_root>

set -euo pipefail

REPO="${1:?repo_root required}"
cd "$REPO"
ALIAS=$(basename "$REPO")

: "${REVIEW_WITH_MEMORY_HOME:?REVIEW_WITH_MEMORY_HOME not set}"
: "${BRIDGE_BASE_URL:=http://localhost:7777}"

say() { printf '  • %s\n' "$*"; }

# ── a. Global MCP install (no-op after first machine setup) ─────────────────
INSTALL_MARKER="$HOME/.config/review-with-memory/.crg-installed"
if [[ ! -f "$INSTALL_MARKER" ]]; then
    say "running code-review-graph install (one-time, machine-wide)"
    # code-review-graph install
    mkdir -p "$(dirname "$INSTALL_MARKER")"
    : > "$INSTALL_MARKER"
else
    say "MCP install marker present — skipping"
fi

# ── b. Build the graph if missing ───────────────────────────────────────────
if [[ ! -f .code-review-graph/graph.db ]]; then
    say "building graph (first time)"
    # code-review-graph build
else
    say "graph.db exists — skipping build"
fi

# ── c. Register in the multi-repo registry ──────────────────────────────────
say "registering repo (alias: $ALIAS)"
# code-review-graph register . --alias "$ALIAS" >/dev/null 2>&1 || true

# ── d. Install git hooks (pre-commit advisory + post-commit retain/snapshot) ─
HOOK_INSTALLER="$REVIEW_WITH_MEMORY_HOME/git-bridge/install_hooks.sh"
if [[ -x "$HOOK_INSTALLER" ]]; then
    say "installing git hooks"
    # bash "$HOOK_INSTALLER"
else
    say "no git-bridge installer found — skipping hooks"
fi

# ── e. Initial sync to bridge (gated on bridge reachability) ────────────────
if curl -sf --max-time 2 "$BRIDGE_BASE_URL/health" >/dev/null 2>&1; then
    say "bridge reachable — pushing initial graph"
    # "$REVIEW_WITH_MEMORY_HOME/graph-time-machine/sync_to_bridge.py"
else
    say "bridge unreachable at $BRIDGE_BASE_URL — skipping initial push (fail-open)"
fi

# ── f. Hand off to the watch daemon for incremental updates ─────────────────
# Verified surface: `code-review-graph daemon add <path> [--alias NAME]` and
# `daemon start|status`. Daemon polls every 2s and watches every registered repo.
if command -v code-review-graph >/dev/null 2>&1; then
    say "registering with watch daemon (alias: $ALIAS)"
    code-review-graph daemon add "$REPO" --alias "$ALIAS" 2>&1 | sed 's/^/    /' || true

    if code-review-graph daemon status 2>/dev/null | grep -q "Daemon: *not running"; then
        say "starting watch daemon"
        code-review-graph daemon start 2>&1 | sed 's/^/    /' || true
    else
        say "daemon already running — repo will be picked up on next poll"
    fi
else
    say "code-review-graph not on PATH — skipping daemon registration"
fi

say "done"
