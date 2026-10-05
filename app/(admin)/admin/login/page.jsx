import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authData } from "@/data/admin/authData";
import { safeAdminPath } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";
import { getImageSlots } from "@/services/content";
import Logo from "@/components/brand/Logo";
import AccentText from "@/components/ui/AccentText";
import { Eyebrow } from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: authData.meta.loginTitle };

export default async function LoginPage({ searchParams }) {
  const L = authData.login;
  const sp = await searchParams;
  const next = safeAdminPath(typeof sp.next === "string" ? sp.next : undefined);

  // Already signed in (verified against the DB, not just the cookie) → straight in.
  // A DB hiccup must not block the login page itself, so failures fall through to the form.
  const [user, slots] = await Promise.all([getCurrentUser().catch(() => null), getImageSlots().catch(() => null)]);
  if (user) redirect(next);
  const panelImage = slots?.careHands ?? null;

  const notice = sp.reason === "expired" ? authData.errors.sessionExpired : null;

  return (
    <main id="main" tabIndex={-1} className="grid flex-1 outline-none lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
        <Logo />

        <div className="flex flex-1 items-center py-12">
          <div className="w-full max-w-sm">
            <Eyebrow>{L.eyebrow}</Eyebrow>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              <AccentText text={L.title} accent={L.highlight} className="text-brand-700" />
            </h1>
            <p className="mt-3 text-ink-soft">{L.intro}</p>

            <div className="mt-8">
              <LoginForm next={next} notice={notice} />
            </div>

            <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">{L.footnote}</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {L.backToSite}
        </Link>
      </div>

      <div aria-hidden="true" className="relative hidden p-4 lg:block">
        <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-brand-50">
          {panelImage ? (
            <SmartImage src={panelImage.src} alt="" fill sizes="50vw" preload className="object-cover" />
          ) : null}
        </div>
      </div>
    </main>
  );
}
