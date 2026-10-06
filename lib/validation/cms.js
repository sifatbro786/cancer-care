import { z } from "zod";
import { cmsData } from "@/data/admin/cmsData";
import { CONTENT_ICON_KEYS } from "@/lib/icons";

/**
 * Admin content (B5) — server-side validation for every editor.
 * ─────────────────────────────────────────────────────────────────
 * Server Action arguments are untrusted input: every save is parsed here first.
 * Output is DB-ready (trimmed, control characters stripped, empty optional
 * blocks removed). Field-level messages come from data/admin/cmsData.js.
 * Limits mirror the Mongoose schemas (lib/db/models) so a parsed value never
 * fails model validation.
 * ─────────────────────────────────────────────────────────────────
 */

const E = cmsData.errors;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Single-line text: every control char → space. Multi-line: keep \n and \t only.
const oneLine = (s) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
const multiLine = (s) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const text = (max, required = false) => {
  const base = z.string({ error: E.required }).transform(oneLine);
  return required
    ? base.pipe(z.string().min(1, E.required).max(max, E.tooLong(max)))
    : z.preprocess((v) => v ?? "", base.pipe(z.string().max(max, E.tooLong(max))));
};

const longText = (max, required = false) => {
  const base = z.string({ error: E.required }).transform(multiLine);
  return required
    ? base.pipe(z.string().min(1, E.required).max(max, E.tooLong(max)))
    : z.preprocess((v) => v ?? "", base.pipe(z.string().max(max, E.tooLong(max))));
};

/** Optional single-line text that is stored as "absent" when empty (e.g. sparse-unique SKU). */
const optionalText = (max) => text(max).transform((v) => v || undefined);

/** string[] — blank entries dropped, each item and the count capped. */
const list = (maxItems, maxLen, clean = oneLine) =>
  z
    .array(z.string(), { error: E.invalid })
    .max(200, E.tooMany(maxItems))
    .transform((a) => a.map(clean).filter(Boolean))
    .pipe(z.array(z.string().max(maxLen, E.tooLong(maxLen))).max(maxItems, E.tooMany(maxItems)));

const lines = (maxItems, maxLen) => z.preprocess((v) => v ?? [], list(maxItems, maxLen));
const paragraphs = (maxItems, maxLen) => z.preprocess((v) => v ?? [], list(maxItems, maxLen, multiLine));

const toNumber = (v) => (v === "" || v === null || v === undefined ? undefined : typeof v === "string" ? Number(v) : v);

const num = ({ min, max, int = false, required = false }) => {
  let n = z.number({ error: E.number });
  if (int) n = n.int(E.integer);
  if (min !== undefined) n = n.min(min, E.range(min, max ?? "∞"));
  if (max !== undefined) n = n.max(max, E.range(min ?? 0, max));
  return z.preprocess(toNumber, required ? n : n.optional());
};

/** Nested group (contact, details, philosophy…) — a missing group parses as {}. */
const group = (shape) => z.preprocess((v) => v ?? {}, z.object(shape));

/** Repeater rows — a missing list parses as []. */
const rows = (shape, max) => z.preprocess((v) => v ?? [], z.array(z.object(shape)).max(max, E.tooMany(max)));

const bool = z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean());

export const slugSchema = z
  .string({ error: E.required })
  .trim()
  .toLowerCase()
  .min(1, E.required)
  .max(120, E.tooLong(120))
  .regex(SLUG_RE, E.slug);

const isHttps = (v) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

const httpsUrl = (max, required = false) =>
  text(max, required).refine((v) => v === "" || isHttps(v), E.url);

/** Map iframe src: only Google Maps embeds — anything else could frame an arbitrary site. */
const MAP_HOSTS = new Set(["www.google.com", "google.com", "maps.google.com"]);
const mapEmbedUrl = text(600).refine((v) => {
  if (v === "") return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && MAP_HOSTS.has(u.hostname) && u.pathname.startsWith("/maps");
  } catch {
    return false;
  }
}, E.mapEmbed);

/**
 * Image reference. Allowed sources: our media library (/media/YYYY/MM/<uuid>.webp)
 * or the stock-photo hosts already whitelisted for next/image (existing placeholders).
 */
const MEDIA_SRC = /^\/media\/\d{4}\/(0[1-9]|1[0-2])\/[0-9a-f-]{36}\.webp$/;
const STOCK_SRC = /^https:\/\/images\.(unsplash|pexels)\.com\/[\w\-./?=&%]+$/;
const image = z.preprocess(
  (v) => (v && typeof v === "object" && v.src ? v : null),
  z
    .object({
      src: z
        .string()
        .trim()
        .max(500)
        .refine((s) => MEDIA_SRC.test(s) || STOCK_SRC.test(s), E.image),
      alt: text(200),
    })
    .nullable()
);

const email = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v ?? ""),
  z.union([z.literal(""), z.email(E.email).max(120, E.tooLong(120))])
);

const dhakaDay = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : ""),
  z.string().refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), E.date)
);

/* ── Entities ─────────────────────────────────────────────────── */

const settings = z.object({
  contact: group({
    phone: text(30, true).refine((v) => /^\+?[\d\s()-]{6,30}$/.test(v), E.phone),
    whatsapp: z
      .string({ error: E.required })
      .transform((v) => v.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{10,15}$/, E.whatsapp)),
    whatsappMessage: text(200),
    email,
  }),
  address: group({
    line1: text(120, true),
    line2: text(120),
    full: text(240, true),
    city: text(60),
    region: text(60),
    postalCode: text(12),
    mapLink: httpsUrl(600),
    mapEmbed: mapEmbedUrl,
    geo: group({ lat: num({ min: -90, max: 90 }), lng: num({ min: -180, max: 180 }) }),
  }),
  hours: rows({ label: text(60, true), days: text(60, true), time: text(60, true) }, 8),
  emergencyNote: text(200),
  social: rows(
    {
      key: z.enum(["facebook", "youtube", "whatsapp", "google"], { error: E.required }),
      label: text(40, true),
      href: httpsUrl(300, true),
    },
    6
  ),
  footer: group({ about: longText(600), disclaimer: longText(600) }),
  ratingSummary: group({
    average: num({ min: 0, max: 5 }),
    count: num({ min: 0, max: 1_000_000, int: true }),
    sources: lines(6, 40),
  }),
});

const doctor = z.object({
  honorific: text(20),
  name: text(100, true),
  shortTitle: text(120),
  designation: text(200),
  bmdcReg: text(30),
  photo: image,
  degrees: lines(12, 160),
  training: rows({ year: text(10), title: text(160, true), place: text(160) }, 12),
  affiliations: rows({ name: text(160, true), role: text(160), period: text(40) }, 10),
  memberships: lines(12, 160),
  summary: longText(600),
  bio: paragraphs(12, 3000),
  specialties: lines(16, 120),
  languages: lines(8, 40),
  stats: rows({ value: num({ min: 0, max: 1_000_000, required: true }), suffix: text(6), label: text(80, true) }, 6),
  philosophy: group({ quote: longText(400), signature: text(80) }),
});

const services = z.object({
  title: text(120, true),
  slug: slugSchema,
  icon: z.enum(CONTENT_ICON_KEYS, { error: E.required }),
  active: bool,
  short: longText(300),
  image,
  highlights: lines(10, 200),
  details: group({
    intro: longText(1000),
    // optional block — absent (not []) when unused, the public page checks for it
    steps: lines(12, 300).transform((a) => (a.length ? a : undefined)),
    precautions: lines(12, 300),
    facilities: lines(12, 300),
  }),
});

const money = num({ min: 0, max: 10_000_000, int: true, required: true });

const products = z.object({
  name: text(160, true),
  slug: slugSchema,
  sku: optionalText(40),
  generic: text(160),
  category: slugSchema,
  manufacturer: text(120),
  pack: text(120),
  price: money,
  mrp: money,
  requiresPrescription: bool,
  inStock: bool,
  coldChain: bool,
  active: bool,
  image,
  description: longText(2000),
  seo: group({ title: text(70), description: longText(170) }),
});

const productCategories = z.object({ label: text(60, true), key: slugSchema, active: bool });

const block = z.discriminatedUnion(
  "type",
  [
    z.object({ type: z.literal("paragraph"), text: longText(5000, true) }),
    z.object({ type: z.literal("heading"), text: text(200, true) }),
    z.object({ type: z.literal("list"), items: lines(30, 500).refine((a) => a.length > 0, E.required) }),
    z.object({ type: z.literal("callout"), text: longText(1000, true) }),
  ],
  { error: E.invalid }
);

const blog = z.object({
  title: text(200, true),
  slug: slugSchema,
  category: slugSchema,
  author: text(100),
  excerpt: longText(400),
  cover: image,
  status: z.enum(["draft", "published"], { error: E.required }),
  publishedAt: dhakaDay,
  featured: bool,
  content: z.array(block, { error: E.blocks }).min(1, E.blocks).max(200, E.tooMany(200)),
  seo: group({ title: text(70), description: longText(170) }),
});

const blogCategories = z.object({ label: text(60, true), key: slugSchema });

const testimonials = z.object({
  quote: longText(800, true),
  name: text(60, true),
  relation: text(60),
  location: text(60),
  rating: num({ min: 1, max: 5, int: true, required: true }),
  source: z.enum(["direct", "facebook", "google"], { error: E.required }),
  approved: bool,
});

const faqs = z.object({ q: text(300, true), a: longText(2000, true), active: bool });

const seoDefault = z.object({
  title: text(120, true),
  titleTemplate: text(120, true).refine((v) => v.includes("%s"), E.template),
  description: longText(300, true),
  ogHeadline: text(160),
  keywords: lines(20, 80),
  ogImage: image,
});

const seoPages = z.object({ title: text(120), description: longText(300), ogImage: image, noindex: bool });

const SCHEMAS = {
  "seo-default": seoDefault,
  "seo-pages": seoPages,
  settings,
  doctor,
  services,
  products,
  "product-categories": productCategories,
  blog,
  "blog-categories": blogCategories,
  testimonials,
  faqs,
};

/** Cross-field rules, applied after the shape parses. */
const REFINES = {
  products: (d, ctx) => {
    if (d.mrp < d.price) ctx.addIssue({ code: "custom", path: ["mrp"], message: E.mrp });
  },
};

/** Fields marked `lockOnEdit` in cmsData (slugs/keys other records depend on). */
const lockedFields = (entity) =>
  cmsData.entities[entity].sections.flatMap((s) => s.fields).filter((f) => f.lockOnEdit).map((f) => f.name);

/**
 * Parse an editor payload. On edit, locked fields are dropped from the schema —
 * whatever the client sent for them is ignored, never written.
 * @returns {{ ok: true, data } | { ok: false, fieldErrors: Record<string,string> }}
 */
export function parseEntity(entity, values, { isNew }) {
  let schema = SCHEMAS[entity];
  if (!schema) return { ok: false, fieldErrors: {} };
  const locked = isNew ? [] : lockedFields(entity);
  if (locked.length) schema = schema.omit(Object.fromEntries(locked.map((k) => [k, true])));
  if (REFINES[entity]) schema = schema.superRefine(REFINES[entity]);

  const res = schema.safeParse(values && typeof values === "object" ? values : {});
  if (res.success) return { ok: true, data: res.data };

  const fieldErrors = {};
  for (const issue of res.error.issues) {
    const key = issue.path.join(".");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}
