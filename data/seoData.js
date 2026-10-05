/**
 * Centralised SEO metadata per route.
 * Consumed by `lib/seo.js#buildMetadata`. Phase 2: editable from Admin → SEO.
 */
export const seoData = {
  default: {
    title: "Cancer Care & Medical Services — Day Care Chemotherapy & Oncology, Dhaka",
    titleTemplate: "%s | Cancer Care & Medical Services",
    description:
      "Specialised cancer care in Dhaka: day care chemotherapy, in-person oncology chamber in Kafrul (Dhaka Cantonment), online telemedicine and genuine oncology medicine delivery.",
    ogHeadline: "Day care chemotherapy, chamber & online oncology consultation",
    keywords: [
      "cancer care Dhaka",
      "oncologist Dhaka Cantonment",
      "day care chemotherapy Bangladesh",
      "online oncology consultation",
      "oncology medicine delivery Dhaka",
    ],
  },
  home: {
    title: null, // uses default.title (absolute)
    description: null,
    path: "/",
  },
  about: {
    title: "About the Doctor",
    description:
      "Meet our lead oncologist — Chief Co-ordinator of the Day Care Chemotherapy Center, Marks Medical College & Hospital, formerly with CMH Dhaka.",
    path: "/about",
  },
  services: {
    title: "Oncology Services",
    description:
      "Day care chemotherapy, chamber consultation, online video consultation and oncology medicine support — precautions, facilities and how each service works.",
    path: "/services",
  },
  appointment: {
    title: "Book an Appointment",
    description: "Book an in-person chamber visit or an online telemedicine consultation in under two minutes.",
    path: "/appointment",
  },
  shop: {
    title: "Oncology Medicine Shop",
    description:
      "Order genuine oncology, supportive-care and general medicines. Upload your prescription for pharmacist verification and home delivery in Dhaka.",
    path: "/shop",
  },
  blog: {
    title: "Health & Cancer Awareness Articles",
    description: "Practical guidance on chemotherapy, nutrition, early detection and caregiving.",
    path: "/blog",
  },
  patientGuide: {
    title: "Patient Care Guide",
    description: "Before and after chemotherapy: preparation checklist, side-effect management and nutrition for recovery.",
    path: "/patient-guide",
  },
  contact: {
    title: "Contact & Chamber Location",
    description: "Call, WhatsApp or visit our chamber in Kafrul, Dhaka Cantonment. Send us a message any time.",
    path: "/contact",
  },
};
