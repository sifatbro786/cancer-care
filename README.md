# Cancer Care & Medical Services — Web Platform

Next.js 16 (App Router, **JavaScript only**) · Tailwind CSS v4 · Framer Motion · Lucide · Nodemailer
Node.js **24**. The backend is built **inside this Next.js app** (Route Handlers + Server Actions) — no separate Express server.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill SMTP values (without them, dev logs emails instead of sending)
npm run seed                 # once MONGODB_URI is set: imports data/*.js into MongoDB + creates indexes
npm run dev
```

### Database (B1)
- **`MONGODB_URI` set** → pages read MongoDB through `services/content.js` (cached with tags, 6 h safety TTL); forms save to the DB **first**, then email.
- **`MONGODB_URI` unset** → static demo mode: content from `data/*.js`, forms are email-only. Same UI, same API responses.
- `npm run seed` inserts only what is missing — safe to re-run, never overwrites admin edits.
  `npm run seed -- --overwrite` resets content to `data/*.js`; `-- --fresh` wipes content collections first (needs `--yes` in production).
  Users, appointments, orders and messages are never touched by the seed.
- `next build` with `MONGODB_URI` set needs the database reachable (pages are pre-rendered from it).
- Prescriptions are written to **private** storage (`PRIVATE_STORAGE_DIR`, default `./storage`, git-ignored) — never under `public/`. Back it up together with the DB.
- If the DB is down at submit time, the form degrades to email-only (502 only if email fails too).

### Admin (B2)
```bash
# .env: AUTH_SECRET=<48 random bytes>   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
npm run create-admin -- --email doctor@clinic.com --name "Dr. Farhana Rahman"   # first user → super_admin
npm run create-admin -- --email doctor@clinic.com --reset-password                # forgot / locked out
```
Sign in at `/admin/login`. Sessions last 12 h; changing a password signs out every other device.
Every Server Action / admin Route Handler must call `authorize(PERMISSION)` / `withAdmin(PERMISSION, …)` from `lib/auth/session.js` — the proxy and layouts are not enough on their own.

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
  db/connect.js         Mongoose connection singleton (+ strictQuery, sanitizeFilter)
  db/models/            One file per model; import from "@/lib/db/models"
  cache/                Cache tags + revalidateContent() for admin writes
  server/storage.js     Private file storage (prescriptions)
services/content.js     Read side (server-only). Pages call ONLY these async functions.
  sources/mock.js       data/*.js source   ─┐ identical return shapes
  sources/db.js         MongoDB source     ─┘
services/submissions.js Write side for the public forms (save → email)
services/auth.js        Login / password checks (lockout, rate limits)
lib/auth/               config (cookie, TTL) · jwt (jose) · rbac (roles → permissions) · session (DB-verified) · password (bcrypt)
proxy.js                /admin guard (optimistic), /api/admin 401, real 404 for unknown shop/blog slugs
app/(admin)/            /admin/login + (panel)/ (layout = requireUser) · _actions/ = Server Actions
scripts/seed.mjs        npm run seed (register-alias.mjs resolves "@/" for plain Node)
scripts/create-admin.mjs npm run create-admin
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
   | `MONGODB_URI` | leave unset on Vercel for the static demo; set on the VPS |
   | `AUTH_SECRET` | required for `/admin` (≥32 random chars) |
4. **Deploy**, then **Settings → Domains** → add the domain and set `NEXT_PUBLIC_SITE_URL` to it → **Redeploy** (the URL is baked in at build time).
5. Smoke test: submit the contact form, book an appointment, upload a test prescription → check the `MAIL_TO` inbox.
6. Submit `https://yourdomain/sitemap.xml` in Google Search Console.

> Vercel limits request bodies to 4.5 MB — prescriptions are capped at 4 MB for that reason.
> The rate limiter is in-memory per instance; for a strict global limit add Upstash Redis.

### VPS (later)
`npm ci && npm run seed && npm run build && pm2 start npm --name cancer-care -- start` behind Nginx + Certbot. Same env vars in `.env.production`, plus `MONGODB_URI`, `AUTH_SECRET` and an absolute `PRIVATE_STORAGE_DIR`. Then `npm run create-admin` once.

## Placeholders to replace before launch
All marked `// TODO(client)`:
- `data/doctorData.js` — doctor's real name, degrees, BMDC registration number, training institutions, memberships, bio
- `data/siteConfig.js` — official email, Facebook / YouTube URLs, exact map coordinates
- `data/media.js` — replace Unsplash placeholders with the clinic's own photos (doctor portrait, chamber, day care unit)
- `data/testimonialsData.js` — real, consented patient reviews

## Phases
See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** — the single source of truth for what is done and what is next.
