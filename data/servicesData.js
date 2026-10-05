import { media } from "@/data/media";

/**
 * Core medical services.
 * `icon` is a string key resolved by `lib/icons.js` — keeps this file
 * JSON-serialisable so the Phase 2 API can return the exact same shape.
 */
export const servicesData = [
  {
    id: "svc-01",
    slug: "day-care-chemotherapy",
    icon: "syringe",
    title: "Day Care Chemotherapy",
    short: "Safe, supervised chemotherapy in a calm day-care suite — and home the same evening.",
    image: media.chemoSuite,
    highlights: [
      "Protocol-based drug preparation & dosing",
      "Trained oncology nurses at every chair",
      "Pre-medication & side-effect monitoring",
      "Comfortable reclining chairs, family waiting area",
    ],
    details: {
      intro:
        "Most chemotherapy today does not require a hospital stay. In our day care unit, each session is planned around your reports, your weight and how you felt after the last cycle.",
      precautions: [
        "Bring your latest CBC, liver & kidney function reports (within 48 hours)",
        "Eat a light meal 1–2 hours before your session",
        "Wear loose, comfortable clothing with easy arm access",
        "Bring one attendant; avoid bringing young children",
      ],
      facilities: [
        "Separate, clean chemotherapy suite",
        "Biosafety cabinet for drug preparation",
        "Emergency medicines & oxygen on standby",
        "Prayer space and attendant seating",
      ],
    },
  },
  {
    id: "svc-02",
    slug: "chamber-consultation",
    icon: "stethoscope",
    title: "In-Person Chamber Consultation",
    short: "Unhurried face-to-face consultations at the Kafrul, Dhaka Cantonment chamber.",
    image: media.consultation,
    highlights: [
      "Review of biopsy, imaging & blood reports",
      "Clear treatment plan explained to the family",
      "Second-opinion consultations",
      "Follow-up & survivorship visits",
    ],
    details: {
      intro:
        "A first oncology visit can feel overwhelming. We keep appointments unhurried so that you leave with a written plan and answers to your questions.",
      precautions: [
        "Bring all previous reports, slides and discharge papers in one folder",
        "Write your questions down before the visit",
        "Arrive 15 minutes early for registration",
      ],
      facilities: ["Private consultation room", "Wheelchair access", "Reports review desk"],
    },
  },
  {
    id: "svc-03",
    slug: "online-telemedicine",
    icon: "video",
    title: "Online Video Consultation",
    short: "Consult from home — ideal for follow-ups, report reviews and patients outside Dhaka.",
    image: media.telemedicine,
    highlights: [
      "Video call via WhatsApp or Google Meet",
      "Upload reports before the call",
      "Digital prescription after consultation",
      "Ideal for patients outside Dhaka",
    ],
    details: {
      intro:
        "Travelling during treatment is tiring. For follow-ups and report reviews, a video consultation saves a journey without compromising care.",
      steps: [
        "Book an online slot and choose your preferred time",
        "Upload recent reports & prescriptions",
        "Receive a confirmation call and meeting link",
        "Join the call — receive your digital prescription afterwards",
      ],
      precautions: [
        "Use a quiet room with good light and stable internet",
        "Keep your medicines and reports beside you during the call",
      ],
      facilities: ["WhatsApp video", "Google Meet", "Digital prescription"],
    },
  },
  {
    id: "svc-04",
    slug: "oncology-medicine-support",
    icon: "pill",
    title: "Oncology Medicine Support",
    short: "Genuine oncology & supportive medicines, verified against your prescription and delivered.",
    image: media.pharmacy,
    highlights: [
      "Prescription verified by our pharmacist",
      "Cold-chain handling for sensitive drugs",
      "Home delivery inside Dhaka",
      "Supportive & nutrition products",
    ],
    details: {
      intro:
        "Finding the right oncology medicine, at the right strength, from a trusted source should not be another worry. Upload your prescription and we handle the rest.",
      precautions: [
        "Prescription-only medicines are dispatched after verification",
        "Check the batch & expiry on delivery",
      ],
      facilities: ["Prescription upload", "Pharmacist call-back", "Doorstep delivery"],
    },
  },
];

/** 3-step patient journey (Home + Services pages) */
export const careJourney = [
  {
    step: "01",
    icon: "clipboard",
    title: "Submit appointment or prescription",
    text: "Book a chamber or online slot, or upload a prescription — it takes about two minutes.",
  },
  {
    step: "02",
    icon: "stethoscope",
    title: "Doctor review & consultation",
    text: "The doctor reviews your reports, discusses options with you and your family, and prepares a written plan.",
  },
  {
    step: "03",
    icon: "truck",
    title: "Treatment or medicine delivery",
    text: "Begin day care chemotherapy, or receive verified medicines at your door with clear instructions.",
  },
];
