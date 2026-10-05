import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { authData } from "@/data/admin/authData";
import { logoutAction } from "@/app/(admin)/_actions/auth";
import { LogoMark } from "@/components/brand/Logo";
import AdminNavLink from "@/components/admin/AdminNavLink";

/**
 * Admin chrome. Desktop: quiet sidebar on paper-deep. Mobile: compact header + scrollable tab row
 * (two items today — a drawer arrives in B4 when the nav grows).
 * Sign-out is a <form> posting a Server Action: works without JS, CSRF-checked by Next.
 */
export default function AdminShell({ user, children }) {
  const S = authData.shell;
  const roleLabel = authData.roles[user.role] ?? user.role;

  const signOut = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-soft hover:bg-white hover:text-alert-700 focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        <LogOut aria-hidden="true" className="size-4" />
        {S.signOut}
      </button>
    </form>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-line bg-paper-deep lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-6">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <LogoMark className="size-8" />
            <span className="font-display text-[0.95rem] leading-tight font-bold">
              {S.brand}
              <span className="block text-[0.7rem] font-semibold tracking-[0.14em] text-brand-700 uppercase">
                {S.brandSub}
              </span>
            </span>
          </Link>
          <div className="lg:hidden">{signOut}</div>
        </div>

        <nav aria-label={S.navLabel} className="overflow-x-auto px-3 pb-3 lg:flex-1 lg:pb-0">
          <ul className="flex gap-1 lg:flex-col">
            {S.nav.map((item) => (
              <li key={item.href}>
                <AdminNavLink href={item.href} icon={item.icon}>
                  {item.label}
                </AdminNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden border-t border-line px-5 py-5 lg:block">
          <p className="truncate font-semibold text-ink">{user.name}</p>
          <p className="text-sm text-ink-muted">{roleLabel}</p>
          <div className="mt-3 flex flex-col items-start gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-soft hover:bg-white hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              {S.viewSite}
            </a>
            {signOut}
          </div>
        </div>
      </aside>

      <main id="main" tabIndex={-1} className="flex-1 px-4 py-8 outline-none sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
