"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconByKey } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Exact match for the overview, prefix match for sections (so /admin/orders/123 keeps "Orders" active). */
export default function AdminNavLink({ href, icon, children }) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
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
      {children}
    </Link>
  );
}
