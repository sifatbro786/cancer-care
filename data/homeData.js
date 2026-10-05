import { media } from "@/data/media";

/**
 * Homepage copy & section config.
 * Entities (doctor, services, testimonials, blogs, FAQ) come from their own
 * data files via `services/content.js`; this file holds only page-level copy.
 */
export const homeData = {
  hero: {
    eyebrow: "Day Care Chemotherapy · Chamber · Telemedicine",
    title: "Compassionate cancer care, with clinical excellence",
    highlight: "cancer care",
    description:
      "Specialised oncology consultation, safe same-day chemotherapy and genuine medicine support — guided by an experienced oncologist who takes the time to explain.",
    primaryCta: { label: "Book Consultation", href: "/appointment" },
    secondaryCta: { label: "Order Medicines", href: "/shop" },
    image: media.hero,
    note: "Same-day chemo, home by evening",
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
    handNote: "every number is a person we cared for",
    image: media.careHands,
  },

  doctor: {
    eyebrow: "Meet your oncologist",
    title: "A specialist who listens first",
    highlight: "listens first",
    sticker: "Former CMH Dhaka",
    cta: { label: "Read full profile", href: "/about" },
  },

  services: {
    eyebrow: "Our services",
    title: "Comprehensive cancer care, designed around you",
    highlight: "designed around you",
    description:
      "From the first consultation to the last cycle — and the medicines in between — every service is planned to keep treatment safe, close and less exhausting.",
    cta: { label: "View all services", href: "/services" },
    linkLabel: "Learn more",
  },

  journey: {
    eyebrow: "How it works",
    title: "Your care journey in three calm steps",
    highlight: "three calm steps",
    images: [media.reportReview, media.consultation, media.pharmacy],
  },

  testimonials: {
    eyebrow: "Patient & family stories",
    title: "Words from the families we care for",
    highlight: "families",
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
    title: "Guidance for patients and caregivers",
    highlight: "patients and caregivers",
    cta: { label: "All articles", href: "/blog" },
    readLabel: "Read article",
    minLabel: "min read",
  },

  faq: {
    eyebrow: "Questions, answered",
    title: "Things families usually ask us",
    highlight: "usually ask",
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
