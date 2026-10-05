# Cancer Care & Medical Services — Project Status

> **For any new chat / new developer: read this file first.**
> Update the checklist and the "Last session" log at the end of every phase.

_Last updated: 2026-10-05 · Current phase: **Phase 5 done → Backend phase next**_

---

## Phase tracker

| # | Phase | Status |
|---|---|---|
| 1 | Foundation & architecture | ✅ Done |
| 2 | Homepage | ✅ Done (redesigned in Phase 3 — see design rules) |
| 3 | Content pages: About, Services, Patient Guide, Blog list + `[slug]` | ✅ Done |
| 4 | Interactive pages + email: Appointment, Contact, Shop + `[slug]` + Prescription upload, Nodemailer | ✅ Done |
| 5 | Production polish: sitemap/robots, OG image, a11y audit, Lighthouse 90+, loading/error states, Vercel deploy | ✅ Done |
| — | Backend (next): MongoDB, Admin + Super Admin dashboard, order & prescription management, SEO admin | ⏳ Next |

### Phase 4 — what was built
- Pages: `/appointment` (type → day/slot → details, `?type=online` / `?service=` prefill), `/contact` (channels, form, map, hours), `/shop` (search, category filter, `?upload=1` opens upload), `/shop/[slug]` (SSG, Product JSON-LD)
- API (Route Handlers): `POST /api/appointment`, `POST /api/contact` (JSON), `POST /api/order` (multipart + prescription file)
- Security pipeline on every endpoint: same-origin check → in-memory rate limit (per IP) → body size cap → honeypot (`company`) → **shared zod schema** (`lib/validation/*`, same rules client & server) → Nodemailer
- Prescription files: JPG/PNG/WEBP/PDF ≤ 4 MB, verified by **magic bytes** server-side, emailed as attachment
- Appointment slot is re-validated on the server against the live schedule (`lib/schedule.js`, Asia/Dhaka)
- Emails: HTML-escaped table templates (`lib/server/emailTemplates.js`); patient gets a copy when they give an email
- Dev without SMTP → Nodemailer `jsonTransport` (logs instead of sending). Production without SMTP → API returns 502.
- `components/ui/Modal.jsx` uses native `<dialog>` (focus trap/Escape for free); `components/ui/Field.jsx` = accessible inputs

### Phase 5 — what was done
- `app/sitemap.js`, `app/robots.js` (blocks `/api/`), `app/manifest.js`, `app/icon.svg` (replaces Next's default favicon), `app/opengraph-image.jsx` (built at build time; blog/product pages use their cover)
- `app/(public)/loading.jsx`, `app/(public)/error.jsx`, `app/global-error.jsx` (copy in `data/statusData.js`)
- Contact map is click-to-load (`components/contact/MapEmbed.jsx`)
- Hydration safety: `suppressHydrationWarning` on `<body>` (ColorZilla etc.); appointment day/slot picker renders after hydration (`lib/hooks/useHydrated.js`) because the page is prerendered at build time; money/date formatting no longer depends on Intl/ICU (`lib/utils.js`)
- Atkinson font fallback warning fixed (`adjustFontFallback: false` + Verdana/Arial fallback)
- next/image `fill` inside sticky parent fixed on /services
- **axe-core (WCAG 2.1 AA):** 0 violations on all 10 pages at 1440px and 390px (fixed 2 contrast issues, 1 heading-order)
- **Lighthouse (mobile, sandbox):** Home 90/100/96/100 · Shop 92/98 (heading-order since fixed)/96/100 · Appointment 88/100/100/100 · Blog post 90/100/96/100 (perf/a11y/best-practices/SEO). Best-practices <100 only because Unsplash images were blocked in the test sandbox. Re-run on the real domain.
- README: Vercel deploy steps + env table + launch placeholder list
- Not done on purpose: nonce-based CSP — it forces every page to dynamic rendering (no static HTML/CDN cache). Revisit with the admin dashboard.

---

## Fixed decisions (do not change without the client/owner)
- **Stack:** Next.js 16 App Router, **JavaScript only (no TypeScript)**, Tailwind v4, Framer Motion (`LazyMotion` + `m.*` only), Lucide (v1 — no brand icons; see `components/icons/BrandIcons.jsx`), Nodemailer.
- **Node.js 24** (`engines`, `.nvmrc`).
- **No `src/` folder** — `app/`, `components/`, `data/`, `lib/`, `services/` live at the root. Alias `@/*` → `./*`.
- **Backend = inside this Next.js app** (Route Handlers + Server Actions). **No separate Express server, no external API calls.** When the DB arrives, only the bodies in `services/content.js` change (direct DB queries); UI stays untouched.
- All copy/content lives in `data/*.js`. Components never hardcode copy.
- Data stores icon **keys** (`"syringe"`), rendered via `IconByKey` from `lib/icons.jsx`.
- Money = integer BDT, format with `formatBDT()`.
- Images: always `SmartImage` (auto-fallback). Unsplash IDs must be verified to exist before use.

## Design rules (owner feedback — important)
- ❌ **No orange / coral** anywhere. Palette = teal (`brand`), sage, warm slate (`ink`), paper. `alert` red only for warnings/errors.
- ❌ No tape stickers, no hand-drawn underlines, no handwritten (Caveat) font, no chart-grid backgrounds, no ECG/pulse-line decorations, no ✦ sparkles, no decorative blobs.
- ✅ Editorial, human-made feel: **serif italic accent word** (Newsreader) via `AccentText`, hairline rules, typographic tables (`<dl>`), real photography, calm spacing.
- Eyebrow = plain uppercase label, **no rule/icon before it** (`Eyebrow` in `SectionHeading.jsx`).
- Follow the CliniCore reference layout structure, not its colours.
- Fonts: Onest (headings), Atkinson Hyperlegible Next (body), Newsreader (serif accent).

## Placeholders awaiting the client (`// TODO(client)`)
Doctor's real name, degrees, BMDC number, training places, official email, Facebook/YouTube URLs, exact map pin, real clinic photos.

## Verification routine (each phase)
`npx eslint .` → `next build` → screenshot 1440px + 390px → deliver to the project folder.

---

## Backend-phase notes (from Phase 4)
- `.env` already defines `MONGODB_URI`. Persist appointments/orders/messages in the DB inside the same Route Handlers, before emailing — response contract stays `{ ok, reference }` / `{ ok:false, message, fieldErrors }`.
- Save prescription buffers to `/uploads` on the VPS instead of only attaching them.
- Replace the in-memory rate limiter store with Redis if running more than one instance.

## Last session log
- **Phase 1:** structure, tokens, data layer, layout shell, SEO base.
- **Phase 2:** homepage (11 sections).
- **Phase 3:** removed coral/tape/hand-drawn styles site-wide; serif accent system; Doctor section rebuilt as editorial credentials table; added PageHeader (breadcrumb + JSON-LD), CtaBand, About, Services (anchored sections), Patient Guide (TOC, urgent signs, side-effect table, print-friendly), Blog list (client filter) and Blog `[slug]` (SSG, MedicalWebPage JSON-LD).
- **Phase 4:** eyebrow rule removed site-wide; Appointment / Contact / Shop / Product pages; 3 Route Handlers with Nodemailer; shared zod validation; tested end-to-end against a local SMTP sink (valid, invalid, cross-origin, honeypot, spoofed file, rate limit).
- **Phase 5:** SEO files, OG image, icon/manifest, loading/error boundaries, click-to-load map, hydration + font-warning fixes, axe 0 violations, Lighthouse ~88–92 mobile perf, deploy guide.
