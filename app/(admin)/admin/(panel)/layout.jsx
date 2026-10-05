import { requireUser } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Every page under (panel) requires a valid, DB-verified session.
 * Per-page permissions are checked again in each page (requireUser(PERMISSION)),
 * and in every Server Action — layouts don't re-run on client navigation, so they
 * are never the only check.
 */
export default async function PanelLayout({ children }) {
  const user = await requireUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
