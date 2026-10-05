/**
 * Patient & family testimonials (mock).
 * Privacy: initials + relationship only — never full patient names or diagnoses
 * without written consent. Phase 2: moderated via Admin Dashboard.
 */
export const testimonialsData = [
  {
    id: "t-01",
    quote:
      "My mother was terrified before her first cycle. The doctor sat with us for almost half an hour and explained every step. That calm made all the difference.",
    name: "S. Akter",
    relation: "Daughter of a patient",
    location: "Mirpur, Dhaka",
    rating: 5,
    source: "facebook",
  },
  {
    id: "t-02",
    quote:
      "We live in Rangpur, so online follow-ups saved us an eight-hour journey every month. Reports were reviewed carefully and the prescription arrived the same evening.",
    name: "M. Hossain",
    relation: "Patient",
    location: "Rangpur",
    rating: 5,
    source: "google",
  },
  {
    id: "t-03",
    quote:
      "The day care unit is clean and the nurses are gentle. My father actually looks forward to chatting with them now.",
    name: "R. Islam",
    relation: "Son of a patient",
    location: "Uttara, Dhaka",
    rating: 5,
    source: "facebook",
  },
  {
    id: "t-04",
    quote:
      "Getting the right injection used to take days of searching. Here I uploaded the prescription and it was delivered cold-packed the next morning.",
    name: "N. Sultana",
    relation: "Caregiver",
    location: "Dhaka Cantonment",
    rating: 5,
    source: "google",
  },
];

export const ratingSummary = {
  average: 4.9,
  count: 320,
  sources: ["Facebook", "Google"],
};
