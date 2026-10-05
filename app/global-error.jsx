"use client";

import { statusData } from "@/data/statusData";
import { siteConfig } from "@/data/siteConfig";

/**
 * Last-resort boundary for errors in the root layout itself.
 * It replaces <html>, so it can't rely on globals.css or fonts — inline styles only.
 */
export default function GlobalError({ reset }) {
  const E = statusData.error;
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif", background: "#faf8f4", color: "#1c2b2c" }}>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>{E.title}</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#4a5a5c" }}>{E.text}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{ padding: "12px 20px", borderRadius: 12, border: 0, background: "#0e6e66", color: "#fff", fontSize: 16, cursor: "pointer" }}
            >
              {E.retry}
            </button>
            <a href={siteConfig.contact.phoneHref} style={{ padding: "12px 20px", color: "#0e6e66", fontSize: 16 }}>
              {siteConfig.contact.phone}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
