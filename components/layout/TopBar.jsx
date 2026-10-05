import { Clock, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { brandIconMap } from "@/components/icons/BrandIcons";

export default function TopBar() {
  const { contact, address, hours, social, emergencyNote } = siteConfig;
  const chamber = hours[0];

  return (
    <div className="bg-brand-950 text-[0.8rem] whitespace-nowrap text-brand-100">
      <div className="container-site flex h-10 items-center justify-between gap-6">
        <ul className="flex min-w-0 items-center gap-5">
          <li>
            <a
              href={contact.phoneHref}
              className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-brand-200"
            >
              <Phone aria-hidden="true" className="size-3.5" />
              {contact.phone}
            </a>
          </li>
          <li className="hidden min-w-0 items-center gap-1.5 md:inline-flex">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{address.full}</span>
          </li>
          <li className="hidden items-center gap-1.5 xl:inline-flex">
            <Clock aria-hidden="true" className="size-3.5" />
            {chamber.label}: {chamber.days}, {chamber.time}
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <p className="hidden items-center gap-2 2xl:inline-flex">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral-400 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-coral-400" />
            </span>
            {emergencyNote}
          </p>
          <ul className="flex items-center gap-1" aria-label="Social media">
            {social.map((s) => {
              const Icon = brandIconMap[s.key];
              return (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-8 place-items-center rounded-md text-brand-200 hover:bg-white/10 hover:text-white"
                  >
                    {Icon ? <Icon className="size-3.5" /> : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
