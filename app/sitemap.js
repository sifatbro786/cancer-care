import { siteConfig } from "@/data/siteConfig";
import { getAllProductSlugs, getBlogs } from "@/services/content";

/** /sitemap.xml — static routes + every blog post and product (regenerated each build). */
export default async function sitemap() {
  const base = siteConfig.url;
  const [posts, products] = await Promise.all([getBlogs(), getAllProductSlugs()]);

  const pages = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/appointment", priority: 0.9, changeFrequency: "monthly" },
    { path: "/patient-guide", priority: 0.8, changeFrequency: "monthly" },
    { path: "/shop", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  ].map((p) => ({ url: `${base}${p.path}`, priority: p.priority, changeFrequency: p.changeFrequency }));

  return [
    ...pages,
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
    ...products.map(({ slug }) => ({ url: `${base}/shop/${slug}`, changeFrequency: "weekly", priority: 0.5 })),
  ];
}
