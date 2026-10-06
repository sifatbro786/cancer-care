"use client";

import { createContext, useContext } from "react";
import { siteConfig } from "@/data/siteConfig";

/**
 * Live site settings for client components (Navbar, MobileNav, error boundary…).
 * The public layout passes the merged config (DB settings over data/siteConfig.js).
 * Outside the provider (root not-found, admin) the static config is the fallback.
 */
const SiteContext = createContext(siteConfig);

export function SiteProvider({ value, children }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
