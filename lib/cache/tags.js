/**
 * Cache tags for public content (unstable_cache in services/content.js).
 * Admin mutations (B5/B6) call `revalidateContent(TAGS.products)` etc. —
 * every page that read that data is regenerated on its next visit.
 */
export const TAGS = Object.freeze({
  site: "site-settings",
  seo: "page-seo",
  doctor: "doctor",
  services: "services",
  products: "products",
  productCategories: "product-categories",
  blog: "blog",
  blogCategories: "blog-categories",
  testimonials: "testimonials",
  faqs: "faqs",
  media: "media", // image slot overrides
});

/** Belt-and-braces: cached data still expires after this even if a revalidate call is missed. */
export const CONTENT_TTL = 60 * 60 * 6; // 6 h
