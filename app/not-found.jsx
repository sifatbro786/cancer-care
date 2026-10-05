import { Phone } from "lucide-react";
import { notFoundData } from "@/data/notFoundData";
import { siteConfig } from "@/data/siteConfig";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

export const metadata = {
  title: notFoundData.title,
  robots: { index: false, follow: true },
};

/* Root not-found renders outside the (public) group, so it mounts the shell itself. */
export default function NotFound() {
  const [home, ...rest] = notFoundData.links;
  return (
    <>
      <TopBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="bg-chart flex-1 outline-none">
        <div className="container-site flex flex-col items-center gap-8 py-24 text-center sm:py-32">
          <p aria-hidden="true" className="font-display text-[7rem] leading-none font-bold text-brand-100 sm:text-[10rem]">
            404
          </p>
          <SectionHeading
            as="h1"
            eyebrow={notFoundData.eyebrow}
            title={notFoundData.title}
            highlight={notFoundData.highlight}
            description={notFoundData.description}
          />
          <p aria-hidden="true" className="-mt-2 -rotate-2 font-hand text-2xl text-coral-600">
            {notFoundData.note}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={home.href} withArrow>
              {home.label}
            </Button>
            {rest.map((l) => (
              <Button key={l.href} href={l.href} variant="secondary">
                {l.label}
              </Button>
            ))}
            <Button href={siteConfig.contact.phoneHref} variant="ghost" icon={Phone}>
              {siteConfig.contact.phone}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
