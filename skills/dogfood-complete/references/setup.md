# Setup & Project Detection

1. [Installation](#installation)
2. [Browser Engine Setup](#browser-engine-setup)
3. [Output Directory Structure](#output-directory-structure)
4. [Project Detection Checklist](#project-detection-checklist)
5. [Starting a Session](#starting-a-session)
6. [Connection Verification](#connection-verification)
7. [Related References](#related-references)

## Installation

The `agent-browser` is a Rust-based CLI. Install it using your preferred package manager:

```bash
# Via npm
npm install -g agent-browser

# Via brew (if available)
brew install agent-browser

# Via cargo
cargo install agent-browser
```

## Browser Engine Setup

After installation, you must download the necessary browser engines:

```bash
agent-browser install chrome
```

## Output Directory Structure

Before starting an exploration session, create the standard output directories for evidence:

```bash
mkdir -p dogfood-output/screenshots
mkdir -p dogfood-output/videos
mkdir -p dogfood-output/logs
```

## Project Detection Checklist

Verify the project type to understand how to start the dev server and where to navigate. Look for these markers:

| Marker File | Framework | Dev Command |
|-------------|-----------|-------------|
| `next.config.js` | Next.js | `npm run dev` |
| `vite.config.ts` | Vite/React/Vue | `npm run dev` |
| `nuxt.config.ts` | Nuxt.js | `npm run dev` |
| `svelte.config.js` | SvelteKit | `npm run dev` |
| `remix.config.js` | Remix | `npm run dev` |

Once the server is running (usually on `http://localhost:3000`), proceed to session initialization.

## Starting a Session

Start a named session to persist state across commands:

```bash
# Open the initial URL
agent-browser --session dogfood open http://localhost:3000

# Wait for the network to settle
agent-browser --session dogfood wait --load networkidle
```

## Connection Verification

Verify the connection and see the interactive element tree:

```bash
# Capture an interactive snapshot
agent-browser --session dogfood snapshot -i

# Take an annotated screenshot to verify visibility
agent-browser --session dogfood screenshot --annotate dogfood-output/screenshots/verify.png
```

## Related References
- [Exploration Protocol](exploration-protocol.md)
- [Video Recording for Evidence](video-evidence.md)
