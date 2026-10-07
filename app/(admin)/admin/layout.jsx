/**
 * Admin route group root. Shares the root <html>/<body> (fonts, tokens) but none of the
 * public chrome. Never indexed: noindex here + X-Robots-Tag header (next.config) + robots.txt.
 */
export const metadata = {
  title: { template: "%s · Admin · Medicare Haven", default: "Admin · Medicare Haven" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-paper">{children}</div>;
}
