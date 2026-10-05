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
  withSlots,
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
  const [doctor, services, journey, testimonials, posts, categories, faqs, home] = await Promise.all([
    getDoctor(),
    getServices(),
    getCareJourney(),
    getTestimonials(),
    getBlogs({ featuredOnly: true, limit: 3 }),
    getBlogCategories(),
    getFaqs(),
    withSlots(homeData), // admin-uploaded images replace Unsplash defaults
  ]);

  return (
    <>
      <HeroSection data={home.hero} />
      <InfoStrip data={home.infoStrip} />
      <IntroStatement data={home.intro} stats={doctor.stats} />
      <DoctorOverview data={home.doctor} doctor={doctor} />
      <ServicesGrid data={home.services} services={services} />
      <CareJourney data={home.journey} steps={journey} />
      <Testimonials data={home.testimonials} testimonials={testimonials} />
      <EmergencyContactBanner data={home.emergency} />
      <HealthBlogSection data={home.blog} posts={posts} categories={categories} />
      <FaqSection data={home.faq} faqs={faqs} />
      <FinalCta data={home.finalCta} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
