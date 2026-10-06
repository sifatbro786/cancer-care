"use client";

import { useEffect } from "react";
import { Phone, RotateCcw } from "lucide-react";
import { statusData } from "@/data/statusData";
import { useSite } from "@/components/providers/SiteProvider";
import Button from "@/components/ui/Button";

/** Error boundary for public pages — header/footer stay visible, user gets a way forward. */
export default function PublicError({ error, reset }) {
  const E = statusData.error;
  const siteConfig = useSite();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="container-site flex flex-col items-start gap-6 py-24 sm:py-32">
      <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">{E.title}</h1>
      <p className="max-w-xl text-lg leading-relaxed text-ink-soft">{E.text}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => reset()} icon={RotateCcw}>
          {E.retry}
        </Button>
        <Button href="/" variant="secondary">
          {E.home}
        </Button>
        <Button href={siteConfig.contact.phoneHref} variant="ghost" icon={Phone}>
          {siteConfig.contact.phone}
        </Button>
      </div>
    </div>
  );
}
