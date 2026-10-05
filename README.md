# Cancer Care & Medical Services — Web Platform

Next.js 16 (App Router, **JavaScript only**) · Tailwind CSS v4 · Framer Motion · Lucide · Nodemailer
Node.js **24**. The backend is built **inside this Next.js app** (Route Handlers + Server Actions) — no separate Express server.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill SMTP values before Phase 4
npm run dev
```

## Architecture

```
app/
  layout.jsx            Root: fonts, global metadata, clinic + physician JSON-LD, MotionProvider
  not-found.jsx         404 (mounts the site shell itself)
  globals.css           Design tokens (@theme) + base styles
  (public)/             Public site route group — own layout (TopBar, Navbar, Footer)
    page.jsx            Home
components/
  layout/               TopBar, Navbar (desktop dropdown), MobileNav (a11y drawer), Footer
  ui/                   Button, Badge, Card, Container, SectionHeading, SmartImage, HandUnderline
  brand/ icons/ seo/ providers/
data/                   Mock content — the ONLY place copy & content lives
lib/                    utils (cn, formatBDT, readingTime…), seo builders, icon map
services/content.js     Data-access layer (server-only). Pages call these async functions.
                        Backend phase swaps their bodies for direct DB queries — UI stays untouched.
```

### Rules
- No TypeScript. Imports use the `@/` alias.
- No hardcoded copy in components — import from `data/` (or via `services/`).
- Data stores **icon keys** (`"syringe"`) not components → JSON-serialisable for the future API.
- Money is integer BDT; format with `formatBDT()`.
- All images go through `<SmartImage>` (auto-fallback to `/images/fallback-care.svg`).
- Animations use `m.*` from `framer-motion` (LazyMotion, strict) — never `motion.*`.

### Design tokens (see `app/globals.css`)
| Token | Use | Contrast |
|---|---|---|
| `brand-600` #0E6E66 | primary actions, highlights | 6.1:1 on white |
| `coral-600` #B9553B | urgency / emergency only | 4.75:1 on white |
| `ink` / `ink-soft` | text | 13.8 / 6.8:1 on paper |
| `paper` #FAF8F4 | page background | — |

Fonts: Onest (headings), Atkinson Hyperlegible Next (body — built for low-vision readers), Caveat (handwritten accents).

## Phases
1. Foundation & architecture ✅
2. Homepage
3. Content pages (About, Services, Patient Guide, Blog)
4. Appointment, Contact, Shop + prescription upload, Nodemailer
5. SEO, a11y, performance, Vercel deploy
