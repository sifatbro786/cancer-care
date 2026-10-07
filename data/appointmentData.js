/**
 * Appointment page copy + scheduling rules (mock).
 * Backend phase: slots come from the DB (doctor calendar), with real availability.
 * Times are Asia/Dhaka. Friday (5) is the weekly holiday.
 */
export const appointmentData = {
  header: {
    eyebrow: "Book an appointment",
    title: "Book a visit in about two minutes",
    highlight: "in about two minutes",
    description:
      "Choose a chamber visit or an online consultation, pick a time that suits you, and we'll call to confirm. No payment is taken online.",
  },

  types: [
    {
      key: "chamber",
      icon: "hospital",
      title: "Chamber visit",
      text: "Face-to-face at the Kafrul, Dhaka Cantonment chamber.",
      meta: "Sat – Thu · 5:00 – 9:00 PM",
    },
    {
      key: "online",
      icon: "video",
      title: "Online consultation",
      text: "Video call on WhatsApp or Google Meet, from anywhere.",
      meta: "Daily · 10:00 AM – 1:00 PM",
    },
  ],

  schedule: {
    daysAhead: 14,
    closedWeekdays: { chamber: [5], online: [] }, // 0 = Sun … 5 = Fri
    slots: {
      chamber: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
      online: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
    },
  },

  steps: {
    type: "1. Type of consultation",
    when: "2. Choose a day and time",
    details: "3. Patient details",
  },

  fields: {
    service: { label: "Service (optional)", placeholder: "Not sure yet" },
    name: { label: "Patient's full name", placeholder: "e.g. Rahima Begum" },
    phone: { label: "Mobile number", placeholder: "01XXXXXXXXX", hint: "We'll call this number to confirm." },
    email: { label: "Email (optional)", placeholder: "you@example.com" },
    age: { label: "Patient's age (optional)", placeholder: "e.g. 54" },
    visit: {
      label: "Is this the first visit?",
      options: [
        { value: "new", label: "First visit" },
        { value: "follow-up", label: "Follow-up" },
      ],
    },
    message: {
      label: "Anything we should know? (optional)",
      placeholder: "Diagnosis, current treatment, or questions you'd like to ask",
    },
    consent: { label: "I agree to be contacted by phone or WhatsApp about this appointment." },
  },

  dateLabel: "Day",
  slotLabel: "Time",
  closedLabel: "Closed",
  todayLabel: "Today",
  noSlotsLabel: "No more slots today — please choose another day.",
  submitLabel: "Request appointment",
  submittingLabel: "Sending…",

  success: {
    title: "Request received",
    text: "Thank you. Our team will call you within working hours to confirm your appointment.",
    refLabel: "Reference",
    summaryLabels: { type: "Consultation", date: "Day", time: "Time", name: "Patient" },
    again: "Book another appointment",
  },

  aside: {
    title: "Before you come",
    items: [
      "Bring all reports, biopsy slides and discharge papers in one folder",
      "List the medicines you are taking now",
      "Arrive 15 minutes early for registration",
      "For online visits, upload reports on WhatsApp before the call",
    ],
    callTitle: "Prefer to book by phone?",
  },
};
