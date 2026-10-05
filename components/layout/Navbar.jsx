"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import MobileNav from "@/components/layout/MobileNav";

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Dropdown({ item, active }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const menuId = useId();

  // Close on outside click / Escape (returns focus to trigger for keyboard users)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        wrapRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      // Hover only for real mice; touch & keyboard use the click toggle below
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          if (e.nativeEvent.pointerType === "mouse") return; // already opened by hover
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex h-11 items-center gap-1 rounded-lg px-3 text-[0.95rem] font-medium transition-colors",
          active ? "text-brand-700" : "text-ink-soft hover:text-ink"
        )}
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            id={menuId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-1/2 z-50 w-80 -translate-x-1/2 pt-2"
          >
            <ul className="rounded-2xl bg-white p-2 shadow-lift ring-1 ring-line">
              {item.children.map((child) => {
                const Icon = getIcon(child.icon);
                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] text-ink hover:bg-brand-50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      {child.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-1 border-t border-line pt-1">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  View all services →
                </Link>
              </li>
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { nav, cta, contact } = siteConfig;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-line/80 bg-white/90 shadow-[0_6px_24px_-16px_rgb(28_43_44/0.35)] backdrop-blur-md"
          : "border-transparent bg-paper"
      )}
    >
      <nav aria-label="Main" className="container-site flex h-20 items-center justify-between gap-4">
        <Logo />

        <ul className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                {item.children ? (
                  <Dropdown item={item} active={active} />
                ) : (
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center rounded-lg px-3 text-[0.95rem] font-medium transition-colors",
                      active ? "text-brand-700" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-coral-400"
                      />
                    ) : null}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={contact.phoneHref}
            aria-label={`Call ${contact.phone}`}
            className="hidden size-12 place-items-center rounded-xl bg-white text-brand-700 ring-1 ring-line hover:ring-brand-300 sm:grid xl:hidden"
          >
            <Phone aria-hidden="true" className="size-5" />
          </a>
          <Button href={cta.primary.href} withArrow className="hidden sm:inline-flex">
            {cta.primary.label}
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="grid size-12 place-items-center rounded-xl bg-white text-ink ring-1 ring-line lg:hidden"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>
        </div>
      </nav>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
    </header>
  );
}
