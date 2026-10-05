import Link from "next/link";
import { inboxData } from "@/data/admin/inboxData";

/** notFound() inside the admin (e.g. a deleted record) stays inside the admin shell. */
export default function AdminNotFound() {
  return (
    <div className="rounded-[1.25rem] bg-white px-6 py-12 text-center ring-1 ring-line">
      <p className="text-lg font-semibold">{inboxData.errors.notFound}</p>
      <Link href="/admin" className="mt-4 inline-block font-semibold text-brand-700 hover:text-brand-900">
        ← Overview
      </Link>
    </div>
  );
}
