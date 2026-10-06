import { doctorData } from "@/data/doctorData";
import { clinicJsonLd, physicianJsonLd } from "@/lib/seo";
import { getDoctor, getSiteConfig } from "@/services/content";
import { SiteProvider } from "@/components/providers/SiteProvider";
import JsonLd from "@/components/seo/JsonLd";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Public site shell. The `app/(admin)/` group has its own layout,
 * so the dashboard never ships the marketing navbar/footer JS.
 * Site settings (contact, hours, socials) are read once here (cached, tag `site-settings`)
 * and handed to client components through SiteProvider.
 */
export default async function PublicLayout({ children }) {
  const [site, doctor] = await Promise.all([getSiteConfig(), getDoctor().catch(() => doctorData)]);

  return (
    <SiteProvider value={site}>
      <TopBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <JsonLd data={[clinicJsonLd(site), physicianJsonLd(doctor, site)]} />
    </SiteProvider>
  );
}
