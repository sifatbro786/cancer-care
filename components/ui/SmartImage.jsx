"use client";

import { useState } from "react";
import Image from "next/image";
import { FALLBACK_IMAGE } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * next/image wrapper with graceful fallback.
 * If a remote placeholder fails (404, blocked CDN, offline), it swaps to a
 * local, on-brand SVG so the layout never shows a broken-image icon.
 * Keyed on `src` by the parent if the source can change at runtime.
 */
export default function SmartImage({ src, alt, className, fallback = FALLBACK_IMAGE, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;

  return (
    <Image
      src={failed || !src ? fallback : src}
      alt={alt ?? ""}
      onError={() => setFailedSrc(src)}
      unoptimized={failed || !src}
      className={cn("bg-brand-50", className)}
      {...props}
    />
  );
}
