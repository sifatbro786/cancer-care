import "server-only";

import { doctorData } from "@/data/doctorData";
import { servicesData, careJourney } from "@/data/servicesData";
import { productsData, productCategories } from "@/data/productsData";
import { blogsData, blogCategories } from "@/data/blogsData";
import { testimonialsData, ratingSummary } from "@/data/testimonialsData";
import { faqData } from "@/data/faqData";
import { readingTime } from "@/lib/utils";

/**
 * Data-access layer.
 * ─────────────────────────────────────────────────────────────────
 * Pages & server components call ONLY these async functions.
 * Phase 1: they resolve mock data from `data/`.
 * Phase 2: swap each body for `apiFetch("/doctor")` etc. — the
 *          signatures and return shapes stay identical, so no UI changes.
 * ─────────────────────────────────────────────────────────────────
 */

export async function getDoctor() {
  return doctorData;
}

export async function getServices() {
  return servicesData;
}

export async function getServiceBySlug(slug) {
  return servicesData.find((s) => s.slug === slug) ?? null;
}

export async function getCareJourney() {
  return careJourney;
}

/** Filter + search products. Mirrors the future `GET /api/products` query params. */
export async function getProducts({ category = "all", q = "" } = {}) {
  const term = q.trim().toLowerCase();
  return productsData.filter((p) => {
    const inCategory = category === "all" || p.category === category;
    const matches =
      !term || p.name.toLowerCase().includes(term) || p.generic.toLowerCase().includes(term);
    return inCategory && matches;
  });
}

export async function getProductBySlug(slug) {
  return productsData.find((p) => p.slug === slug) ?? null;
}

export async function getProductCategories() {
  return productCategories;
}

const withReadingTime = (post) => ({ ...post, readingMinutes: readingTime(post.content) });

export async function getBlogs({ featuredOnly = false, limit } = {}) {
  const list = blogsData
    .filter((b) => (featuredOnly ? b.featured : true))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(withReadingTime);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getBlogBySlug(slug) {
  const post = blogsData.find((b) => b.slug === slug);
  return post ? withReadingTime(post) : null;
}

export async function getBlogCategories() {
  return blogCategories;
}

export async function getTestimonials() {
  return { items: testimonialsData, summary: ratingSummary };
}

export async function getFaqs() {
  return faqData;
}

/** Static params helpers for `generateStaticParams` (SSG on Vercel). */
export async function getAllProductSlugs() {
  return productsData.map((p) => ({ slug: p.slug }));
}

export async function getAllBlogSlugs() {
  return blogsData.map((b) => ({ slug: b.slug }));
}
