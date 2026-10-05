import { siteConfig } from "@/data/siteConfig";

/** /robots.txt — keep crawlers out of API routes; point them at the sitemap. */
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
