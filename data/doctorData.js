import { media } from "@/data/media";

/**
 * Doctor profile & credentials.
 * Phase 2 contract: GET /api/doctor → same shape.
 * TODO(client): replace name, degrees, registration no. and bio with verified details.
 */
export const doctorData = {
  slug: "lead-oncologist",
  name: "Dr. Farhana Rahman", // TODO(client): real name
  honorific: "Dr.",
  shortTitle: "Consultant, Clinical Oncology",
  designation: "Chief Co-ordinator — Day Care Chemotherapy Center",
  degrees: ["MBBS", "FCPS (Radiotherapy)", "Fellowship in Medical Oncology"], // TODO(client)
  bmdcReg: "A-XXXXX", // TODO(client)
  photo: media.doctorPortrait,

  affiliations: [
    {
      name: "Marks Medical College & Hospital",
      role: "Chief Co-ordinator, Day Care Chemotherapy Center",
      period: "Present",
    },
    {
      name: "Combined Military Hospital (CMH), Dhaka",
      role: "Oncology & chemotherapy care",
      period: "Former",
    },
  ],

  stats: [
    { value: 12, suffix: "+", label: "Years in oncology care" },
    { value: 8000, suffix: "+", label: "Chemotherapy sessions supervised" },
    { value: 24, suffix: "/7", label: "Phone guidance for patients" },
  ],

  summary:
    "A calm, careful oncologist who believes every patient deserves to understand their treatment — and every family deserves to feel supported through it.",

  bio: [
    "With more than a decade in oncology, she has guided thousands of patients through chemotherapy — from the first worried conversation to the last cycle. Her practice combines current evidence-based protocols with something that cannot be prescribed: time, patience and clear explanations.",
    "As Chief Co-ordinator of the Day Care Chemotherapy Center at Marks Medical College & Hospital, she oversees safe drug preparation, nursing protocols and side-effect monitoring, so patients can receive treatment and return home the same day.",
    "Her earlier work at CMH Dhaka shaped a disciplined, team-based approach to cancer care that she now brings to her chamber in Kafrul and to families joining online from across Bangladesh.",
  ],

  specialties: [
    "Breast cancer",
    "Lung cancer",
    "Gastrointestinal cancers",
    "Head & neck cancers",
    "Lymphoma",
    "Gynaecological cancers",
    "Supportive & palliative care",
  ],

  training: [
    { year: "2019", title: "Fellowship in Medical Oncology", place: "TODO(client)" },
    { year: "2016", title: "FCPS — Radiotherapy", place: "Bangladesh College of Physicians & Surgeons" },
    { year: "2014", title: "Chemotherapy Safety & Handling Certification", place: "TODO(client)" },
    { year: "2009", title: "MBBS", place: "TODO(client)" },
  ],

  memberships: [
    "Bangladesh Society of Medical Oncology", // TODO(client): confirm
    "Bangladesh Medical & Dental Council (BMDC)",
  ],

  languages: ["Bangla", "English"],

  philosophy: {
    quote:
      "Cancer treatment is not only about the drug in the drip. It is about the person in the chair, and the family waiting outside.",
    signature: "— Dr. Farhana",
  },
};
