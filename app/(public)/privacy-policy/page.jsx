import { legalData } from "@/data/legalData";
import { buildMetadata } from "@/lib/seo";
import { getSeoConfig, getSiteConfig } from "@/services/content";
import LegalDocument from "@/components/legal/LegalDocument";

export async function generateMetadata() {
  return buildMetadata("privacy", {}, await getSeoConfig());
}

export default async function PrivacyPolicyPage() {
  return <LegalDocument doc={legalData.privacy} site={await getSiteConfig()} crumbHref="/privacy-policy" />;
}
