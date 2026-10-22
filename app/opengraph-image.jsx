import { readFile } from "node:fs/promises";
import { join } from "node:path";
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

export default async function OpengraphImage() {
  const logoSrc = `data:image/png;base64,${(await readFile(join(process.cwd(), "public", siteConfig.logo.src))).toString("base64")}`;

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
          background: "#5d0a37",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", background: "#ffffff", borderRadius: 24, padding: "16px 28px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" height={96} width={Math.round((96 * siteConfig.logo.width) / siteConfig.logo.height)} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: 940 }}>
            {seoData.default.ogHeadline}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#fce6ee" }}>
            {`${doctorData.designation} · ${siteConfig.address.line2}`}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#f7cbdc" }}>
          <span>{siteConfig.contact.phone}</span>
          <span>{siteConfig.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    size
  );
}
