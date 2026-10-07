# CLAUDE.md

Read `PROJECT_STATUS.md` before doing anything — it holds the phase tracker, fixed decisions, design rules from the owner, and what's next.

Key rules in short:
- JavaScript only, no TypeScript. No `src/`. Alias `@/*` → `./*`.
- Backend is built inside this Next.js app (Route Handlers / Server Actions). No Express, no external API.
- Node.js 24.
- Copy lives in `data/`; pages read data through `services/content.js`.
- No orange/coral, no stickers/tape/hand-drawn lines, no serif italic accents. Two-tone headlines (`AccentText`) instead.
- Explain each completed phase to the owner in Bangla, then update `PROJECT_STATUS.md`.
- Next.js 16 has breaking changes — check `node_modules/next/dist/docs/` before using an API.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
