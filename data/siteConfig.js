/**
 * Global site configuration — contact details, navigation, hours, socials.
 * Phase 2: this becomes `GET /api/settings` (editable from the Admin Dashboard).
 * NOTE: values marked `// TODO(client)` are placeholders awaiting client confirmation.
 */

export const siteConfig = {
  name: "Cancer Care & Medical Services",
  shortName: "Cancer Care",
  tagline: "Specialised cancer care, close to home",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://cancer-care.vercel.app",
  locale: "en_BD",

  contact: {
    phone: "+880 1540-129969",
    phoneHref: "tel:+8801540129969",
    whatsapp: "8801540129969",
    whatsappMessage: "Hello, I would like to book a consultation.",
    email: "care@cancercare.com.bd", // TODO(client): confirm official email
    emailHref: "mailto:care@cancercare.com.bd",
  },

  address: {
    line1: "Chamber — Kafrul",
    line2: "Dhaka Cantonment, Dhaka 1206",
    city: "Dhaka",
    region: "Dhaka Division",
    postalCode: "1206",
    country: "BD",
    full: "Kafrul, Dhaka Cantonment, Dhaka 1206, Bangladesh",
    // TODO(client): exact pin; used by the map embed & JSON-LD
    geo: { lat: 23.7949, lng: 90.3877 },
    mapEmbed:
      "https://www.google.com/maps?q=Kafrul,+Dhaka+Cantonment,+Dhaka&output=embed",
    mapLink: "https://maps.google.com/?q=Kafrul,+Dhaka+Cantonment,+Dhaka",
  },

  hours: [
    { label: "Chamber", days: "Sat – Thu", time: "5:00 PM – 9:00 PM" },
    { label: "Day Care Chemotherapy", days: "Sat – Thu", time: "9:00 AM – 4:00 PM" },
    { label: "Telemedicine", days: "Daily", time: "By appointment" },
  ],
  emergencyNote: "Phone guidance for registered patients — 24/7",

  social: [
    { key: "facebook", label: "Facebook", href: "https://facebook.com/" }, // TODO(client)
    { key: "youtube", label: "YouTube", href: "https://youtube.com/" }, // TODO(client)
    { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/8801540129969" },
  ],

  /** Primary navigation. `children` render as a dropdown on desktop, accordion on mobile. */
  nav: [
    { label: "Home", href: "/" },
    { label: "About Doctor", href: "/about" },
    {
      label: "Services",
      href: "/services",
      children: [
        { label: "Day Care Chemotherapy", href: "/services#day-care-chemotherapy", icon: "syringe" },
        { label: "Chamber Consultation", href: "/services#chamber-consultation", icon: "stethoscope" },
        { label: "Online Telemedicine", href: "/services#online-telemedicine", icon: "video" },
        { label: "Oncology Medicine Support", href: "/services#oncology-medicine-support", icon: "pill" },
      ],
    },
    { label: "Patient Guide", href: "/patient-guide" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  cta: {
    primary: { label: "Book Appointment", href: "/appointment" },
    secondary: { label: "Order Medicines", href: "/shop" },
  },

  footer: {
    about:
      "Compassionate, evidence-based cancer care — day care chemotherapy, in-person chamber consultation, online telemedicine and oncology medicine support for patients and families across Bangladesh.",
    columns: [
      {
        title: "Care",
        links: [
          { label: "Day Care Chemotherapy", href: "/services#day-care-chemotherapy" },
          { label: "Chamber Consultation", href: "/services#chamber-consultation" },
          { label: "Online Telemedicine", href: "/services#online-telemedicine" },
          { label: "Medicine Support", href: "/services#oncology-medicine-support" },
        ],
      },
      {
        title: "Patients",
        links: [
          { label: "Book Appointment", href: "/appointment" },
          { label: "Patient Care Guide", href: "/patient-guide" },
          { label: "Upload Prescription", href: "/shop?upload=1" },
          { label: "Health Articles", href: "/blog" },
        ],
      },
      {
        title: "About",
        links: [
          { label: "About the Doctor", href: "/about" },
          { label: "Medicine Shop", href: "/shop" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    disclaimer:
      "Information on this website is for general awareness and does not replace a consultation. In a medical emergency, go to the nearest hospital emergency department.",
  },
};

/** Prefilled WhatsApp deep link */
export const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  siteConfig.contact.whatsappMessage
)}`;
