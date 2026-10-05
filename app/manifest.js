import { siteConfig } from "@/data/siteConfig";

/** /manifest.webmanifest — "Add to home screen" name, colours and icon. */
export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#0e6e66",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
