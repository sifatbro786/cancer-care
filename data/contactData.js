/** Contact page copy. Contact details themselves live in siteConfig.js. */
export const contactData = {
  header: {
    eyebrow: "Contact",
    title: "Talk to a real person at our chamber",
    highlight: "a real person",
    description: "Call or WhatsApp for the quickest reply. For anything that can wait, send us a message and we'll respond within one working day.",
  },
  channels: {
    call: { title: "Call", text: "Fastest for appointments and urgent questions." },
    whatsapp: { title: "WhatsApp", text: "Send reports or prescriptions as photos.", cta: "Open chat" },
    email: { title: "Email", text: "For documents and non-urgent questions." },
    visit: { title: "Visit", cta: "Get directions" },
  },
  hoursTitle: "Opening hours",
  mapTitle: "Map showing the chamber location in Kafrul, Dhaka Cantonment",
  form: {
    title: "Send us a message",
    fields: {
      name: { label: "Your name", placeholder: "Full name" },
      phone: { label: "Mobile number", placeholder: "01XXXXXXXXX" },
      email: { label: "Email (optional)", placeholder: "you@example.com" },
      subject: {
        label: "What is it about?",
        options: [
          { value: "appointment", label: "Appointment" },
          { value: "treatment", label: "Treatment question" },
          { value: "medicine", label: "Medicine order" },
          { value: "other", label: "Something else" },
        ],
      },
      message: { label: "Message", placeholder: "How can we help?" },
    },
    submitLabel: "Send message",
    submittingLabel: "Sending…",
    success: { title: "Message sent", text: "Thank you — we'll get back to you within one working day." },
    privacy: "We only use your details to reply to this message.",
  },
};
