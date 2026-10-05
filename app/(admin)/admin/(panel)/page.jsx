import { authData } from "@/data/admin/authData";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getOverviewCounts } from "@/services/admin/overview";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormAlert } from "@/components/ui/Field";

export const metadata = { title: authData.meta.overviewTitle };

export default async function OverviewPage({ searchParams }) {
  const user = await requireUser(PERMISSIONS.inboxRead);
  const O = authData.overview;
  const [counts, sp] = await Promise.all([getOverviewCounts(), searchParams]);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <AdminPageHeader eyebrow={O.eyebrow} title={O.greeting(firstName)} highlight={firstName} description={O.intro} />

      <div className="mb-8 flex flex-col gap-3 empty:hidden">
        {sp.denied ? <FormAlert>{O.denied}</FormAlert> : null}
        {!counts ? <FormAlert tone="info">{O.dbOff}</FormAlert> : null}
      </div>

      {counts ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          {O.cards.map((c) => {
            const value = counts[c.key];
            const flagged = c.key === "unsent" && value > 0;
            return (
              <div
                key={c.key}
                className={cn(
                  "flex flex-col gap-2 rounded-[1.25rem] bg-white p-6 ring-1 ring-line",
                  flagged && "ring-alert-600/30"
                )}
              >
                <dt className="font-semibold text-ink">{c.label}</dt>
                <dd className={cn("font-serif text-5xl leading-none", flagged ? "text-alert-700" : "text-brand-700")}>
                  {value}
                </dd>
                <dd className="text-sm text-ink-muted">{c.hint}</dd>
              </div>
            );
          })}
        </dl>
      ) : null}
    </>
  );
}
