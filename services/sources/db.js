import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { toDhakaDay, toPlain, toPlainList } from "@/lib/db/serialize";
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
import { shopData } from "@/data/shopData";

/**
 * MongoDB source. Every function returns the SAME shape as ./mock.js,
 * so pages and components are unaware of where data comes from.
 * Public reads only: inactive / draft / unapproved records never leave here.
 */

const PUBLIC_FIELDS = "-createdAt -__v";

// Strip bookkeeping fields the UI never needs (keeps the RSC payload lean).
const clean = ({ active: _a, order: _o, key: _k, createdAt: _c, ...rest }) => rest;

const blogShape = (p) => {
  const { status: _s, seo: _seo, createdAt: _c, ...post } = toPlain(p);
  return { ...post, publishedAt: toDhakaDay(p.publishedAt), updatedAt: p.updatedAt?.toISOString() };
};

// `publishedAt <= now` (future date = scheduled). trusted() marks OUR operator as safe —
// the global sanitizeFilter would otherwise wrap it in $eq. User input never goes inside it.
const publishedFilter = (extra = {}) => ({
  ...extra,
  status: "published",
  publishedAt: mongoose.trusted({ $lte: new Date() }),
});

async function db() {
  await connectDB();
}

export const dbSource = {
  async getDoctor() {
    await db();
    const d = await Doctor.findOne({ key: "primary" }).select(PUBLIC_FIELDS).lean();
    if (!d) throw new Error("[content] Doctor profile missing — run `npm run seed`.");
    return clean(toPlain(d));
  },

  async getServices() {
    await db();
    const list = await Service.find({ active: true }).sort({ order: 1, _id: 1 }).select(PUBLIC_FIELDS).lean();
    return toPlainList(list).map(clean);
  },

  async getServiceBySlug(slug) {
    await db();
    const s = await Service.findOne({ slug: String(slug), active: true }).select(PUBLIC_FIELDS).lean();
    return s ? clean(toPlain(s)) : null;
  },

  async getCareJourney() {
    await db();
    const s = await SiteSettings.findOne({ key: "site" }).select("careJourney").lean();
    return toPlain(s)?.careJourney ?? [];
  },

  async getProducts({ category = "all" } = {}) {
    await db();
    const filter = { active: true };
    if (category !== "all") filter.category = String(category);
    const list = await Product.find(filter).sort({ order: 1, _id: 1 }).select(PUBLIC_FIELDS).lean();
    return toPlainList(list).map(clean);
  },

  async getProductBySlug(slug) {
    await db();
    const p = await Product.findOne({ slug: String(slug), active: true }).select(PUBLIC_FIELDS).lean();
    return p ? clean(toPlain(p)) : null;
  },

  async getProductCategories() {
    await db();
    const list = await ProductCategory.find({ active: true }).sort({ order: 1 }).select("key label").lean();
    // "all" is a UI filter, not a stored category
    return [{ key: "all", label: shopData.allCategoriesLabel }, ...list.map(({ key, label }) => ({ key, label }))];
  },

  async getAllProductSlugs() {
    await db();
    const list = await Product.find({ active: true }).select("slug -_id").lean();
    return list.map(({ slug }) => ({ slug }));
  },

  async getBlogs({ featuredOnly = false } = {}) {
    await db();
    const list = await BlogPost.find(publishedFilter(featuredOnly ? { featured: true } : {}))
      .sort({ publishedAt: -1 })
      .select(PUBLIC_FIELDS)
      .lean();
    return list.map(blogShape);
  },

  async getBlogBySlug(slug) {
    await db();
    const p = await BlogPost.findOne(publishedFilter({ slug: String(slug) })).select(PUBLIC_FIELDS).lean();
    return p ? blogShape(p) : null;
  },

  async getBlogCategories() {
    await db();
    const list = await BlogCategory.find().sort({ order: 1 }).select("key label").lean();
    return list.map(({ key, label }) => ({ key, label }));
  },

  async getAllBlogSlugs() {
    await db();
    const list = await BlogPost.find(publishedFilter()).select("slug -_id").lean();
    return list.map(({ slug }) => ({ slug }));
  },

  async getTestimonials() {
    await db();
    const [items, site] = await Promise.all([
      Testimonial.find({ approved: true }).sort({ order: 1, _id: 1 }).select(PUBLIC_FIELDS).lean(),
      SiteSettings.findOne({ key: "site" }).select("ratingSummary").lean(),
    ]);
    return {
      items: toPlainList(items).map(({ approved: _a, ...t }) => clean(t)),
      summary: toPlain(site)?.ratingSummary ?? null,
    };
  },

  async getFaqs() {
    await db();
    const list = await Faq.find({ active: true }).sort({ order: 1, _id: 1 }).select("q a -_id").lean();
    return list.map(({ q, a }) => ({ q, a }));
  },

  /** Wired into layout/header/footer in B5 (currently read from data/siteConfig.js). */
  async getSiteSettings() {
    await db();
    const s = await SiteSettings.findOne({ key: "site" }).select(PUBLIC_FIELDS).lean();
    return s ? clean(toPlain(s)) : null;
  },

  /** Wired into lib/seo.js in B6. */
  async getPageSeo(key) {
    await db();
    const s = await PageSeo.findOne({ key: String(key) }).select(PUBLIC_FIELDS).lean();
    return s ? clean(toPlain(s)) : null;
  },
};
