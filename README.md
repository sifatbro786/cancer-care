# Cancer Care & Medical Services — Web Platform

Next.js 16 (App Router, **JavaScript only**) · Tailwind CSS v4 · Framer Motion · Lucide · Nodemailer
Node.js **24**. The backend is built **inside this Next.js app** (Route Handlers + Server Actions) — no separate Express server.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill SMTP values (without them, dev logs emails instead of sending)
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
  ui/                   Button, Badge, Card, Container, SectionHeading (+Eyebrow), AccentText, SmartImage
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
| `alert-600` #A53B3B | warnings & form errors only | 4.9:1 on white |
| `ink` / `ink-soft` | text | 13.8 / 6.8:1 on paper |
| `paper` #FAF8F4 | page background | — |

Fonts: Onest (headings), Atkinson Hyperlegible Next (body — built for low-vision readers), Newsreader (serif italic accent).

## Deploy

### Vercel
1. Push the repo to GitHub → **vercel.com → Add New Project → Import** the repo (framework is auto-detected).
2. **Settings → General → Node.js Version: 24.x**
3. **Settings → Environment Variables** (Production + Preview):

   | Variable | Example |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://www.yourdomain.com` (no trailing slash — used by sitemap, OG, JSON-LD) |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | `smtp.gmail.com` / `465` / `true` |
   | `SMTP_USER` / `SMTP_PASS` | Gmail address / **App Password** (not the normal password) |
   | `MAIL_FROM` | `Cancer Care <your-account@gmail.com>` |
   | `MAIL_TO` | inbox that receives appointments, messages and orders |
   | `MONGODB_URI` | only needed once the database phase starts |
4. **Deploy**, then **Settings → Domains** → add the domain and set `NEXT_PUBLIC_SITE_URL` to it → **Redeploy** (the URL is baked in at build time).
5. Smoke test: submit the contact form, book an appointment, upload a test prescription → check the `MAIL_TO` inbox.
6. Submit `https://yourdomain/sitemap.xml` in Google Search Console.

> Vercel limits request bodies to 4.5 MB — prescriptions are capped at 4 MB for that reason.
> The rate limiter is in-memory per instance; for a strict global limit add Upstash Redis.

### VPS (later)
`npm ci && npm run build && pm2 start npm --name cancer-care -- start` behind Nginx + Certbot. Same env vars in `.env.production`.

## Placeholders to replace before launch
All marked `// TODO(client)`:
- `data/doctorData.js` — doctor's real name, degrees, BMDC registration number, training institutions, memberships, bio
- `data/siteConfig.js` — official email, Facebook / YouTube URLs, exact map coordinates
- `data/media.js` — replace Unsplash placeholders with the clinic's own photos (doctor portrait, chamber, day care unit)
- `data/testimonialsData.js` — real, consented patient reviews

## Phases
See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** — the single source of truth for what is done and what is next.
