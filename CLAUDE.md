# CLAUDE.md

Read `PROJECT_STATUS.md` before doing anything — it holds the phase tracker, fixed decisions, design rules from the owner, and what's next.

Key rules in short:
- JavaScript only, no TypeScript. No `src/`. Alias `@/*` → `./*`.
- Backend is built inside this Next.js app (Route Handlers / Server Actions). No Express, no external API.
- Node.js 24.
- Copy lives in `data/`; pages read data through `services/content.js`.
- No orange/coral, no stickers/tape/hand-drawn lines. Editorial serif accent (`AccentText`) instead.
- Explain each completed phase to the owner in Bangla, then update `PROJECT_STATUS.md`.
- Next.js 16 has breaking changes — check `node_modules/next/dist/docs/` before using an API.
