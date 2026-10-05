import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPageData } from "@/data/blogPageData";
import { siteConfig } from "@/data/siteConfig";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getAllBlogSlugs, getBlogBySlug, getBlogCategories, getBlogs } from "@/services/content";
import SmartImage from "@/components/ui/SmartImage";
import JsonLd from "@/components/seo/JsonLd";
import ArticleBody from "@/components/blog/ArticleBody";
import BlogCard from "@/components/blog/BlogCard";
import CtaBand from "@/components/sections/CtaBand";

/** Prerender every article at build time; unknown slugs → 404 (no runtime rendering). */
// Slugs known at build are pre-rendered; ones added later from the admin render on first
// visit and are cached (ISR). Unknown slugs still 404 via notFound().
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllBlogSlugs();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return {};
  return buildMetadata(null, {
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.cover,
    type: "article",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) notFound();

  const [all, categories] = await Promise.all([getBlogs(), getBlogCategories()]);
  const labelOf = (key) => categories.find((c) => c.key === key)?.label ?? key;
  // Prefer same-category articles, then fill with the latest others
  const related = [
    ...all.filter((p) => p.slug !== slug && p.category === post.category),
    ...all.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

  const L = blogPageData;
  const crumbs = [
    siteConfig.nav[0],
    { label: L.header.eyebrow, href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <article>
        <header className="container-site max-w-4xl pt-10 sm:pt-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand-700"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {L.backLabel}
          </Link>
          <p className="mt-10 text-sm font-semibold tracking-wide text-brand-700 uppercase">{labelOf(post.category)}</p>
          <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-[-0.025em] sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">{post.excerpt}</p>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-5 text-sm text-ink-muted">
            <span>
              {L.byLabel} <span className="font-semibold text-ink">{post.author}</span>
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>
              {post.readingMinutes} {L.minLabel}
            </span>
          </p>
        </header>

        <div className="container-site mt-10 max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-mist">
            <SmartImage
              src={post.cover.src}
              alt={post.cover.alt}
              fill
              preload
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="container-site max-w-[44rem] py-12 sm:py-16">
          <ArticleBody blocks={post.content} />
          <p className="mt-14 border-t border-line pt-6 text-sm leading-relaxed text-ink-muted">{L.disclaimer}</p>
        </div>
      </article>

      {related.length ? (
        <section aria-labelledby="related-title" className="border-t border-line bg-white py-16 sm:py-20">
          <div className="container-site">
            <h2 id="related-title" className="text-3xl font-semibold">
              {L.relatedTitle}
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <BlogCard post={p} categoryLabel={labelOf(p.category)} minLabel={L.minLabel} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand title={L.cta.title} primary={L.cta.primary} />
      <JsonLd data={[articleJsonLd(post), breadcrumbJsonLd(crumbs)]} />
    </>
  );
}
