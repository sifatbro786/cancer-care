"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconByKey } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Exact match for the overview, prefix match for sections (/admin/orders/123 keeps "Orders" active).
 * `match` = extra section prefixes (e.g. medicine categories keep "Medicines" active).
 * `badge` = number of items waiting (hidden when 0); `badgeLabel` is the screen-reader text.
 */
export default function AdminNavLink({ href, match = [], icon, badge, badgeLabel, onNavigate, children }) {
  const pathname = usePathname();
  const under = (p) => pathname === p || pathname.startsWith(`${p}/`);
  const active = href === "/admin" ? pathname === href : under(href) || match.some(under);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.95rem] font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        active ? "bg-white text-brand-800 shadow-soft ring-1 ring-line" : "text-ink-soft hover:bg-white/70 hover:text-ink"
      )}
    >
      <IconByKey
        name={icon}
        aria-hidden="true"
        className={cn("size-[1.15rem]", active ? "text-brand-600" : "text-ink-muted")}
      />
      <span className="flex-1">{children}</span>
      {badge ? (
        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
          {badge > 99 ? "99+" : badge}
          <span className="sr-only"> {badgeLabel}</span>
        </span>
      ) : null}
    </Link>
  );
}
