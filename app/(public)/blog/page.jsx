import { blogPageData } from "@/data/blogPageData";
import { siteConfig } from "@/data/siteConfig";
import { buildMetadata } from "@/lib/seo";
import { getBlogCategories, getBlogs } from "@/services/content";
import PageHeader from "@/components/layout/PageHeader";
import BlogList from "@/components/blog/BlogList";

export const metadata = buildMetadata("blog");

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getBlogs(), getBlogCategories()]);
  const { header } = blogPageData;

  return (
    <>
      <PageHeader
        crumbs={[siteConfig.nav[0], { label: header.eyebrow, href: "/blog" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
      />
      <section aria-label={header.title} className="container-site py-14 sm:py-20">
        <BlogList posts={posts} categories={categories} labels={blogPageData} />
      </section>
    </>
  );
}
