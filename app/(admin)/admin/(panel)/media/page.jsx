import Link from "next/link";
import { mediaData } from "@/data/admin/mediaData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { getSlotStates, listMedia } from "@/services/admin/media";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MediaUploader from "@/components/admin/media/MediaUploader";
import SlotGrid from "@/components/admin/media/SlotGrid";
import LibraryItem from "@/components/admin/media/LibraryItem";
import { FormAlert } from "@/components/ui/Field";

export const metadata = { title: mediaData.meta.title };

const pagerLink =
  "rounded-lg px-3.5 py-2 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-brand-500";

export default async function MediaPage({ searchParams }) {
  await requireUser(PERMISSIONS.contentWrite);
  const M = mediaData;

  if (!isDbConfigured()) {
    return (
      <>
        <AdminPageHeader eyebrow={M.eyebrow} title={M.title} highlight={M.highlight} description={M.intro} />
        <FormAlert tone="info">{M.errors.noSettings}</FormAlert>
      </>
    );
  }

  const sp = await searchParams;
  const [slotState, library] = await Promise.all([getSlotStates(), listMedia({ page: sp.page })]);

  return (
    <>
      <AdminPageHeader eyebrow={M.eyebrow} title={M.title} highlight={M.highlight} description={M.intro} />

      <section aria-labelledby="slots-heading" className="mb-16">
        <h2 id="slots-heading" className="text-2xl font-semibold">
          {M.slots.heading}
        </h2>
        <p className="mt-2 mb-6 max-w-2xl text-ink-soft">{M.slots.intro}</p>
        {!slotState.ready ? (
          <div className="mb-6">
            <FormAlert tone="info">{M.slots.notReady}</FormAlert>
          </div>
        ) : null}
        <SlotGrid slots={slotState.slots} library={library.page === 1 ? library.items : []} disabled={!slotState.ready} />
      </section>

      <section aria-labelledby="library-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="library-heading" className="text-2xl font-semibold">
              {M.library.heading}
            </h2>
            <p className="mt-2 max-w-2xl text-ink-soft">{M.library.intro}</p>
          </div>
          <p className="text-sm text-ink-muted">{M.library.count(library.total)}</p>
        </div>

        <div className="mt-6">
          <MediaUploader />
        </div>

        {library.items.length ? (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {library.items.map((item) => (
              <LibraryItem key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-ink-muted">{M.library.empty}</p>
        )}

        {library.pages > 1 ? (
          <nav aria-label={M.library.heading} className="mt-8 flex items-center justify-between">
            {library.page > 1 ? (
              <Link href={`/admin/media?page=${library.page - 1}`} className={pagerLink}>
                ← {M.library.prev}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-ink-muted">
              {library.page} / {library.pages}
            </span>
            {library.page < library.pages ? (
              <Link href={`/admin/media?page=${library.page + 1}`} className={pagerLink}>
                {M.library.next} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </>
  );
}
