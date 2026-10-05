import { homeData } from "@/data/homeData";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import {
  getBlogCategories,
  getBlogs,
  getCareJourney,
  getDoctor,
  getFaqs,
  getServices,
  getTestimonials,
} from "@/services/content";
import JsonLd from "@/components/seo/JsonLd";
import HeroSection from "@/components/home/HeroSection";
import InfoStrip from "@/components/home/InfoStrip";
import IntroStatement from "@/components/home/IntroStatement";
import DoctorOverview from "@/components/home/DoctorOverview";
import ServicesGrid from "@/components/home/ServicesGrid";
import CareJourney from "@/components/home/CareJourney";
import Testimonials from "@/components/home/Testimonials";
import EmergencyContactBanner from "@/components/home/EmergencyContactBanner";
import HealthBlogSection from "@/components/home/HealthBlogSection";
import FaqSection from "@/components/home/FaqSection";
import FinalCta from "@/components/home/FinalCta";

export const metadata = buildMetadata("home");

export default async function HomePage() {
  // Independent reads run in parallel — same pattern once these hit the database.
  const [doctor, services, journey, testimonials, posts, categories, faqs] = await Promise.all([
    getDoctor(),
    getServices(),
    getCareJourney(),
    getTestimonials(),
    getBlogs({ featuredOnly: true, limit: 3 }),
    getBlogCategories(),
    getFaqs(),
  ]);

  return (
    <>
      <HeroSection data={homeData.hero} />
      <InfoStrip data={homeData.infoStrip} />
      <IntroStatement data={homeData.intro} stats={doctor.stats} />
      <DoctorOverview data={homeData.doctor} doctor={doctor} />
      <ServicesGrid data={homeData.services} services={services} />
      <CareJourney data={homeData.journey} steps={journey} />
      <Testimonials data={homeData.testimonials} testimonials={testimonials} />
      <EmergencyContactBanner data={homeData.emergency} />
      <HealthBlogSection data={homeData.blog} posts={posts} categories={categories} />
      <FaqSection data={homeData.faq} faqs={faqs} />
      <FinalCta data={homeData.finalCta} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
