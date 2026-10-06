import { Atkinson_Hyperlegible_Next, Newsreader, Onest } from "next/font/google";
import "./globals.css";
import { rootMetadata } from "@/lib/seo";
import MotionProvider from "@/components/providers/MotionProvider";

/* Body: Atkinson Hyperlegible — designed for low-vision readers (elderly patients). */
const body = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  // Next has no metric data for this newer family → it can't auto-build a
  // size-adjusted fallback (that's the dev warning). Disable it and pick a
  // fallback with similar x-height; Atkinson is close to Verdana/Arial.
  adjustFontFallback: false,
  fallback: ["Verdana", "Arial", "system-ui", "sans-serif"],
});

/* Headings: Onest — warm, humanist geometric sans. */
const heading = Onest({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

/* Editorial serif accent — italic words, pull quotes, numerals. Used sparingly. */
const accent = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata = rootMetadata;

export const viewport = {
  themeColor: "#0e6e66",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${body.variable} ${heading.variable} ${accent.variable}`}
    >
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
