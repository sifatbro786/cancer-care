# Cancer Care & Medical Services — Project Status

> **For any new chat / new developer: read this file first.**
> Update the checklist and the "Last session" log at the end of every phase.

_Last updated: 2026-10-05 · Current phase: **B1 (DB foundation) done → B2 Auth & RBAC next** (see 7-step plan below)_

---

## Phase tracker

| # | Phase | Status |
|---|---|---|
| 1 | Foundation & architecture | ✅ Done |
| 2 | Homepage | ✅ Done (redesigned in Phase 3 — see design rules) |
| 3 | Content pages: About, Services, Patient Guide, Blog list + `[slug]` | ✅ Done |
| 4 | Interactive pages + email: Appointment, Contact, Shop + `[slug]` + Prescription upload, Nodemailer | ✅ Done |
| 5 | Production polish: sitemap/robots, OG image, a11y audit, Lighthouse 90+, loading/error states, Vercel deploy | ✅ Done |
| — | Backend: MongoDB, Admin + Super Admin dashboard, order & prescription management, SEO admin | 🔄 In progress (B1 ✅) |

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

## Backend phase — 7-step plan (approved outline)

Everything stays inside this Next.js app (Route Handlers + Server Actions + MongoDB via `MONGODB_URI`). No Express. **No VPS deploy guide** — the owner deploys himself.

| Step | Scope | Status |
|---|---|---|
| B1 | **DB foundation** — Mongoose connection singleton; models: User, SiteSettings, Doctor, Service, ProductCategory, Product, BlogPost, Testimonial, FAQ, PageSEO, Appointment, Order, Message, Media; `npm run seed` imports `data/*.js`; `services/content.js` bodies → DB queries (signatures unchanged); cache tags + `revalidateTag`; form APIs save to DB first, then email | ✅ |
| B2 | **Auth & RBAC** — `/admin/login`, bcryptjs hashes, JWT (`jose`) in httpOnly secure cookie; roles `super_admin` / `admin`; `proxy.js` guard **plus** role check inside every Server Action / API; login rate limit + temporary lockout; logout, change password; script to create the first super admin | ⬜ |
| B3 | **Media & uploads** — public images → `/uploads` (sharp resize → webp), unlink old file on replace/delete; prescriptions stored **private** (outside public, served only to logged-in admins); media library; Unsplash placeholders replaced by uploaded images | ⬜ |
| B4 | **Admin shell & inbox** — `app/(admin)/` route group with its own layout; overview counts; Appointments (New → Confirmed → Completed/Cancelled + notes); Orders with prescription verify/reject → Dispatched → Delivered; Messages (read/unread); server-side pagination & filters | ⬜ |
| B5 | **Content CMS** — CRUD for doctor profile, site settings (phone, hours, socials, map), services, products & categories, blog (block editor, draft/publish), testimonials (approve), FAQ (ordering); zod on every form; save → revalidate affected public pages | ⬜ |
| B6 | **SEO manager & Super Admin** — per-page title/description/OG from admin, per-post/product SEO; admin user management (create/disable/reset); audit log | ⬜ |
| B7 | **Hardening & handover** — authz review of every action, NoSQL-injection & upload safety, CSRF for admin, Mongo indexes, error logging, CSV export (orders/appointments), end-to-end flow test, admin usage notes in README | ⬜ |

New packages: `mongoose` ✅ (9.x) · planned: `jose`, `bcryptjs` (sharp already ships with Next).

### B1 — what was built
- **Mode switch by env:** `MONGODB_URI` set → MongoDB; unset → `data/*.js` (static demo / CI). Same shapes, same API contract.
- `lib/db/connect.js` — singleton on `globalThis`, `bufferCommands:false` (fail fast), 8 s server selection, pool 10, `autoIndex` off in prod. Global `strictQuery` + **`sanitizeFilter`** (operator-injection guard; our own operators use `mongoose.trusted()`).
- `lib/db/models/` — 15 models: User, SiteSettings (singleton, also holds careJourney + ratingSummary), Doctor, Service, ProductCategory, Product (+`sku`), BlogCategory, BlogPost (draft/published, scheduled via `publishedAt`), Testimonial (`approved`), Faq, PageSeo, Media, Appointment, Order, Message. Indexes for every admin list/queue planned in B4.
- `services/content.js` → `services/sources/{mock,db}.js`, wrapped in `unstable_cache` with tags (`lib/cache/tags.js`) + 6 h TTL; `revalidateContent(TAGS.x)` (`lib/cache/revalidate.js`, `revalidateTag(tag,"max")`) ready for B5. New getters `getSiteSettings()` / `getPageSeo(key)` exist but are **not wired** yet (siteConfig is used by client components → B5; seo → B6).
- `services/submissions.js` — save-then-email; unique reference with retry on collision; `notification.clinicEmailed` flag. **DB down → degrade to email-only**, 502 only if both fail.
- Orders: price/Rx/stock come from the DB (never the client), line item snapshot (`unitPrice`, `name`), integer `subtotal`. Out-of-stock / unknown / inactive product → 422.
- Prescriptions saved to **private storage** (`lib/server/storage.js`, `PRIVATE_STORAGE_DIR`, default `./storage`, git-ignored): UUID filename, `0600`, sha256 stored on the order; file removed if the order save fails. (Admin download route → B3/B4.)
- Validation: service/product no longer `z.enum` of the static list — format-checked slug in the shared schema, existence checked server-side against the live catalogue. `requiresPrescription(product)` now takes the product object.
- `/shop/[slug]` & `/blog/[slug]`: `dynamicParams = true` so admin-added items render on demand (ISR). Sitemap revalidates hourly.
- `npm run seed` (`scripts/seed.mjs` + `scripts/register-alias.mjs`): validates every doc, upserts by natural key, default insert-missing, `--overwrite`, `--fresh` (prod needs `--yes`), then `createIndexes()`.
- Verified: eslint 0 · build in both modes · DB-vs-mock parity on all 16 getters · E2E: appointment/contact/order saved, DB price snapshot, private file `0600`, spoofed file / unknown & out-of-stock product / cross-origin / `{"$gt":""}` payloads rejected, new DB product renders without rebuild, DB outage → fast fail / email-only fallback, pages keep serving from cache.

### Known trade-offs (B1)
- Unknown blog/product slugs now return a **soft 404** (HTTP 200 + `noindex`) because the `(public)/loading.jsx` boundary streams first (documented Next 16 behaviour). Hard 404 = cheap slug check in `proxy.js` → do it in **B2** when proxy.js is created.
- `next build` with `MONGODB_URI` set requires the DB to be reachable (intended — fail loud).
- No slot capacity / double-booking rule yet — decide with the client in B4 (one patient per slot? per-slot cap?).

**Decided by the owner:**
- ODM: **Mongoose**
- Roles: **only `super_admin` and `admin`** — no pharmacist role. Admins handle orders/prescriptions; super_admin additionally manages admin users and audit log.

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

## Backend-phase notes
- ✅ (B1) Appointments/orders/messages persisted before emailing; response contract unchanged.
- ✅ (B1) Prescription buffers saved to private storage (not `/public/uploads` — patient data).
- Replace the in-memory rate limiter store with Redis if running more than one instance.

## Last session log
- **Phase 1:** structure, tokens, data layer, layout shell, SEO base.
- **Phase 2:** homepage (11 sections).
- **Phase 3:** removed coral/tape/hand-drawn styles site-wide; serif accent system; Doctor section rebuilt as editorial credentials table; added PageHeader (breadcrumb + JSON-LD), CtaBand, About, Services (anchored sections), Patient Guide (TOC, urgent signs, side-effect table, print-friendly), Blog list (client filter) and Blog `[slug]` (SSG, MedicalWebPage JSON-LD).
- **Phase 4:** eyebrow rule removed site-wide; Appointment / Contact / Shop / Product pages; 3 Route Handlers with Nodemailer; shared zod validation; tested end-to-end against a local SMTP sink (valid, invalid, cross-origin, honeypot, spoofed file, rate limit).
- **Phase 5:** SEO files, OG image, icon/manifest, loading/error boundaries, click-to-load map, hydration + font-warning fixes, axe 0 violations, Lighthouse ~88–92 mobile perf, deploy guide.
- **B1:** Mongoose + 15 models, seed script, content service → DB with cache tags, forms save-then-email, private prescription storage, dynamic slugs. Next: **B2 Auth & RBAC** (+ hard 404 in proxy.js).
