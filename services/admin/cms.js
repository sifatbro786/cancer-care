import "server-only";
import { isValidObjectId, trusted } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  BlogCategory,
  BlogPost,
  Doctor,
  Faq,
  PageSeo,
  Product,
  ProductCategory,
  Service,
  SiteSettings,
  Testimonial,
} from "@/lib/db/models";
import { fromDhakaDay, toDhakaDay, toPlain } from "@/lib/db/serialize";
import { TAGS } from "@/lib/cache/tags";
import { CONTENT_ICON_KEYS } from "@/lib/icons";
import { telHref } from "@/lib/site";
import { formatBDT } from "@/lib/utils";
import { cmsData } from "@/data/admin/cmsData";

/**
 * Admin content (B5) — data access for every editable collection.
 * ─────────────────────────────────────────────────────────────────
 * Callers (Server Actions / pages) MUST have run authorize(PERMISSIONS.contentWrite)
 * and parsed the payload with lib/validation/cms.js#parseEntity first.
 *
 *  - Optimistic concurrency: an edit carries the `updatedAt` the admin loaded; the save
 *    is filtered on it (doc.$where) → a stale tab gets "someone else saved", never a
 *    silent overwrite (same rule as the B4 inbox).
 *  - Updates are applied leaf-by-leaf (dot paths) so fields that are not on the form
 *    (address.country, careJourney, imageOverrides…) are never touched.
 *  - Each entity lists the cache tags its public pages read; the action expires them.
 * ─────────────────────────────────────────────────────────────────
 */

const B = cmsData.badges;
const E = cmsData.errors;
const PER_PAGE = 20;
const LIST_CAP = 500; // un-paged lists (services, FAQ…) are small by nature

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : (s ?? ""));
const visible = (on) => (on ? { label: B.active.on, tone: "sage" } : { label: B.active.off, tone: "muted" });
// trusted() goes on the operator VALUE (where sanitizeFilter looks); the term is escaped
const contains = (field, term) => ({ [field]: trusted({ $regex: escapeRegex(term), $options: "i" }) });

const blogState = (d, now = new Date()) =>
  d.status !== "published" ? "draft" : d.publishedAt && d.publishedAt > now ? "scheduled" : "published";

/** Field names (first path segment) the editor manages — the only keys sent to the form. */
const managedRoots = (entity) =>
  new Set(cmsData.entities[entity].sections.flatMap((s) => s.fields).map((f) => f.name.split(".")[0]));

/** Fields whose value is one object (image refs) — set/unset as a whole, never per leaf. */
const ATOMIC = new Set(["photo", "image", "cover", "ogImage"]);

/** Human label of a record (audit log, messages). */
export const labelOf = (d) => d?.title || d?.name || d?.label || d?.q || d?.key || "";

const REGISTRY = {
  settings: { model: SiteSettings, singleton: { key: "site" }, tags: [TAGS.site] },
  doctor: { model: Doctor, singleton: { key: "primary" }, tags: [TAGS.doctor] },

  services: {
    model: Service,
    tags: [TAGS.services],
    order: true,
    unique: { slug: "page anchor" },
    row: (d) => ({
      title: d.title,
      meta: clip(d.short, 110),
      thumb: d.image?.src,
      badges: [visible(d.active)],
      toggle: d.active,
      view: d.active ? `/services#${d.slug}` : null,
    }),
  },

  products: {
    model: Product,
    tags: [TAGS.products],
    sort: { order: 1, _id: 1 },
    unique: { slug: "page address", sku: "SKU" },
    search: (t) => ({ $or: [contains("name", t), contains("generic", t), contains("sku", t)] }),
    row: (d) => ({
      title: d.name,
      meta: [d.generic, d.pack, formatBDT(d.price)].filter(Boolean).join(" · "),
      thumb: d.image?.src,
      badges: [
        visible(d.active),
        ...(d.inStock ? [] : [{ label: B.outOfStock, tone: "alert" }]),
        ...(d.requiresPrescription ? [{ label: B.rx, tone: "brand" }] : []),
      ],
      toggle: d.active,
      view: d.active ? `/shop/${d.slug}` : null,
    }),
  },

  "product-categories": {
    model: ProductCategory,
    tags: [TAGS.productCategories, TAGS.products],
    order: true,
    unique: { key: "key" },
    usage: (d) => Product.countDocuments({ category: d.key }),
    usageNoun: "medicines",
    row: (d) => ({ title: d.label, meta: d.key, badges: [visible(d.active)], toggle: d.active }),
  },

  blog: {
    model: BlogPost,
    tags: [TAGS.blog],
    sort: { updatedAt: -1, _id: -1 },
    unique: { slug: "page address" },
    search: (t) => contains("title", t),
    tabs: {
      all: () => ({}),
      published: (now) => ({ status: "published", publishedAt: trusted({ $lte: now }) }),
      scheduled: (now) => ({ status: "published", publishedAt: trusted({ $gt: now }) }),
      draft: () => ({ status: "draft" }),
    },
    row: (d) => {
      const state = blogState(d);
      return {
        title: d.title,
        meta: [d.category, d.publishedAt ? toDhakaDay(d.publishedAt) : null].filter(Boolean).join(" · "),
        thumb: d.cover?.src,
        badges: [
          { label: B[state], tone: state === "published" ? "sage" : state === "scheduled" ? "brand" : "muted" },
          ...(d.featured ? [{ label: B.featured, tone: "brand" }] : []),
        ],
        view: state === "published" ? `/blog/${d.slug}` : null,
      };
    },
  },

  "blog-categories": {
    model: BlogCategory,
    tags: [TAGS.blogCategories, TAGS.blog],
    order: true,
    unique: { key: "key" },
    usage: (d) => BlogPost.countDocuments({ category: d.key }),
    usageNoun: "articles",
    row: (d) => ({ title: d.label, meta: d.key, badges: [] }),
  },

  testimonials: {
    model: Testimonial,
    tags: [TAGS.testimonials],
    order: true,
    tabs: {
      pending: () => ({ approved: false }),
      approved: () => ({ approved: true }),
      all: () => ({}),
    },
    // same scopes in JS — reordering inside a tab skips items outside it
    inTab: { pending: (d) => !d.approved, approved: (d) => d.approved, all: () => true },
    row: (d) => ({
      title: `“${clip(d.quote, 120)}”`,
      meta: [d.name, d.relation, `${d.rating}★`].filter(Boolean).join(" · "),
      badges: [d.approved ? { label: B.approved.on, tone: "sage" } : { label: B.approved.off, tone: "alert" }],
      toggle: d.approved,
    }),
  },

  "seo-default": { model: PageSeo, singleton: { key: "default" }, tags: [TAGS.seo] },

  "seo-pages": {
    model: PageSeo,
    tags: [TAGS.seo],
    // the "default" record has its own singleton editor
    baseFilter: () => ({ key: trusted({ $ne: "default" }) }),
    sort: { path: 1, key: 1 },
    row: (d) => ({
      title: cmsData.entities["seo-pages"].pageLabels[d.key] ?? d.key,
      meta: [d.path, d.title || null].filter(Boolean).join(" · "),
      thumb: d.ogImage?.src ?? null,
      badges: d.noindex ? [{ label: B.noindex, tone: "alert" }] : [],
      view: d.path || null,
    }),
  },

  faqs: {
    model: Faq,
    tags: [TAGS.faqs],
    order: true,
    unique: { q: "question" },
    row: (d) => ({ title: d.q, meta: clip(d.a, 140), badges: [visible(d.active)], toggle: d.active }),
  },
};

export const isEntity = (entity) => typeof entity === "string" && Object.hasOwn(REGISTRY, entity);
export const entityTags = (entity) => REGISTRY[entity].tags;

/* ── Read ─────────────────────────────────────────────────────── */

function activeTab(entity, tab) {
  const cfg = REGISTRY[entity];
  if (!cfg.tabs) return null;
  return Object.hasOwn(cfg.tabs, tab) ? tab : (cmsData.entities[entity].defaultTab ?? Object.keys(cfg.tabs)[0]);
}

/**
 * List page: rows + optional tabs (with counts), search and pagination.
 * @returns {{ rows, total, page, pages, tab, tabs, q }}
 */
export async function listEntity(entity, { page = 1, q = "", tab } = {}) {
  const cfg = REGISTRY[entity];
  const copy = cmsData.entities[entity];
  await connectDB();
  const now = new Date();

  const current = activeTab(entity, tab);
  const term = cfg.search ? String(q ?? "").trim().slice(0, 60) : "";
  const filter = {
    ...(cfg.baseFilter?.() ?? {}),
    ...(current ? cfg.tabs[current](now) : {}),
    ...(term ? cfg.search(term) : {}),
  };

  const [total, tabs] = await Promise.all([
    cfg.model.countDocuments(filter),
    current
      ? Promise.all(copy.tabs.map(async (t) => ({ ...t, count: await cfg.model.countDocuments(cfg.tabs[t.key](now)) })))
      : null,
  ]);

  const paged = Boolean(copy.paged);
  const pages = paged ? Math.max(1, Math.ceil(total / PER_PAGE)) : 1;
  const pageNo = paged ? Math.min(Math.max(1, Math.floor(Number(page)) || 1), pages) : 1;

  const docs = await cfg.model
    .find(filter)
    .sort(cfg.order ? { order: 1, _id: 1 } : cfg.sort)
    .skip(paged ? (pageNo - 1) * PER_PAGE : 0)
    .limit(paged ? PER_PAGE : LIST_CAP)
    .lean();

  return {
    rows: docs.map((d) => ({ id: String(d._id), ...cfg.row(d) })),
    total,
    page: pageNo,
    pages,
    tab: current,
    tabs,
    q: term,
  };
}

/** Lean doc → editor values (only managed fields; dates as Dhaka days). */
function toFormValues(entity, doc) {
  const plain = toPlain(doc);
  const roots = managedRoots(entity);
  const values = Object.fromEntries(Object.entries(plain).filter(([k]) => roots.has(k)));
  if (entity === "blog") values.publishedAt = doc.publishedAt ? toDhakaDay(doc.publishedAt) : "";
  return values;
}

/** @returns {Promise<{ id, version, values } | null>} */
export async function getEditable(entity, id) {
  const cfg = REGISTRY[entity];
  await connectDB();
  let doc = null;
  if (cfg.singleton) doc = await cfg.model.findOne(cfg.singleton).lean();
  else if (isValidObjectId(id)) doc = await cfg.model.findOne({ _id: id, ...(cfg.baseFilter?.() ?? {}) }).lean();
  if (!doc) return null;
  const label = cmsData.entities[entity].pageLabels?.[doc.key] ?? labelOf(doc);
  return { id: String(doc._id), version: doc.updatedAt?.toISOString() ?? "", label, values: toFormValues(entity, doc) };
}

/** Options for <select> fields that come from other collections. */
export async function getFieldOptions(entity) {
  if (entity === "services") {
    return { icons: CONTENT_ICON_KEYS.map((k) => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) })) };
  }
  if (entity === "products") {
    await connectDB();
    const cats = await ProductCategory.find().sort({ order: 1 }).select("key label active").lean();
    return { productCategories: cats.map((c) => ({ value: c.key, label: c.active ? c.label : `${c.label} (hidden)` })) };
  }
  if (entity === "blog") {
    await connectDB();
    const cats = await BlogCategory.find().sort({ order: 1 }).select("key label").lean();
    return { blogCategories: cats.map((c) => ({ value: c.key, label: c.label })) };
  }
  return {};
}

/* ── Write ────────────────────────────────────────────────────── */

/** { a: { b: 1 }, image: {…} } → [["a.b", 1], ["image", {…}]]; null → undefined (= unset). */
function leaves(obj, prefix = "", out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const isGroup = v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date) && !ATOMIC.has(k);
    if (isGroup) leaves(v, path, out);
    else out.push([path, v === null ? undefined : v]);
  }
  return out;
}

const fieldError = (field, message) => ({ ok: false, code: "invalid", fieldErrors: { [field]: message } });

/** Values that are derived or need a DB lookup, applied after parsing. */
async function prepare(entity, data) {
  if (entity === "settings") {
    data.contact.phoneHref = telHref(data.contact.phone);
    data.contact.emailHref = data.contact.email ? `mailto:${data.contact.email}` : "";
  }
  if (entity === "products" && !(await ProductCategory.exists({ key: data.category }))) {
    return fieldError("category", E.category);
  }
  if (entity === "blog") {
    if (!(await BlogCategory.exists({ key: data.category }))) return fieldError("category", E.category);
    // empty date + published = now; a future day schedules the post
    data.publishedAt = data.publishedAt
      ? fromDhakaDay(data.publishedAt)
      : data.status === "published"
        ? new Date()
        : null;
  }
  return null;
}

function mapWriteError(entity, err) {
  const cfg = REGISTRY[entity];
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? err.keyValue ?? {})[0];
    return fieldError(field, E.duplicate(cfg.unique?.[field] ?? field));
  }
  if (err?.name === "DocumentNotFoundError") return { ok: false, code: "conflict" };
  if (err?.name === "ValidationError") {
    // Shouldn't happen after zod — log it and still point at the fields
    console.error("[cms] model validation:", err.message);
    return { ok: false, code: "invalid", fieldErrors: Object.fromEntries(Object.keys(err.errors ?? {}).map((k) => [k, E.invalid])) };
  }
  throw err;
}

/**
 * Create (id = null) or update. `version` = updatedAt ISO the editor loaded.
 * @returns {{ ok: true, id, version } | { ok: false, code, fieldErrors? }}
 */
export async function saveEntity(entity, id, version, data) {
  const cfg = REGISTRY[entity];
  await connectDB();
  const blocked = await prepare(entity, data);
  if (blocked) return blocked;

  const isNew = !cfg.singleton && !id;
  if (isNew && cmsData.entities[entity].noCreate) return { ok: false, code: "notFound" };
  let doc;
  if (isNew) {
    doc = new cfg.model();
    if (cfg.order) {
      const last = await cfg.model.findOne().sort({ order: -1 }).select("order").lean();
      doc.order = (last?.order ?? -1) + 1;
    }
  } else {
    doc = cfg.singleton
      ? await cfg.model.findOne(cfg.singleton)
      : isValidObjectId(id)
        ? await cfg.model.findOne({ _id: id, ...(cfg.baseFilter?.() ?? {}) })
        : null;
    if (!doc) return { ok: false, code: cfg.singleton ? "missing" : "notFound" };
    const seen = doc.updatedAt;
    if (!version || seen?.toISOString() !== version) return { ok: false, code: "conflict" };
    doc.$where = { updatedAt: seen }; // the write itself is conditional, not only the check above
  }

  for (const [path, value] of leaves(data)) {
    if (isNew && value === undefined) continue;
    doc.set(path, value);
  }

  try {
    await doc.save();
  } catch (err) {
    return mapWriteError(entity, err);
  }
  return { ok: true, id: String(doc._id), version: doc.updatedAt?.toISOString() ?? "", label: labelOf(doc), created: isNew };
}

export async function deleteEntity(entity, id) {
  const cfg = REGISTRY[entity];
  if (cfg.singleton || cmsData.entities[entity].noDelete || !isValidObjectId(id)) return { ok: false, code: "notFound" };
  await connectDB();
  const doc = await cfg.model.findById(id).lean();
  if (!doc) return { ok: false, code: "notFound" };
  if (cfg.usage) {
    const n = await cfg.usage(doc);
    if (n) return { ok: false, code: "inUse", count: n, noun: cfg.usageNoun };
  }
  await cfg.model.deleteOne({ _id: doc._id });
  return { ok: true, label: labelOf(doc) };
}

/**
 * Move one step up (-1) or down (+1) among the items of the current tab.
 * Renumbers the whole (small) collection 0..n so orders stay dense and unique.
 */
export async function moveEntity(entity, id, dir, tab) {
  const cfg = REGISTRY[entity];
  if (!cfg.order || !isValidObjectId(id) || (dir !== 1 && dir !== -1)) return { ok: false, code: "notFound" };
  await connectDB();
  const all = await cfg.model.find().sort({ order: 1, _id: 1 }).select("_id order approved").limit(LIST_CAP).lean();
  const inScope = cfg.inTab?.[activeTab(entity, tab)] ?? (() => true);

  const i = all.findIndex((d) => String(d._id) === id);
  if (i < 0) return { ok: false, code: "notFound" };
  let j = i + dir;
  while (j >= 0 && j < all.length && !inScope(all[j])) j += dir;
  if (j < 0 || j >= all.length) return { ok: true, changed: false };

  [all[i], all[j]] = [all[j], all[i]];
  const ops = all
    .map((d, n) => (d.order === n ? null : { updateOne: { filter: { _id: d._id }, update: { $set: { order: n } } } }))
    .filter(Boolean);
  if (ops.length) await cfg.model.bulkWrite(ops);
  return { ok: true, changed: true };
}

/** Quick switch from the list (show/hide, approve) — only the entity's configured field. */
export async function toggleEntity(entity, id) {
  const cfg = REGISTRY[entity];
  const field = cmsData.entities[entity].toggle;
  if (!field || !isValidObjectId(id)) return { ok: false, code: "notFound" };
  await connectDB();
  const doc = await cfg.model.findById(id).select(`${field} title name label q`).lean();
  if (!doc) return { ok: false, code: "notFound" };
  await cfg.model.updateOne({ _id: doc._id }, { $set: { [field]: !doc[field] } });
  return { ok: true, label: labelOf(doc), field, value: !doc[field] };
}
