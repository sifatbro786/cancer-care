# Cancer Care & Medical Services — Project Status

> **For any new chat / new developer: read this file first.**
> Update the checklist and the "Last session" log at the end of every phase.

_Last updated: 2026-10-06 · Current phase: **B1–B5 done → B6 SEO manager & Super Admin next** (see 7-step plan below)_

---

## Phase tracker

| # | Phase | Status |
|---|---|---|
| 1 | Foundation & architecture | ✅ Done |
| 2 | Homepage | ✅ Done (redesigned in Phase 3 — see design rules) |
| 3 | Content pages: About, Services, Patient Guide, Blog list + `[slug]` | ✅ Done |
| 4 | Interactive pages + email: Appointment, Contact, Shop + `[slug]` + Prescription upload, Nodemailer | ✅ Done |
| 5 | Production polish: sitemap/robots, OG image, a11y audit, Lighthouse 90+, loading/error states, Vercel deploy | ✅ Done |
| — | Backend: MongoDB, Admin + Super Admin dashboard, order & prescription management, SEO admin | 🔄 In progress (B1 ✅ B2 ✅ B3 ✅ B4 ✅ B5 ✅) |

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
| B2 | **Auth & RBAC** — `/admin/login`, bcryptjs hashes, JWT (`jose`) in httpOnly secure cookie; roles `super_admin` / `admin`; `proxy.js` guard **plus** role check inside every Server Action / API; login rate limit + temporary lockout; logout, change password; script to create the first super admin | ✅ |
| B3 | **Media & uploads** — public images → `/uploads` (sharp resize → webp), unlink old file on replace/delete; prescriptions stored **private** (outside public, served only to logged-in admins); media library; Unsplash placeholders replaced by uploaded images | ✅ |
| B4 | **Admin shell & inbox** — `app/(admin)/` route group with its own layout; overview counts; Appointments (New → Confirmed → Completed/Cancelled + notes); Orders with prescription verify/reject → Dispatched → Delivered; Messages (read/unread); server-side pagination & filters | ✅ |
| B5 | **Content CMS** — CRUD for doctor profile, site settings (phone, hours, socials, map), services, products & categories, blog (block editor, draft/publish), testimonials (approve), FAQ (ordering); zod on every form; save → revalidate affected public pages | ✅ |
| B6 | **SEO manager & Super Admin** — per-page title/description/OG from admin, per-post/product SEO; admin user management (create/disable/reset); audit log | ⬜ |
| B7 | **Hardening & handover** — authz review of every action, NoSQL-injection & upload safety, CSRF for admin, Mongo indexes, error logging, CSV export (orders/appointments), end-to-end flow test, admin usage notes in README | ⬜ |

New packages: `mongoose` 9 ✅ · `jose` 6 ✅ · `bcryptjs` 3 ✅ · `sharp` 0.35 ✅ (now a direct dependency).

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
- ~~Soft 404 for unknown slugs~~ → fixed in B2 (proxy.js returns a real 404).

### B2 — what was built
- **Session:** HS256 JWT (`jose`) in an httpOnly cookie — `__Host-cc_admin` in production (Secure, Path=/, host-bound), `cc_admin` in dev; `SameSite=Lax`; 12 h absolute lifetime. Payload = user id + role only. Secret: `AUTH_SECRET` (≥32 chars; missing → admin login disabled, fail closed).
- **Revocation without a sessions table:** every admin request re-reads the user (`getCurrentUser`, React `cache()` per request): must exist + `active`; token `iat` must be ≥ `passwordChangedAt`; role comes from the DB (demotion is instant).
- **Layers:** `proxy.js` = optimistic JWT check (redirect to `/admin/login?next=…`, JSON 401 for `/api/admin/**`) → `(panel)/layout.jsx` `requireUser()` → each page `requireUser(PERMISSION)` → each Server Action `authorize(PERMISSION)` / Route Handler `withAdmin(PERMISSION, handler)`. Never trust the layout alone.
- **RBAC:** `lib/auth/rbac.js` — `admin`: inbox read/write, content, SEO. `super_admin`: + users, audit. One table for UI and server.
- **Login hardening:** bcrypt cost 12 (dummy-hash compare for unknown emails → no timing enumeration); same generic error for every failure; limits: 20/15 min per IP, 5/15 min per email (in memory, identical for real & fake accounts), 5 failures → 15 min DB lockout (survives restarts; correct password refused while locked); disabled accounts checked only after a correct password.
- **Password policy:** ≥10 chars, ≤72 **bytes** (bcrypt limit; Bangla chars = 3 bytes), must differ from current. Change password → `passwordChangedAt` → every other device signed out, this one re-issued.
- **Open-redirect guard:** `safeAdminPath()` only allows `/admin…` targets.
- **Pages:** `/admin/login` (editorial split layout, show-password toggle, works without JS), `/admin` overview (new appointments, prescriptions to verify, unread messages, **not-emailed** records), `/admin/account` (profile + change password). Admin chrome: sidebar ≥lg, compact header + tab row on mobile.
- **Never indexed:** page `robots` noindex + `X-Robots-Tag` + `Cache-Control: private, no-store` (next.config) + `Disallow: /admin` (robots.txt).
- **Hard 404:** `proxy.js` checks `/shop/:slug` and `/blog/:slug` against an in-process slug index (`lib/server/slugIndex.js`: 60 s TTL, forced refresh on miss ≤ every 5 s, fails open) → real 404 status for unknown slugs.
- **CLI:** `npm run create-admin -- --email … --name "…"` (first user is forced to super_admin; hidden password prompt or `ADMIN_PASSWORD` env, policy-checked) · `-- --email … --reset-password [--activate]` = recovery (unlocks + signs out everywhere).
- Verified: eslint 0 · build (DB + demo mode) · 17/17 Playwright E2E (guard + `next`, generic errors, email kept, login → next, cookie flags, already-signed-in bounce, open redirect, wrong current pw, change pw signs out other device but not this one, logout, lockout + correct pw refused while locked) · `alg:none` forged token rejected · 1440 + 390 screenshots.

### B2 notes / trade-offs
- Logout clears this browser's cookie; a stolen token stays valid until it expires (≤12 h) unless the password is changed or the user is disabled. Acceptable for 2–3 staff; a session table can come later if needed.
- Rate limits are in memory (single PM2 process = exact). Use Redis if you scale to several instances.
- No audit log yet (B6) — sign-ins/lockouts/password changes are written to the server log (`[auth] …`).

### B3 — what was built
- **Owner rule:** until an admin uploads/assigns a photo, every place on the site keeps its current **Unsplash** image. Implemented as **image slots** = keys of `data/media.js` (defaults); `SiteSettings.imageOverrides` holds admin choices. `lib/media/slots.js#applySlots()` swaps any `{src}` that equals a slot default — so `homeData` / `aboutData` / `patientGuideData` / `doctor.photo` / `service.image` work unchanged. Pages call `withSlots(data)`; `getDoctor/getServices` apply it internally. Cache tag `media`.
- **Upload pipeline** (`lib/server/media.js`): magic bytes (JPEG/PNG/WebP/AVIF; SVG/GIF refused) → sharp: EXIF auto-rotate, **all metadata stripped** (GPS), long edge ≤ 2400 px, `limitInputPixels` 50 MP, WebP q80. Re-encoding neutralises polyglot files. UUID names, `wx` writes.
- **Storage/serving:** `MEDIA_DIR` (default `./storage/media`) → `GET /media/YYYY/MM/<uuid>.webp` (strict segment regex, `immutable` 1-year cache). Not `/public` (`next start` only serves build-time public files). Nginx alias documented.
- **Upload endpoint** `POST /api/admin/media` — Route Handler (keeps the 10 MB body limit off Server Actions/login), `withAdmin(content:write)`, explicit same-origin check (cookie-auth POST), 60 uploads/10 min/user, DB failure → file removed.
- **Admin → Media** (`/admin/media`, nav entry only for roles with `content:write`): 14 slot cards (Stock photo / Your upload, Replace via library picker, "Use stock photo" reset) + uploader (multi-file, drag & drop, per-file status) + library (alt text edit, copy link, delete, pagination 36/page).
- **Server Actions** (`_actions/media.js`): each authorizes itself, zod-validated, DB errors → friendly message; slot changes `updateTag` (admin sees the change on the next load) + `refresh()`.
- **Delete rules:** refused while a doctor/service/product/blog post uses the file; slots using it are reset to the Unsplash default; record deleted before file unlink.
- **Alt text** edits propagate to slot snapshots (public pages update).
- **Prescriptions:** `GET /api/admin/prescriptions/:orderId` — `inbox:read`, sha256 verified (tamper → 404), `private, no-store`, `nosniff`, sandbox CSP for images, `?download=1` → attachment, access logged. The B4 orders inbox will link to it.
- Seed no longer puts stock photos into the media library (it removes the 14 B1 records once); the library holds uploads only.
- Slot/override writes use read-modify-write on the small array (no `$pull`-by-condition / `arrayFilters`) — identical on MongoDB and Mongo-compatible engines.
- Verified: eslint 0 · build · **27/27** media E2E (Unsplash before upload, 401/403 guards, spoofed + SVG refused, WebP/2400/no-EXIF, traversal 404s, hero + portrait replaced on home/about while others stay Unsplash, alt propagation, reset, delete resets slot + unlinks, delete refused when a product uses it, prescription 401/200/attachment/tamper 404/not public) · B2 auth suite still **17/17** · 1440 + 390 screenshots.

### B3 notes
- The slot picker shows the newest 36 uploads (library page 1). Enough for a clinic; add search when the library grows.
- Products and blog posts keep their own image field — choosing a library image for them comes with the B5 editors.

### B4 — what was built
- **Workflows** (`lib/inbox/workflow.js`, enforced server-side, mirrored in the UI):
  Appointment `new → confirmed → completed`, `new|confirmed → cancelled`, `cancelled → new` (reopen).
  Order `new → processing → dispatched → delivered`, any open state → `cancelled`.
  **Rx gate:** an order whose prescription is required can't leave `new` until verified. Prescription `pending → verified | rejected`; rejecting a required one auto-cancels the order (reason kept + noted).
  Message `unread ⇄ read → archived`; opening a message marks it read (client Server Action — render never mutates).
- **Concurrency:** every status change is `updateOne({ _id, status: <what the admin saw> })` → a stale tab gets "someone else just updated this" + refresh, never a silent overwrite. Verified with two tabs.
- **Audit trail:** `statusHistory` (added to Appointment) + append-only notes, each with user + time; names resolved in one query.
- **Lists** (`/admin/appointments|orders|messages`): server-side tabs with counts, search (reference prefix, name, phone — digits-only so "+880 1712-345678" works; regex-escaped), 20/page, plain links/GET forms (no JS needed, every view is a URL). New/Confirmed appointments sort by requested time; Rx queue oldest first.
- **Details:** tap-to-call, WhatsApp (pre-filled greeting), mailto; facts; notes; history; order items with DB price snapshot + subtotal; prescription panel (open/download via the private B3 route, verify / reject with reason).
- **Shell:** sidebar badges (new appointments, Rx to verify, unread messages); mobile header + native `<dialog>` menu; overview cards link to their queues + **Today** schedule; `(panel)/not-found.jsx` keeps 404s inside the admin.
- **Emails:** clinic notifications carry an **Open in admin** button (record id only, no PII); patient emails never do.
- **Mongoose gotcha (documented in code):** `trusted()` must wrap the operator VALUE (`{ status: trusted({ $in }) }`), not the whole filter — sanitizeFilter checks per field.
- Verified: eslint 0 · build · **25/25** inbox E2E (seeded through the public forms; email deep links; badges; today list; phone/ref search; regex escaping; confirm + stale-tab conflict; notes; cancel → reopen; Rx gate; verify → processing → dispatched → delivered; reject → auto-cancel; OTC; auto-read; archive; bad id; logged-out redirect; mobile menu) · B2 17/17 · B3 27/27 still green.

### B4 notes
- Status changes don't message the patient — the clinic calls (owner decision). SMS/WhatsApp notifications could be added later.
- Messages have no notes field (replies happen by phone/email); easy to add if the clinic wants it.

### B5 — what was built
- **One generic editor, config-driven:** `data/admin/cmsData.js` holds copy + form structure for 9 entities (site settings, doctor, services, medicines, medicine categories, blog, blog categories, testimonials, FAQ). Field types: text/email/url/textarea/number/checkbox/select/date/slug/lines/paragraphs/image/repeater/blocks. Adding a field = one line there + one line in the zod schema.
- **Routes:** `/admin/content/[entity]` (list, or the editor itself for singletons settings/doctor) and `/admin/content/[entity]/[id|new]`. Unknown entity → admin 404. Sidebar has a **Content** group (`AdminNavList`, `match` prefixes keep "Medicines"/"Blog" active on their category pages).
- **Validation:** `lib/validation/cms.js` (zod) parses every Server Action payload: control chars stripped, limits = model limits, slugs format-checked, money integer, MRP ≥ price, social/map links https-only, **map embed restricted to Google Maps** (iframe src), image `src` only `/media/YYYY/MM/<uuid>.webp` or the whitelisted stock hosts, operator objects rejected. All existing `data/*.js` content passes (36/36 checked).
- **Locked keys:** service slug and category keys are fixed after creation (`lockOnEdit` — dropped from the schema on edit, so whatever the client sends is ignored). Product/blog slugs stay editable with a warning.
- **DAL** `services/admin/cms.js`: optimistic concurrency on `updatedAt` (`doc.$where` → conditional write; stale tab = "someone else saved"); leaf-by-leaf `doc.set` so fields not on the form (address.country, careJourney, imageOverrides) are never touched; duplicate keys → field error; category delete refused while medicines/articles use it; reorder (↑/↓) renumbers densely and respects the current tab; quick show/hide & approve from the list.
- **Actions** `app/(admin)/_actions/cms.js`: each authorizes `content:write`, validates the entity key + ObjectId, parses with zod, then `expireContent(tags)` for the pages that show that content (settings → `site-settings`, categories → their list + products/blog, etc.).
- **Editor UX:** sticky save bar, unsaved-changes warning, slug follows the title until edited, repeaters (hours, socials, training, affiliations, stats) with reorder, media-library picker for images (+ alt text per use), blog **block editor** (paragraph / heading / list / note box, reorder) — same blocks `ArticleBody` renders, no HTML stored.
- **Blog publishing:** draft / published; empty date = now, future date = scheduled (Scheduled tab). Testimonials open on the **Waiting** tab (moderation).
- **Site settings are now live on the public site:** `getSiteConfig()` (services/content.js) = `data/siteConfig.js` (nav, CTAs, brand, URL stay in code) overlaid with DB settings via `lib/site.js#mergeSite` (empty DB values never blank a default; tel:/mailto: hrefs always derived). Server components read it directly; client components (Navbar, MobileNav, ProductActions, error boundary) via `SiteProvider`/`useSite()` from the public layout. Fails soft to the static config if the DB is down. Clinic + physician JSON-LD moved to the public layout and use live settings + DB doctor.
- `lib/db/connect.js`: optional `MONGODB_DNS_SERVERS` override (dev machines whose router refuses SRV lookups). `.env` on the new dev PC uses the direct (non-SRV) Atlas seed list instead.

### B5 notes
- Verified here: esbuild syntax on all 49 touched files, named-import resolution, zod against all seed data + hostile payloads. **Not yet run:** `npm run lint`, `next build`, browser E2E (the dev VM was unavailable) — run these on the dev PC before B6.
- Navigation dropdown / footer service links are still code (`data/siteConfig.js`) — a new service appears on the Services page and appointment form, but not in the nav dropdown until added there.
- Scheduled posts go live on the next cache refresh (≤ 6 h TTL) — add an hourly revalidate if exact timing matters.
- Email templates still use the static phone/address from `data/siteConfig.js`.
- Care journey steps (SiteSettings.careJourney) are not editable yet.
- Per-post / per-product SEO fields → B6.

**Decided by the owner:**
- ODM: **Mongoose**
- **Appointments: no per-slot limit** — any number of requests per slot; the clinic calls each patient to confirm the final time (B4 builds the inbox around this: status New → Confirmed by phone).
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
- **B1:** Mongoose + 15 models, seed script, content service → DB with cache tags, forms save-then-email, private prescription storage, dynamic slugs.
- **B2:** JWT auth + DB revocation, RBAC, proxy guard, login lockout, admin login/overview/account, create-admin CLI, hard 404 for slugs.
- **B3:** image slots (Unsplash stays until replaced), sharp upload pipeline, /media serving, Admin → Media, private prescription download.
- **B4:** appointments / orders / messages inbox with enforced workflows, Rx gate, optimistic concurrency, notes + history, search & pagination, badges, mobile menu, email deep links.
- **B5:** config-driven content CMS (9 editors, block editor, media picker, reorder, approve), zod on every save, cache-tag revalidation, live site settings on the public site. Next: **B6 SEO manager & Super Admin**.
