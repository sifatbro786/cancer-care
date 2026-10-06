import { doctorData } from "@/data/doctorData";
import { servicesData, careJourney } from "@/data/servicesData";
import { productsData, productCategories } from "@/data/productsData";
import { blogsData, blogCategories } from "@/data/blogsData";
import { testimonialsData, ratingSummary } from "@/data/testimonialsData";
import { faqData } from "@/data/faqData";
import { siteConfig } from "@/data/siteConfig";
import { seoData } from "@/data/seoData";
import { slotDefaults } from "@/lib/media/slots";

/**
 * Static source — `data/*.js`. Used when MONGODB_URI is not set
 * (static Vercel demo, CI builds, UI work without a database).
 * Must return exactly the same shapes as ./db.js.
 */

const byNewest = (a, b) => b.publishedAt.localeCompare(a.publishedAt);

export const mockSource = {
  getDoctor: async () => doctorData,
  getServices: async () => servicesData,
  getServiceBySlug: async (slug) => servicesData.find((s) => s.slug === slug) ?? null,
  getCareJourney: async () => careJourney,

  getProducts: async ({ category = "all" } = {}) =>
    productsData.filter((p) => category === "all" || p.category === category),
  getProductBySlug: async (slug) => productsData.find((p) => p.slug === slug) ?? null,
  getProductCategories: async () => productCategories,
  getAllProductSlugs: async () => productsData.map((p) => ({ slug: p.slug })),

  getBlogs: async ({ featuredOnly = false } = {}) =>
    blogsData.filter((b) => (featuredOnly ? b.featured : true)).sort(byNewest),
  getBlogBySlug: async (slug) => blogsData.find((b) => b.slug === slug) ?? null,
  getBlogCategories: async () => blogCategories,
  getAllBlogSlugs: async () => blogsData.map((b) => ({ slug: b.slug })),

  getTestimonials: async () => ({ items: testimonialsData, summary: ratingSummary }),
  getFaqs: async () => faqData,

  getSiteSettings: async () => siteConfig,
  getPageSeo: async (key) => seoData[key] ?? null,
  getAllPageSeo: async () => [], // static seoData is already the base layer

  getImageSlots: async () => slotDefaults(), // no DB → every slot shows its Unsplash default
};
