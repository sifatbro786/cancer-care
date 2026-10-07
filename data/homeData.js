import { media } from "@/data/media";

/**
 * Homepage copy & section config.
 * Entities (doctor, services, testimonials, blogs, FAQ) come from their own
 * data files via `services/content.js`; this file holds only page-level copy.
 */
export const homeData = {
  hero: {
    eyebrow: "Day Care Chemotherapy · Chamber · Telemedicine",
    title: "Chemotherapy and cancer care, close to home in Dhaka",
    highlight: "close to home in Dhaka",
    description:
      "Specialised oncology consultation, safe same-day chemotherapy and genuine medicine support — guided by an experienced oncologist who takes the time to explain.",
    primaryCta: { label: "Book Consultation", href: "/appointment" },
    secondaryCta: { label: "Order Medicines", href: "/shop" },
    image: media.hero,
    proof: {
      value: "8,000+",
      label: "chemotherapy sessions supervised",
      initials: ["SA", "MH", "RI", "NS"],
    },
    trust: [
      "Protocol-based chemotherapy",
      "Oncology-trained nurses",
      "Online video consultation",
      "Verified prescription medicines",
      "Families welcome in every decision",
      "Marks Medical College affiliation",
    ],
  },

  infoStrip: {
    hours: {
      icon: "calendar",
      title: "Chamber hours",
      lines: ["Sat – Thu: 5:00 PM – 9:00 PM", "Day care chemo: 9:00 AM – 4:00 PM"],
      footnote: "Phone guidance for registered patients",
      footnoteStrong: "24/7",
    },
    call: {
      title: "Call us for quick guidance, questions or an appointment.",
    },
    directions: {
      icon: "hospital",
      title: "Directions",
      linkLabel: "Show on map",
    },
    schedule: {
      title: "Book your consultation online in a few simple steps.",
      cta: { label: "Book Appointment", href: "/appointment" },
      image: media.reportReview,
    },
  },

  intro: {
    eyebrow: "Why families trust us",
    statement:
      "We combine modern, protocol-based oncology with unhurried, human conversations — so that every patient receives accurate treatment, fewer side effects and a family that understands the plan.",
    highlight: "accurate treatment, fewer side effects and a family that understands the plan.",
    image: media.careHands,
  },

  /** Medicine shop highlight — second business priority, sits right after the intro. */
  shop: {
    eyebrow: "Medicine shop",
    title: "Genuine oncology medicines, delivered to your door",
    highlight: "delivered to your door",
    description:
      "Order prescribed cancer medicines and supportive care from the same team that treats you — checked by our pharmacist before anything leaves the chamber.",
    steps: [
      { icon: "clipboard", title: "Upload your prescription", text: "A clear photo or PDF is enough." },
      { icon: "shield", title: "Pharmacist verifies & calls", text: "We confirm medicine, price and dose." },
      { icon: "truck", title: "Delivered in 24–48 hours", text: "Inside Dhaka · cash on delivery." },
    ],
    primaryCta: { label: "Upload prescription", href: "/shop?upload=1" },
    secondaryCta: { label: "Browse all medicines", href: "/shop" },
    productsHeading: "Frequently ordered",
    // Products shown on the homepage, in this order. Missing / out-of-stock slugs are skipped
    // and the list is topped up from the catalogue, so this never renders empty.
    featuredSlugs: ["capecitabine-500mg", "ondansetron-8mg", "filgrastim-300mcg-injection", "oral-nutrition-supplement-vanilla"],
    rxLabel: "Rx",
    rxTitle: "Prescription required",
  },

  doctor: {
    eyebrow: "Meet your oncologist",
    cta: { label: "Read full profile", href: "/about" },
    labels: {
      role: "Current role",
      previously: "Previously",
      qualifications: "Qualifications",
      focus: "Clinical focus",
      languages: "Consults in",
    },
  },

  services: {
    eyebrow: "Our services",
    title: "Four ways we look after you",
    highlight: "look after you",
    description:
      "From the first consultation to the last cycle — and the medicines in between — every service is planned to keep treatment safe, close and less exhausting.",
    cta: { label: "View all services", href: "/services" },
    linkLabel: "Learn more",
  },

  journey: {
    eyebrow: "How it works",
    title: "From the first call to the first treatment",
    highlight: "the first treatment",
    stepLabel: "Step",
    images: [media.reportReview, media.consultation, media.pharmacy],
  },

  testimonials: {
    eyebrow: "Patient & family stories",
    title: "What families tell us",
    highlight: "tell us",
    facebookCta: { label: "Read more on Facebook" },
    ratingLabel: "average rating",
    reviewsLabel: "reviews on",
  },

  emergency: {
    eyebrow: "Need guidance right now?",
    title: "Worried about a fever, bleeding or severe side effect during treatment?",
    description:
      "Registered patients can call our care line at any hour. For life-threatening emergencies, please go directly to the nearest hospital emergency department.",
    callLabel: "Call now",
    whatsappLabel: "WhatsApp us",
    locationTitle: "Chamber location",
    mapLabel: "Get directions",
  },

  blog: {
    eyebrow: "Health & awareness",
    title: "Reading for patients and caregivers",
    highlight: "for patients and caregivers",
    cta: { label: "All articles", href: "/blog" },
    readLabel: "Read article",
    minLabel: "min read",
  },

  faq: {
    eyebrow: "Questions, answered",
    title: "Questions families ask us",
    highlight: "families ask us",
    description: "Can't find your answer? Call or WhatsApp us — a real person will reply.",
  },

  finalCta: {
    eyebrow: "You don't have to face this alone",
    title: "Take the first step towards treatment today",
    description:
      "Book a chamber visit or an online consultation. Bring your reports — we'll take it from there, together.",
    primary: { label: "Book Appointment", href: "/appointment" },
    secondary: { label: "Upload Prescription", href: "/shop?upload=1" },
    image: media.bedsideCare,
  },
};
