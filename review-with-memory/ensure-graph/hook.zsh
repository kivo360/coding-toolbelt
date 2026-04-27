# shellcheck shell=bash
# review-with-memory: chpwd hook that prompts to bootstrap CRG on first cd
# into a git repo we haven't seen before.
#
# To enable, add to ~/.zshrc:
#     source "$REVIEW_WITH_MEMORY_HOME/ensure-graph/hook.zsh"

: "${REVIEW_WITH_MEMORY_STATE_DIR:=$HOME/.config/review-with-memory}"
: "${REVIEW_WITH_MEMORY_REPOS_JSON:=$REVIEW_WITH_MEMORY_STATE_DIR/repos.json}"

_rwm_ensure_graph_chpwd() {
    # Bail fast — keep cd latency invisible.

    # 1. In a git repo? (top-level only — submodules + bare repos skipped here.)
    local repo_root
    repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || return 0
    [[ -n "$repo_root" ]] || return 0

    # 2. Already in repos.json? (any status — bootstrapped/deferred/skipped)
    #    Substring grep for the JSON key avoids having to parse JSON in zsh:
    #    keys are absolute paths quoted as `"/abs/path":`, collisions implausible.
    if [[ -f "$REVIEW_WITH_MEMORY_REPOS_JSON" ]] && \
        grep -Fq "\"$repo_root\":" "$REVIEW_WITH_MEMORY_REPOS_JSON" 2>/dev/null; then
        return 0
    fi

    # 3. Already bootstrapped (graph.db exists) but not in JSON?
    #    Likely a pre-existing repo — record as bootstrapped without re-running install.
    if [[ -f "$repo_root/.code-review-graph/graph.db" ]]; then
        : "${REVIEW_WITH_MEMORY_HOME:?REVIEW_WITH_MEMORY_HOME not set — check ~/.zshenv}"
        "$REVIEW_WITH_MEMORY_HOME/ensure-graph/record_existing.py" "$repo_root" 2>/dev/null
        return 0
    fi

    # 4. Hand off to the Python prompt — runs in foreground.
    : "${REVIEW_WITH_MEMORY_HOME:?REVIEW_WITH_MEMORY_HOME not set — check ~/.zshenv}"
    "$REVIEW_WITH_MEMORY_HOME/ensure-graph/prompt_init.py" "$repo_root"
}

# Register zsh's chpwd hook (idempotent).
autoload -Uz add-zsh-hook 2>/dev/null
if typeset -f add-zsh-hook >/dev/null; then
    add-zsh-hook chpwd _rwm_ensure_graph_chpwd
fi

# Run once for the current directory at shell startup.
_rwm_ensure_graph_chpwd
