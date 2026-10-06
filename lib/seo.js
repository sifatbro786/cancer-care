import { seoData } from "@/data/seoData";
import { siteConfig } from "@/data/siteConfig";
import { doctorData } from "@/data/doctorData";

const filled = (v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);

/**
 * data/seoData.js (base) + PageSeo records from Admin → SEO (B6).
 * A non-empty DB value wins; an empty one falls back to the code default.
 * `noindex` is a plain switch, so the DB value always applies.
 */
export function mergeSeo(base, records = []) {
  const out = { ...base };
  for (const r of records) {
    if (!r?.key || !Object.hasOwn(base, r.key)) continue; // only known routes
    const page = { ...base[r.key] };
    for (const f of ["title", "description", "titleTemplate", "ogHeadline", "keywords", "ogImage"]) {
      if (filled(r[f])) page[f] = r[f];
    }
    page.noindex = Boolean(r.noindex);
    out[r.key] = page;
  }
  return out;
}

/**
 * Build a Next.js Metadata object for a route key in the SEO config.
 * Usage in a page:  export async function generateMetadata() { return buildMetadata("about", {}, await getSeoConfig()); }
 * Dynamic routes:   buildMetadata(null, { title, description, path, image }, seo)
 * `seo` defaults to the static data/seoData.js (build-time / no-DB use).
 */
export function buildMetadata(key, overrides = {}, seo = seoData) {
  const page = (key && seo[key]) || {};
  const defaults = seo.default ?? seoData.default;
  const title = overrides.title ?? page.title;
  const description = overrides.description ?? page.description ?? defaults.description;
  const path = overrides.path ?? page.path ?? "/";
  const image = overrides.image ?? page.ogImage;
  // A page-level `openGraph` object replaces the parent's, including the file-based
  // app/opengraph-image — so point at it explicitly when the page has no own image.
  const images = image?.src
    ? [{ url: image.src, alt: image.alt }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }];
  const noindex = overrides.noindex ?? page.noindex;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: overrides.type ?? "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: title ?? defaults.title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? defaults.title,
      description,
      images,
    },
  };
}

/** Root-level defaults — app/layout.jsx generateMetadata (live) or as a static fallback. */
export function buildRootMetadata(seo = seoData) {
  const d = seo.default ?? seoData.default;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: d.title, template: d.titleTemplate },
    description: d.description,
    keywords: d.keywords,
    applicationName: siteConfig.name,
    authors: [{ name: doctorData.name }],
    formatDetection: { telephone: true, address: true, email: true },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

export const rootMetadata = buildRootMetadata();

/* ------------------------------------------------------------------
 * Structured data (schema.org JSON-LD)
 * ------------------------------------------------------------------ */

export function clinicJsonLd(site = siteConfig) {
  const { address, contact } = site;
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${siteConfig.url}/#clinic`,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: contact.phone,
    email: contact.email,
    medicalSpecialty: "Oncologic",
    address: {
      "@type": "PostalAddress",
      streetAddress: address.line1.replace("Chamber — ", ""),
      addressLocality: "Dhaka Cantonment",
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: address.geo.lat, longitude: address.geo.lng },
    availableService: [
      { "@type": "MedicalTherapy", name: "Day Care Chemotherapy" },
      { "@type": "MedicalProcedure", name: "Oncology Consultation" },
    ],
  };
}

export function physicianJsonLd(doctor = doctorData, site = siteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${siteConfig.url}/#physician`,
    name: doctor.name,
    description: doctor.summary,
    medicalSpecialty: "Oncologic",
    image: doctor.photo?.src,
    telephone: site.contact.phone,
    worksFor: { "@id": `${siteConfig.url}/#clinic` },
    affiliation: (doctor.affiliations ?? []).map((a) => ({ "@type": "Hospital", name: a.name })),
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
  };
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: new URL(it.href, siteConfig.url).toString(),
    })),
  };
}

export function articleJsonLd(post) {
  const url = new URL(`/blog/${post.slug}`, siteConfig.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${url}#article`,
    url,
    headline: post.title,
    description: post.excerpt,
    image: post.cover?.src,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": post.author.startsWith("Dr.") ? "Physician" : "Organization", name: post.author },
    publisher: { "@id": `${siteConfig.url}/#clinic` },
    inLanguage: "en",
  };
}

export function productJsonLd(p) {
  const url = new URL(`/shop/${p.slug}`, siteConfig.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.description,
    image: p.image?.src,
    sku: p.sku ?? p.id,
    brand: { "@type": "Brand", name: p.manufacturer },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${siteConfig.url}/#clinic` },
    },
  };
}
