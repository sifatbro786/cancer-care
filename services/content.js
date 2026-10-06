import "server-only";
import { unstable_cache } from "next/cache";
import { isDbConfigured } from "@/lib/db/connect";
import { CONTENT_TTL, TAGS } from "@/lib/cache/tags";
import { readingTime } from "@/lib/utils";
import { applySlots } from "@/lib/media/slots";
import { mergeSite } from "@/lib/site";
import { siteConfig } from "@/data/siteConfig";
import { seoData } from "@/data/seoData";
import { mergeSeo } from "@/lib/seo";
import { mockSource } from "@/services/sources/mock";
import { dbSource } from "@/services/sources/db";

/**
 * Data-access layer.
 * ─────────────────────────────────────────────────────────────────
 * Pages & server components call ONLY these async functions —
 * signatures and return shapes are unchanged from the static phase.
 *
 * Source:  MONGODB_URI set   → MongoDB (services/sources/db.js), cached
 *                              with tags; admin writes call
 *                              revalidateContent(TAGS.x) (lib/cache/revalidate.js)
 *          MONGODB_URI unset → data/*.js (static demo / CI / UI work)
 * ─────────────────────────────────────────────────────────────────
 */

const useDb = isDbConfigured();

if (!useDb && process.env.NODE_ENV === "production" && !globalThis.__ccMockWarned) {
  globalThis.__ccMockWarned = true;
  console.warn("[content] MONGODB_URI not set — serving static data from data/*.js.");
}

const source = useDb ? dbSource : mockSource;

/** Wrap a source function in the Next data cache with the given tags (DB mode only). */
const cached = (name, tags) =>
  useDb
    ? unstable_cache((...args) => source[name](...args), ["content", name], { tags, revalidate: CONTENT_TTL })
    : source[name];

const q = {
  doctor: cached("getDoctor", [TAGS.doctor]),
  services: cached("getServices", [TAGS.services]),
  serviceBySlug: cached("getServiceBySlug", [TAGS.services]),
  careJourney: cached("getCareJourney", [TAGS.site]),
  products: cached("getProducts", [TAGS.products]),
  productBySlug: cached("getProductBySlug", [TAGS.products]),
  productCategories: cached("getProductCategories", [TAGS.productCategories]),
  productSlugs: cached("getAllProductSlugs", [TAGS.products]),
  blogs: cached("getBlogs", [TAGS.blog]),
  blogBySlug: cached("getBlogBySlug", [TAGS.blog]),
  blogCategories: cached("getBlogCategories", [TAGS.blogCategories]),
  blogSlugs: cached("getAllBlogSlugs", [TAGS.blog]),
  testimonials: cached("getTestimonials", [TAGS.testimonials, TAGS.site]),
  faqs: cached("getFaqs", [TAGS.faqs]),
  siteSettings: cached("getSiteSettings", [TAGS.site]),
  pageSeo: cached("getPageSeo", [TAGS.seo]),
  allPageSeo: cached("getAllPageSeo", [TAGS.seo]),
  imageSlots: cached("getImageSlots", [TAGS.media]),
};

/**
 * Image slots (B3): { [key]: { src, alt, custom } }. Pages pass their copy objects
 * through `withSlots()` so admin-uploaded images replace the Unsplash defaults.
 */
export async function getImageSlots() {
  return q.imageSlots();
}

export async function withSlots(data) {
  return applySlots(data, await q.imageSlots());
}

export async function getDoctor() {
  return withSlots(await q.doctor());
}

export async function getServices() {
  return withSlots(await q.services());
}

export async function getServiceBySlug(slug) {
  if (typeof slug !== "string" || !slug) return null;
  return withSlots(await q.serviceBySlug(slug));
}

export async function getCareJourney() {
  return q.careJourney();
}

/**
 * Filter + search products. Category is resolved in the query (and cached per category);
 * the free-text term filters the cached list — the catalogue is small, and this keeps
 * arbitrary user input out of cache keys.
 */
export async function getProducts({ category = "all", q: term = "" } = {}) {
  const list = await q.products({ category: String(category) });
  const t = String(term).trim().toLowerCase();
  if (!t) return list;
  return list.filter((p) => p.name.toLowerCase().includes(t) || p.generic?.toLowerCase().includes(t));
}

export async function getProductBySlug(slug) {
  if (typeof slug !== "string" || !slug) return null;
  return q.productBySlug(slug);
}

export async function getProductCategories() {
  return q.productCategories();
}

const withReadingTime = (post) => ({ ...post, readingMinutes: readingTime(post.content) });

export async function getBlogs({ featuredOnly = false, limit } = {}) {
  const list = (await q.blogs({ featuredOnly: Boolean(featuredOnly) })).map(withReadingTime);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getBlogBySlug(slug) {
  if (typeof slug !== "string" || !slug) return null;
  const post = await q.blogBySlug(slug);
  return post ? withReadingTime(post) : null;
}

export async function getBlogCategories() {
  return q.blogCategories();
}

export async function getTestimonials() {
  return q.testimonials();
}

export async function getFaqs() {
  return q.faqs();
}

/** Static params helpers for `generateStaticParams` (pre-rendered at build; new slugs render on demand). */
export async function getAllProductSlugs() {
  return q.productSlugs();
}

export async function getAllBlogSlugs() {
  return q.blogSlugs();
}

/** Raw SiteSettings document (admin/internal use). Public UI reads getSiteConfig(). */
export async function getSiteSettings() {
  return q.siteSettings();
}

/**
 * The site config every public component reads: data/siteConfig.js (nav, CTAs, brand)
 * overlaid with the admin-editable settings (contact, address, hours, socials, footer).
 * Fails soft — a DB hiccup must never take the header/footer (i.e. every page) down.
 */
export async function getSiteConfig() {
  if (!useDb) return siteConfig;
  try {
    return mergeSite(siteConfig, await q.siteSettings());
  } catch (err) {
    console.error("[content] site settings unavailable, using defaults:", err?.message);
    return siteConfig;
  }
}

/**
 * SEO config for metadata: data/seoData.js overlaid with Admin → SEO (B6).
 * Fails soft to the static values — metadata must never take a page down.
 */
export async function getSeoConfig() {
  if (!useDb) return seoData;
  try {
    return mergeSeo(seoData, await q.allPageSeo());
  } catch (err) {
    console.error("[content] page SEO unavailable, using defaults:", err?.message);
    return seoData;
  }
}

export async function getPageSeo(key) {
  return q.pageSeo(String(key));
}
