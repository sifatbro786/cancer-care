import { legalData } from "@/data/legalData";
import { buildMetadata } from "@/lib/seo";
import { getSeoConfig, getSiteConfig } from "@/services/content";
import LegalDocument from "@/components/legal/LegalDocument";

export async function generateMetadata() {
  return buildMetadata("terms", {}, await getSeoConfig());
}

export default async function TermsPage() {
  return <LegalDocument doc={legalData.terms} site={await getSiteConfig()} crumbHref="/terms" />;
}
