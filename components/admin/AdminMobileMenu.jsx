"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { authData } from "@/data/admin/authData";
import Modal from "@/components/ui/Modal";
import AdminNavList from "@/components/admin/AdminNavList";

/** Mobile navigation in a native <dialog> (focus trap + Escape for free). Closes on navigation. */
export default function AdminMobileMenu({ items, badges, footer }) {
  const S = authData.shell;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-line hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        <Menu aria-hidden="true" className="size-4" />
        {S.menu}
      </button>
      <Modal open={open} onClose={close} title={S.menu} closeLabel={S.close}>
        <nav aria-label={S.navLabel}>
          <AdminNavList items={items} badges={badges} badgeLabel={S.badge} onNavigate={close} />
        </nav>
        <div className="mt-6 border-t border-line pt-5">{footer}</div>
      </Modal>
    </>
  );
}
