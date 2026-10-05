import { media } from "@/data/media";

/** About page copy. Doctor entity data lives in doctorData.js. */
export const aboutData = {
  header: {
    eyebrow: "About the doctor",
    title: "Twelve years of oncology, one patient at a time",
    highlight: "one patient at a time",
    description:
      "Chief Co-ordinator of the Day Care Chemotherapy Center at Marks Medical College & Hospital, with earlier years in oncology care at CMH Dhaka.",
    image: media.doctorPortrait,
  },
  bio: {
    eyebrow: "Biography",
    title: "How she practises",
  },
  timeline: {
    eyebrow: "Training & qualifications",
    title: "Education and training",
  },
  affiliations: {
    eyebrow: "Hospital affiliations",
    title: "Where she has worked",
  },
  memberships: { title: "Professional memberships" },
  focus: { title: "Clinical focus" },
  gallery: {
    eyebrow: "The care setting",
    title: "Inside our chamber and day care unit",
    images: [
      { ...media.treatmentRoom, caption: "Treatment room" },
      { ...media.chemoSuite, caption: "Infusion preparation" },
      { ...media.consultation, caption: "Chamber consultation" },
      { ...media.infusion, caption: "Monitored infusion" },
      { ...media.reportReview, caption: "Report review" },
    ],
  },
  cta: {
    title: "Bring your reports. We'll go through them together.",
    primary: { label: "Book Appointment", href: "/appointment" },
    secondary: { label: "Online consultation", href: "/appointment?type=online" },
  },
};
