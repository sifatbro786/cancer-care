import { Atkinson_Hyperlegible_Next, Caveat, Onest } from "next/font/google";
import "./globals.css";
import { rootMetadata, clinicJsonLd, physicianJsonLd } from "@/lib/seo";
import MotionProvider from "@/components/providers/MotionProvider";
import JsonLd from "@/components/seo/JsonLd";

/* Body: Atkinson Hyperlegible — designed for low-vision readers (elderly patients). */
const body = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* Headings: Onest — warm, humanist geometric sans. */
const heading = Onest({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

/* Handwritten accent — used sparingly for human, note-like touches. */
const handwritten = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-handwritten",
  display: "swap",
  preload: false,
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
      className={`${body.variable} ${heading.variable} ${handwritten.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <JsonLd data={[clinicJsonLd(), physicianJsonLd()]} />
      </body>
    </html>
  );
}
