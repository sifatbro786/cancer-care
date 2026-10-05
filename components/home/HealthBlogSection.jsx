import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/motion/Reveal";

function PostCard({ post, categoryLabel, labels, large = false }) {
  return (
    <article
      className={cn(
        "group relative flex h-full overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line transition-shadow hover:shadow-lift focus-within:shadow-lift",
        large ? "flex-col" : "flex-col sm:flex-row"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          large ? "aspect-[16/10]" : "aspect-[16/10] sm:aspect-auto sm:w-[42%]"
        )}
      >
        <SmartImage
          src={post.cover.src}
          alt=""
          fill
          sizes={large ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 100vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <Badge tone="glass" className="absolute top-4 left-4">
          {categoryLabel}
        </Badge>
      </div>
      <div className={cn("flex flex-1 flex-col", large ? "p-7" : "p-6")}>
        <p className="flex items-center gap-3 text-sm text-ink-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5" />
            {post.readingMinutes} {labels.minLabel}
          </span>
        </p>
        <h3 className={cn("mt-3 leading-snug font-semibold", large ? "text-2xl sm:text-[1.7rem]" : "text-lg")}>
          <Link
            href={`/blog/${post.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700"
          >
            {post.title}
          </Link>
        </h3>
        {large ? <p className="mt-3 leading-relaxed text-ink-soft">{post.excerpt}</p> : null}
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-700"
        >
          {labels.readLabel}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}

export default function HealthBlogSection({ data, posts, categories }) {
  const { eyebrow, title, highlight, cta } = data;
  const labelOf = (key) => categories.find((c) => c.key === key)?.label ?? key;
  const [lead, ...rest] = posts;
  if (!lead) return null;

  return (
    <section aria-labelledby="blog-title" className="py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading id="blog-title" eyebrow={eyebrow} title={title} highlight={highlight} align="left" />
          <Button href={cta.href} variant="secondary" withArrow className="shrink-0 self-start sm:self-auto">
            {cta.label}
          </Button>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <PostCard post={lead} categoryLabel={labelOf(lead.category)} labels={data} large />
          </Reveal>
          <ul className="grid gap-5 lg:col-span-5">
            {rest.map((post, i) => (
              <Reveal as="li" key={post.id} delay={0.08 * (i + 1)}>
                <PostCard post={post} categoryLabel={labelOf(post.category)} labels={data} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
