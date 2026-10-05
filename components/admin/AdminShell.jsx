import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { authData } from "@/data/admin/authData";
import { logoutAction } from "@/app/(admin)/_actions/auth";
import { can } from "@/lib/auth/rbac";
import { LogoMark } from "@/components/brand/Logo";
import AdminNavLink from "@/components/admin/AdminNavLink";
import AdminMobileMenu from "@/components/admin/AdminMobileMenu";

/**
 * Admin chrome. Desktop (lg+): sticky sidebar with waiting-item badges.
 * Mobile: compact header + a <dialog> menu. Nav items are filtered by role (cosmetic —
 * every page and action re-checks its own permission).
 * Sign-out is a <form> posting a Server Action: works without JS, CSRF-checked by Next.
 */
export default function AdminShell({ user, badges, children }) {
  const S = authData.shell;
  const roleLabel = authData.roles[user.role] ?? user.role;
  const items = S.nav.filter((item) => !item.permission || can(user.role, item.permission));
  const waiting = items.reduce((n, i) => n + (i.badge ? (badges?.[i.badge] ?? 0) : 0), 0);

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

  const userBlock = (
    <>
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
    </>
  );

  const brand = (
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
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper-deep px-4 py-3 lg:hidden">
        {brand}
        <div className="flex items-center gap-2">
          {waiting ? (
            <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
              {waiting}
              <span className="sr-only"> {S.badge(waiting)}</span>
            </span>
          ) : null}
          <AdminMobileMenu items={items} badges={badges} footer={userBlock} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-line bg-paper-deep lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="px-5 py-6">{brand}</div>
        <nav aria-label={S.navLabel} className="flex-1 overflow-y-auto px-3">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <AdminNavLink
                  href={item.href}
                  icon={item.icon}
                  badge={item.badge ? badges?.[item.badge] : 0}
                  badgeLabel={S.badge(badges?.[item.badge] ?? 0)}
                >
                  {item.label}
                </AdminNavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line px-5 py-5">{userBlock}</div>
      </aside>

      <main id="main" tabIndex={-1} className="flex-1 px-4 py-8 outline-none sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
