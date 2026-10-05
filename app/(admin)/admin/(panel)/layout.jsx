import { isDbConfigured } from "@/lib/db/connect";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { getInboxBadges } from "@/services/admin/inbox";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Every page under (panel) requires a valid, DB-verified session.
 * Per-page permissions are checked again in each page (requireUser(PERMISSION)),
 * and in every Server Action — layouts don't re-run on client navigation, so they
 * are never the only check.
 */
export default async function PanelLayout({ children }) {
  const user = await requireUser();
  // Badges are a convenience: a DB hiccup must not take the whole admin down.
  const badges =
    isDbConfigured() && can(user.role, PERMISSIONS.inboxRead) ? await getInboxBadges().catch(() => null) : null;
  return (
    <AdminShell user={user} badges={badges}>
      {children}
    </AdminShell>
  );
}
