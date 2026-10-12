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
- Medicine orders: no prescription upload. Customers pay with **bKash**, **Nagad** (online, switched on by env keys) or **Pay later** (cash on delivery / at the chamber). See *Online payments* below.
- If the DB is down at submit time, the form degrades to email-only (502 only if email fails too).

### Admin (B2)
```bash
# .env: AUTH_SECRET=<48 random bytes>   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
npm run create-admin -- --email doctor@clinic.com --name "Dr. Farhana Rahman"   # first user → super_admin
npm run create-admin -- --email doctor@clinic.com --reset-password                # forgot / locked out
```
Sign in at `/admin/login`. Sessions last 12 h; changing a password signs out every other device.
Every Server Action / admin Route Handler must call `authorize(PERMISSION)` / `withAdmin(PERMISSION, …)` from `lib/auth/session.js` — the proxy and layouts are not enough on their own.

### Media (B3)
- **Admin → Media**: upload photos (JPG/PNG/WebP/AVIF ≤10 MB → re-encoded to WebP, ≤2400 px, metadata stripped) and assign them to **site image slots** (the keys of `data/media.js`).
- A slot with no upload keeps showing its **Unsplash default** — nothing changes on the site until an admin replaces it. "Use stock photo" switches back.
- Files live in `MEDIA_DIR` (default `./storage/media`), served by `app/media/[...path]/route.js` with a 1-year immutable cache. Not `public/`: `next start` only serves files that existed there at build time.
- **Nginx (VPS)** can serve media directly instead of Node:
  ```nginx
  location /media/ { alias /var/lib/cancer-care/media/; expires 1y; add_header Cache-Control "public, immutable"; }
  ```
- Back up `storage/` (or `MEDIA_DIR`) together with MongoDB.

### Inbox (B4)
`/admin/appointments`, `/admin/orders`, `/admin/messages` — tabs, search (reference / name / mobile), notes, history.
Allowed status changes live in `lib/inbox/workflow.js` (server-enforced). Payment is tracked separately on each order and never blocks a status change (pay-later orders are paid on delivery). Clinic emails include an "Open in admin" link.

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
  payments/             bKash + Nagad adapters, env config (services/payments.js = order ↔ gateway)
services/content.js     Read side (server-only). Pages call ONLY these async functions.
  sources/mock.js       data/*.js source   ─┐ identical return shapes
  sources/db.js         MongoDB source     ─┘
services/submissions.js Write side for the public forms (save → email)
services/auth.js        Login / password checks (lockout, rate limits)
lib/auth/               config (cookie, TTL) · jwt (jose) · rbac (roles → permissions) · session (DB-verified) · password (bcrypt)
proxy.js                /admin guard (optimistic), /api/admin 401, real 404 for unknown shop/blog slugs
lib/media/slots.js      Site image slots: Unsplash defaults + admin overrides (applySlots)
lib/inbox/workflow.js   Allowed status transitions (appointments, orders, messages)
services/admin/inbox.js Inbox DAL — lists, details, conditional status updates, notes
lib/server/media.js     Upload pipeline (magic bytes → sharp → WebP) + MEDIA_DIR storage
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

### Content CMS (B5) · SEO, users, audit (B6)
- Content editors live at `/admin/content/:entity` — one config-driven engine: copy + form structure in `data/admin/cmsData.js`, validation in `lib/validation/cms.js` (zod, authoritative), data access in `services/admin/cms.js`. **Adding a field** = one line in each of the first two (+ the Mongoose model if it's new).
- Saves expire the cache tags of the public pages that show the content; the change appears on the next page load.
- Site settings (contact, hours, socials, footer) override `data/siteConfig.js`; navigation and brand stay in code.
- SEO: `getSeoConfig()` = `data/seoData.js` + Admin → Search & sharing. Empty admin field = code default.
- Users: super admins add users at `/admin/users` (temporary password shown once). Audit log at `/admin/audit` (400-day retention).

### Hardening & operations (B7)
- **Authorization:** every Server Action and admin Route Handler checks its own permission (`authorize` / `withAdmin`); the proxy and layouts are UX only. Roles/permissions: `lib/auth/rbac.js`.
- **Injection:** Mongoose `sanitizeFilter` + `strictQuery` globally; all input is zod-parsed; our own operators use `trusted()`; regex input is escaped. CSV exports neutralise formula cells (`=`, `+`, `-`, `@`).
- **CSRF:** Server Actions are POST + Origin-checked by Next; admin uploads require a same-origin Origin/Sec-Fetch-Site (`isSameOriginStrict`); CSV export refuses cross-site requests; session cookie is `SameSite=Lax`, `__Host-` prefixed in production. Admin pages can't be framed (`frame-ancestors 'none'`).
- **Uploads:** magic-byte checks, re-encoding (images), size caps, UUID names, JSON-only order API (no patient files are uploaded).
- **Errors:** `instrumentation.js` writes one JSON line per server error to stderr (digest, route, message, short stack — no headers/bodies). The digest shown on the error page matches the log line.
- **Indexes:** `npm run seed` runs `createIndexes()` for every model — run it after each deploy that touches models.
- **Smoke test:** `npm run smoke` (or `BASE_URL=https://yourdomain npm run smoke`) — 31 black-box checks: pages, 404s, admin guards, forged cookie, cross-origin + operator-injection rejection, media traversal, security headers. Read-only; safe on production.

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
5. Smoke test: submit the contact form, book an appointment, place a test order → check the `MAIL_TO` inbox.
6. Submit `https://yourdomain/sitemap.xml` in Google Search Console.

> The rate limiter is in-memory per instance; for a strict global limit add Upstash Redis.

### VPS (later)
`npm ci && npm run seed && npm run build && pm2 start npm --name cancer-care -- start` behind Nginx + Certbot, then `BASE_URL=https://yourdomain npm run smoke`. Same env vars in `.env.production`, plus `MONGODB_URI`, `AUTH_SECRET` and the payment keys (below). Then `npm run create-admin` once.

## Admin guide (for clinic staff)

Sign in at **/admin/login**. What each section is for:

| Section | Use it to |
|---|---|
| **Overview** | See what needs attention today: new appointment requests, new medicine orders, unread messages, anything whose email failed. |
| **Appointments** | Call the patient, then move the request **New → Confirmed → Completed** (or Cancelled). Add notes for colleagues. *Download CSV* exports the current tab. |
| **Orders** | Call the customer, then **Processing → Dispatched → Delivered**. The *Payment* panel shows bKash / Nagad payments (marked paid automatically, with the transaction ID); for cash or a manual transfer use **Record a payment → Mark as paid**. *Download CSV* for accounts. |
| **Messages** | Contact-form messages; opening one marks it read. Archive when handled. |
| **Doctor profile / Services / Medicines / Blog / Testimonials / FAQ** | Edit website content. **Save** publishes immediately. ↑ ↓ change the order on the site; *Hide* removes an item from the site without deleting it. |
| **Medicines → Categories**, **Blog → Categories** | Shop / blog filters. A category in use can't be deleted. |
| **Testimonials** | New ones arrive under **Waiting** — only approved ones appear on the site. Use initials, never full names or diagnoses without written consent. |
| **Blog** | *Draft* is private. *Published* with a future date = scheduled. Build the article from blocks (paragraph, heading, list, note box). |
| **Media** | Upload the clinic's photos; replace stock photos via the site image slots. |
| **Site settings** | Phone, WhatsApp, email, address, map, opening hours, social links, footer text, review score. |
| **Search & sharing** | Google title/description and the share image for each page; *Search defaults* for the whole site. Empty = built-in text. |
| **Users** *(super admin)* | Add staff, change roles, disable, reset passwords (a temporary password is shown once — share it privately). |
| **Audit log** *(super admin)* | Who did what and when — sign-ins, edits, status changes, recorded payments, exports. |
| **Account** | Change your own password (signs out your other devices). |

If someone else saves the same item while you're editing, you'll see *"Someone else saved this"* — reload, then make your change again.
Locked out? Another super admin can **Unlock** / **Reset password**, or on the server: `npm run create-admin -- --email you@clinic.com --reset-password`.

## Placeholders to replace before launch
All marked `// TODO(client)`:
- `data/doctorData.js` — doctor's real name, degrees, BMDC registration number, training institutions, memberships, bio
- `data/siteConfig.js` — official email, Facebook / YouTube URLs, exact map coordinates
- `data/media.js` — replace Unsplash placeholders with the clinic's own photos (doctor portrait, chamber, day care unit)
- `data/testimonialsData.js` — real, consented patient reviews

## Phases
See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** — the single source of truth for what is done and what is next.

## Online payments (bKash · Nagad · Pay later)

- **Switching on:** fill the `BKASH_*` / `NAGAD_*` keys in `.env` (see `.env.example`), keep `MONGODB_URI` set, set `NEXT_PUBLIC_SITE_URL` to the public `https://` address, then `npm run build` and restart. A gateway with empty keys is simply not offered; "Pay later" is always there.
- **Sandbox → live:** change only `BKASH_BASE_URL` / `NAGAD_BASE_URL` and the keys.
- **Give the gateways these callback URLs:** `{SITE}/api/payment/bkash/callback` and `{SITE}/api/payment/nagad/callback`. Nagad also whitelists the **server's public IP**.
- **Flow:** order saved + clinic emailed → customer sent to bKash/Nagad → callback → server executes/verifies with the gateway (the query string is never trusted), checks the amount, marks the order paid (idempotent) → clinic gets a "Payment received" email → customer lands on `/payment?ref=…` (status only, no personal data; retry buttons if unpaid).
- **Amount mismatch** → payment status *Check payment* (never auto-accepted). Refunds are done in the merchant panel; cancelling a paid order shows a reminder.
- Nagad needs Node with OpenSSL ≥ 3.2 for RSA PKCS#1 decryption (Node 24 ✓).

