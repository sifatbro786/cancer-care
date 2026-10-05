import Link from "next/link";
import { formatDate } from "@/lib/utils";
import SmartImage from "@/components/ui/SmartImage";

/** Vertical article card — used on /blog and in "Keep reading". */
export default function BlogCard({ post, categoryLabel, minLabel }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-mist">
        <SmartImage
          src={post.cover.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span className="font-semibold text-brand-700">{categoryLabel}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span>
          {post.readingMinutes} {minLabel}
        </span>
      </p>
      <h3 className="mt-2 text-xl leading-snug font-semibold">
        <Link
          href={`/blog/${post.slug}`}
          className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700 focus-visible:underline"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 leading-relaxed text-ink-soft">{post.excerpt}</p>
    </article>
  );
}
