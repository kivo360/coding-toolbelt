/**
 * opencode-skill-tap
 *
 * On every user message, runs `toolbelt skills suggest --json` against the
 * prompt content. If high-confidence cold/staging skills match, injects a
 * compact suggestion block into the system prompt so the agent can either
 * surface them to the user or self-install.
 *
 * Configuration via env vars:
 *   TOOLBELT_BIN              Override path (default: "toolbelt", from $PATH)
 *   SKILL_TAP_DISABLED        "true" to disable
 *   SKILL_TAP_MIN_CONFIDENCE  Default 0.5
 *   SKILL_TAP_LIMIT           Default 3
 *   SKILL_TAP_TIERS           Default "B,C"
 */

import type { PluginInput } from "@opencode-ai/plugin"

interface SuggestResult {
  suggestions: Array<{
    name: string
    tier: string
    description: string
    confidence: number
    installed: boolean
    installCommand: string | null
  }>
}

const TOOLBELT_BIN = process.env.TOOLBELT_BIN ?? "toolbelt"
const DISABLED = process.env.SKILL_TAP_DISABLED === "true"
const MIN_CONF = process.env.SKILL_TAP_MIN_CONFIDENCE ?? "0.5"
const LIMIT = process.env.SKILL_TAP_LIMIT ?? "3"
const TIERS = process.env.SKILL_TAP_TIERS ?? "B,C"

export const SkillTapPlugin = async ({ $, client }: PluginInput) => {
  const log = (level: "debug" | "info" | "warn" | "error", message: string) =>
    client.app.log({ body: { service: "skill-tap", level, message } }).catch(() => {})

  let lastSuggestionBlock: string | null = null

  return {
    /**
     * On every user chat message, parse the text and call `toolbelt skills suggest`.
     * Stash the result so the system-prompt transform hook can inject it.
     */
    "chat.message": async (_input, output) => {
      if (DISABLED) return
      const parts = output.parts ?? []
      const userText = parts
        .map((p: { type: string; text?: string }) => (p.type === "text" ? p.text ?? "" : ""))
        .join(" ")
        .trim()
      if (userText.length < 20) {
        lastSuggestionBlock = null
        return
      }

      try {
        const result = await $`${TOOLBELT_BIN} skills suggest ${userText} --json --tiers ${TIERS} --min-confidence ${MIN_CONF} --limit ${LIMIT}`.quiet().text()
        const parsed = JSON.parse(result) as SuggestResult
        if (!parsed.suggestions || parsed.suggestions.length === 0) {
          lastSuggestionBlock = null
          return
        }
        lastSuggestionBlock = renderBlock(parsed.suggestions)
        log("info", `[skill-tap] ${parsed.suggestions.length} suggestions for prompt`)
      } catch (err) {
        log("debug", `[skill-tap] suggest failed: ${err instanceof Error ? err.message : String(err)}`)
        lastSuggestionBlock = null
      }
    },

    /**
     * Inject the suggestion block into the system prompt for this turn.
     */
    "experimental.chat.system.transform": async (_input, output) => {
      if (DISABLED || !lastSuggestionBlock) return
      output.system.push(lastSuggestionBlock)
      lastSuggestionBlock = null
    },
  }
}

function renderBlock(suggestions: SuggestResult["suggestions"]): string {
  const lines = ["", "## Suggested skills for this prompt", ""]
  for (const s of suggestions) {
    const conf = Math.round(s.confidence * 100)
    if (s.installed) {
      lines.push(`- **${s.name}** [${s.tier}-tier, active, ${conf}% match] — ${truncate(s.description, 100)}`)
    } else {
      lines.push(`- **${s.name}** [${s.tier}-tier, cold, ${conf}% match] — ${truncate(s.description, 100)}`)
      lines.push(`  - install: \`${s.installCommand ?? "toolbelt skills install " + s.name}\``)
    }
  }
  lines.push("")
  lines.push(
    "_(These are suggestions from the local skill index. If a cold skill looks useful, install it before proceeding.)_"
  )
  return lines.join("\n")
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

export default SkillTapPlugin
