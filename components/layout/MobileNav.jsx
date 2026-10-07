"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown, Clock, MapPin, Phone, X } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { useSite } from "@/components/providers/SiteProvider";
import { IconByKey } from "@/lib/icons";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ open, onClose, pathname }) {
  const panelRef = useRef(null);
  const [expanded, setExpanded] = useState(null);
  const { nav, cta, contact, address, hours } = useSite();
  const whatsappHref = whatsappLink(contact);

  // Scroll lock + focus management + Escape + focus trap
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => panelRef.current?.querySelector(FOCUSABLE)?.focus());

    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <m.div
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-950/40 backdrop-blur-[2px]"
          />
          <m.div
            ref={panelRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-paper shadow-2xl"
          >
            <div className="flex h-20 items-center justify-between border-b border-line px-5">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-xl bg-white ring-1 ring-line"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <ul className="flex flex-col gap-1 px-3 py-4">
              {nav.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                if (item.children) {
                  const isOpen = expanded === item.href;
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : item.href)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-lg font-medium",
                          active ? "bg-brand-50 text-brand-800" : "text-ink"
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn("size-5 transition-transform", isOpen && "rotate-180")}
                        />
                      </button>
                      {isOpen ? (
                        <ul className="ml-4 border-l-2 border-brand-100 py-1 pl-3">
                          {[...item.children, { label: "All services", href: item.href }].map((c) => (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={onClose}
                                className="block rounded-lg px-3 py-2.5 text-base text-ink-soft hover:bg-brand-50 hover:text-ink"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-lg font-medium",
                        active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-white"
                      )}
                    >
                      {item.icon ? (
                        <IconByKey name={item.icon} aria-hidden="true" className="size-5 text-brand-600" />
                      ) : null}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto flex flex-col gap-3 border-t border-line bg-white px-5 py-6">
              <Button href={cta.primary.href} onClick={onClose} withArrow size="lg" className="w-full justify-between pl-6">
                {cta.primary.label}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button href={contact.phoneHref} variant="secondary" icon={Phone}>
                  Call
                </Button>
                <Button href={whatsappHref} variant="secondary" icon={WhatsappIcon}>
                  WhatsApp
                </Button>
              </div>
              <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {address.full}
              </p>
              <p className="flex items-start gap-2 text-sm text-ink-soft">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {hours[0].label}: {hours[0].days}, {hours[0].time}
              </p>
            </div>
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
