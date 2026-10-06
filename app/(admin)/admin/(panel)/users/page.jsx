import { usersData } from "@/data/admin/usersData";
import { authData } from "@/data/admin/authData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";
import { listUsers } from "@/services/admin/users";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { StatusPill } from "@/components/admin/inbox/bits";
import CreateUserForm from "@/components/admin/users/CreateUserForm";
import UserActions from "@/components/admin/users/UserActions";
import { FormAlert } from "@/components/ui/Field";

export const metadata = { title: usersData.meta.title };

export default async function UsersPage() {
  const me = await requireUser(PERMISSIONS.usersManage);
  const U = usersData;
  const L = U.list;
  const header = <AdminPageHeader eyebrow={U.eyebrow} title={U.title} highlight={U.highlight} description={U.intro} />;

  if (!isDbConfigured()) {
    return (
      <>
        {header}
        <FormAlert tone="info">{authData.overview.dbOff}</FormAlert>
      </>
    );
  }

  const users = await listUsers();

  return (
    <>
      {header}

      <section aria-labelledby="create-heading" className="mb-14">
        <h2 id="create-heading" className="text-2xl font-semibold">
          {U.create.heading}
        </h2>
        <p className="mt-2 mb-6 max-w-2xl text-ink-soft">{U.create.intro}</p>
        <CreateUserForm />
      </section>

      <section aria-labelledby="users-heading">
        <h2 id="users-heading" className="mb-6 text-2xl font-semibold">
          {L.heading}
        </h2>
        <ul className="divide-y divide-line overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-line">
          {users.map((u) => {
            const self = u.id === me.id;
            return (
              <li key={u.id} className="flex flex-col gap-4 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {u.name}
                      {self ? <span className="ml-2 text-sm font-normal text-ink-muted">({L.you})</span> : null}
                    </p>
                    <p className="text-sm break-all text-ink-soft">{u.email}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {L.lastLogin}: {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : L.never}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusPill label={authData.roles[u.role] ?? u.role} tone={u.role === "super_admin" ? "brand" : "muted"} />
                    <StatusPill label={u.active ? L.active : L.disabled} tone={u.active ? "sage" : "alert"} />
                    {u.locked ? <StatusPill label={L.locked} tone="alert" /> : null}
                    {u.mustChangePassword ? <StatusPill label={L.mustChange} tone="muted" /> : null}
                  </div>
                </div>
                {self ? <p className="text-sm text-ink-muted">{L.selfHint}</p> : <UserActions user={u} />}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
