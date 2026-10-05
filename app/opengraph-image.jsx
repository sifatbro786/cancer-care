import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/siteConfig";
import { doctorData } from "@/data/doctorData";
import { seoData } from "@/data/seoData";

/**
 * Default social preview (Facebook, WhatsApp, LinkedIn, X) for every page.
 * Blog posts and products override it with their own cover via metadata.
 * Rendered once at build time — no runtime cost.
 */
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0b3f3b",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 40 40">
            <rect width="40" height="40" rx="11" fill="#18897d" />
            <path
              fill="#fff"
              d="M20 8.5c-3.3 0-5.8 2.6-5.8 6 0 2.7 1.5 5.4 3.6 8.4l-6.9 11.2 3.3 1.7 5.8-9 5.8 9 3.3-1.7-6.9-11.2c2.1-3 3.6-5.7 3.6-8.4 0-3.4-2.5-6-5.8-6Zm0 3.4c1.5 0 2.5 1.1 2.5 2.7 0 1.6-1 3.6-2.5 5.8-1.5-2.2-2.5-4.2-2.5-5.8 0-1.6 1-2.7 2.5-2.7Z"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>{siteConfig.shortName}</div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#afddd4" }}>& MEDICAL SERVICES</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: 940 }}>
            {seoData.default.ogHeadline}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#d7efea" }}>
            {`${doctorData.designation} · ${siteConfig.address.line2}`}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#afddd4" }}>
          <span>{siteConfig.contact.phone}</span>
          <span>{siteConfig.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    size
  );
}
