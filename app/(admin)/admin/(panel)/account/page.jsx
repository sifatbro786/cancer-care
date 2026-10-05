import { authData } from "@/data/admin/authData";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata = { title: authData.meta.accountTitle };

export default async function AccountPage() {
  const user = await requireUser(); // any signed-in role may manage their own password
  const A = authData.account;

  return (
    <>
      <AdminPageHeader eyebrow={A.eyebrow} title={A.title} highlight={A.highlight} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="text-xl font-semibold">
            {A.profileHeading}
          </h2>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {[
              [user.name, user.email],
              [A.roleLabel, authData.roles[user.role] ?? user.role],
              [A.lastLoginLabel, user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"],
            ].map(([term, value], i) => (
              <div key={term} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className={i === 0 ? "font-semibold text-ink" : "text-ink-muted"}>{term}</dt>
                <dd className="text-ink-soft sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="password-heading">
          <h2 id="password-heading" className="text-xl font-semibold">
            {A.passwordHeading}
          </h2>
          <p className="mt-2 mb-6 text-ink-soft">{A.passwordIntro}</p>
          <ChangePasswordForm email={user.email} />
        </section>
      </div>
    </>
  );
}
