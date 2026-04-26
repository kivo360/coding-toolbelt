#!/usr/bin/env bun
import { runReindex } from "./commands/skills/reindex";
import { runList } from "./commands/skills/list";
import { runDoctor } from "./commands/skills/doctor";
import { runFind } from "./commands/skills/find";
import { runSuggest } from "./commands/skills/suggest";
import { runTier } from "./commands/skills/tier";
import { runInstall, runPromote, runDemote } from "./commands/skills/move";
import { runEmbed } from "./commands/skills/embed";
import { runServe } from "./commands/skills/serve";
import { c, print, printErr } from "./lib/output";

const VERSION = "0.1.0";

const HELP = `
${c.bold("toolbelt")} ${c.dim("v" + VERSION)} — Coding Toolbelt CLI

${c.bold("Usage:")} toolbelt <command> <subcommand> [args]

${c.bold("Skills:")}
  toolbelt skills list                          Show all skills grouped by tier
  toolbelt skills list --tier B                 Filter by tier
  toolbelt skills list --rich                   Only skills with scripts/templates/refs
  toolbelt skills list --protected              Only protected skills
  toolbelt skills list --json                   Machine-readable output

  toolbelt skills find <query>                  Search local index
  toolbelt skills find <query> --json           JSON output for hooks
  toolbelt skills find <query> --remote         Mention bunx skills find as fallback

  toolbelt skills suggest "<prompt>"            Top matches for a free-text prompt
  toolbelt skills suggest "<prompt>" --json     For UserPromptSubmit hook integration
  toolbelt skills suggest "<prompt>" --tiers B,C  Limit to specific tiers
  toolbelt skills suggest "<prompt>" --deep     Run embedding fallback (Layer 1)
  toolbelt skills suggest "<prompt>" --fast     Skip daemon + embeddings (hook-safe)
  toolbelt skills suggest "<prompt>" --explain  Show why each match scored

  toolbelt skills embed                         Build/refresh embeddings index (~22 MB model on first run)
  toolbelt skills embed --rebuild               Force re-embed all skills
  toolbelt skills embed --status                Show embeddings index info

  toolbelt skills serve                         Run embedding daemon (Layer 1 hot path)
  toolbelt skills serve --port 9988             Custom port
  toolbelt skills serve --status                Health check
  toolbelt skills serve --stop                  Send SIGTERM to running daemon

  toolbelt skills tier <name>                   Show a skill's tier
  toolbelt skills tier <name> S|A|B|C           Set a skill's tier (in index only)

  toolbelt skills install <name>                Move from cold/staging → active
  toolbelt skills promote <name>                Move toward active
  toolbelt skills demote <name>                 Move toward cold (--force for protected)

  toolbelt skills reindex                       Rebuild ~/.agents/skills-index.json
  toolbelt skills doctor                        Find broken symlinks, stray caches
  toolbelt skills doctor --fix                  Auto-fix safe issues

${c.bold("Other:")}
  toolbelt --help, -h                           This help
  toolbelt --version, -v                        Print version
`;

async function main(argv: string[]): Promise<number> {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    print(HELP);
    return 0;
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    print(VERSION);
    return 0;
  }

  const [command, subcommand, ...rest] = argv;

  if (command !== "skills") {
    printErr(c.red(`Unknown command: ${command}`));
    printErr(c.dim("Run `toolbelt --help` for usage."));
    return 1;
  }

  switch (subcommand) {
    case "list":
    case "ls":
      return runList(rest);
    case "find":
    case "search":
      return runFind(rest);
    case "suggest":
      return runSuggest(rest);
    case "tier":
      return runTier(rest);
    case "install":
    case "add":
      return runInstall(rest);
    case "promote":
      return runPromote(rest);
    case "demote":
      return runDemote(rest);
    case "reindex":
      return runReindex(rest);
    case "doctor":
      return runDoctor(rest);
    case "embed":
      return runEmbed(rest);
    case "serve":
      return runServe(rest);
    default:
      printErr(c.red(`Unknown subcommand: skills ${subcommand ?? "(none)"}`));
      printErr(c.dim("Run `toolbelt --help` for usage."));
      return 1;
  }
}

const argv = process.argv.slice(2);
main(argv)
  .then((code) => process.exit(code))
  .catch((err) => {
    printErr(c.red("Unhandled error: ") + (err instanceof Error ? err.stack : String(err)));
    process.exit(1);
  });
