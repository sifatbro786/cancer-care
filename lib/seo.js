import { seoData } from "@/data/seoData";
import { siteConfig } from "@/data/siteConfig";
import { doctorData } from "@/data/doctorData";

/**
 * Build a Next.js Metadata object for a route key in `seoData`.
 * Usage in a page:  export const metadata = buildMetadata("about");
 * Dynamic routes:   generateMetadata → buildMetadata(null, { title, description, path, image })
 */
export function buildMetadata(key, overrides = {}) {
  const page = (key && seoData[key]) || {};
  const title = overrides.title ?? page.title;
  const description = overrides.description ?? page.description ?? seoData.default.description;
  const path = overrides.path ?? page.path ?? "/";
  // A page-level `openGraph` object replaces the parent's, including the file-based
  // app/opengraph-image — so point at it explicitly when the page has no own image.
  const images = overrides.image
    ? [{ url: overrides.image.src, alt: overrides.image.alt }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: overrides.type ?? "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: title ?? seoData.default.title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? seoData.default.title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

/** Root-level defaults — spread into `app/layout.jsx` metadata. */
export const rootMetadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: seoData.default.title,
    template: seoData.default.titleTemplate,
  },
  description: seoData.default.description,
  keywords: seoData.default.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: doctorData.name }],
  formatDetection: { telephone: true, address: true, email: true },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

/* ------------------------------------------------------------------
 * Structured data (schema.org JSON-LD)
 * ------------------------------------------------------------------ */

export function clinicJsonLd() {
  const { address, contact } = siteConfig;
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

export function physicianJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${siteConfig.url}/#physician`,
    name: doctorData.name,
    description: doctorData.summary,
    medicalSpecialty: "Oncologic",
    image: doctorData.photo.src,
    telephone: siteConfig.contact.phone,
    worksFor: { "@id": `${siteConfig.url}/#clinic` },
    affiliation: doctorData.affiliations.map((a) => ({ "@type": "Hospital", name: a.name })),
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
    sku: p.id,
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
