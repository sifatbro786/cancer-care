import AdminNavLink from "@/components/admin/AdminNavLink";

/**
 * Sidebar / mobile-menu item list. A small group heading is shown where `item.group` changes
 * (inbox items have none; then "Content", "You"). Headings are presentational — the links
 * themselves carry the names screen readers announce.
 */
export default function AdminNavList({ items, badges, badgeLabel, onNavigate }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, i) => {
        const heading = item.group && item.group !== items[i - 1]?.group ? item.group : null;
        return (
          <li key={item.href}>
            {heading ? (
              <p aria-hidden="true" className="mt-5 mb-1.5 px-3.5 text-[0.7rem] font-bold tracking-[0.14em] text-ink-muted uppercase">
                {heading}
              </p>
            ) : null}
            <AdminNavLink
              href={item.href}
              match={item.match}
              icon={item.icon}
              badge={item.badge ? badges?.[item.badge] : 0}
              badgeLabel={badgeLabel(badges?.[item.badge] ?? 0)}
              onNavigate={onNavigate}
            >
              {item.label}
            </AdminNavLink>
          </li>
        );
      })}
    </ul>
  );
}
