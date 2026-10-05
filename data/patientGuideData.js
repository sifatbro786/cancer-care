import { media } from "@/data/media";

/**
 * Patient care guide — pre/post chemotherapy.
 * General education only; every section ends with "ask your doctor" guidance.
 * Phase 2: editable from Admin as structured sections.
 */
export const patientGuideData = {
  header: {
    eyebrow: "Patient care guide",
    title: "A practical guide to getting through chemotherapy",
    highlight: "getting through",
    description:
      "What to do before your session, how to manage common side effects at home, and when to call us. Print it, share it with your family, keep it on the fridge.",
    image: media.caregiver,
  },
  tocLabel: "In this guide",
  disclaimer:
    "This guide is general information. Your own treatment plan may be different — always follow the instructions your oncologist gives you.",

  urgent: {
    id: "call-immediately",
    title: "Call us immediately if you have",
    signs: [
      "Fever of 100.4°F (38°C) or higher",
      "Shivering or chills",
      "Bleeding or bruising that won't stop",
      "Breathlessness or chest pain",
      "Vomiting more than 3 times in 24 hours",
      "Severe diarrhoea or unable to drink fluids",
    ],
    action: "Call",
  },

  sections: [
    {
      id: "before-chemo",
      title: "Before your session",
      intro: "A little preparation the day before makes the treatment day calmer for everyone.",
      checklist: [
        "Complete your blood tests (CBC, liver and kidney function) within 48 hours",
        "Sleep well and drink 8–10 glasses of water",
        "Eat a light, home-cooked meal 1–2 hours before",
        "Wear loose clothing with sleeves that roll up easily",
        "Pack: reports file, current medicines, water, a shawl and a light snack",
        "Arrange one adult to accompany you and take you home",
      ],
    },
    {
      id: "treatment-day",
      title: "On the treatment day",
      intro: "Here is what usually happens in the day care unit.",
      steps: [
        { title: "Check-in", text: "Weight, blood pressure and your reports are checked by the nurse." },
        { title: "Doctor review", text: "The doctor confirms the dose based on today's reports and how you felt after the last cycle." },
        { title: "Pre-medication", text: "Anti-sickness and other medicines are given to prevent reactions." },
        { title: "Infusion", text: "The chemotherapy drip runs for 1–4 hours. You can rest, read or talk with family." },
        { title: "Going home", text: "You receive written instructions and the medicines to take at home." },
      ],
    },
    {
      id: "side-effects",
      title: "Managing side effects at home",
      intro: "Most side effects are temporary and manageable. Note them down daily — it helps the doctor adjust your treatment.",
      table: {
        columns: ["Side effect", "What helps", "Call us if"],
        rows: [
          ["Nausea", "Small frequent meals, dry crackers, ginger tea, take anti-sickness medicine on time", "Vomiting more than 3 times a day"],
          ["Tiredness", "Short rests, gentle walks, accept help with chores", "You can't get out of bed or feel faint"],
          ["Mouth sores", "Soft food, rinse with salt water or prescribed mouthwash, soft toothbrush", "You can't eat or drink"],
          ["Diarrhoea", "ORS, rice water, bananas; avoid oily and spicy food", "More than 4–6 times a day or with fever"],
          ["Low blood counts", "Wash hands often, avoid crowds and people with colds, eat well-cooked food", "Any fever or bleeding"],
          ["Hair loss", "Gentle shampoo, soft scarf or cap; it usually grows back after treatment", "—"],
        ],
      },
    },
    {
      id: "nutrition",
      title: "Nutrition for recovery",
      intro: "You don't need special foods — you need enough protein, enough fluid and food that is safely cooked.",
      image: media.nutrition,
      tips: [
        { title: "Protein at every meal", text: "Egg, dal, fish, chicken, milk or doi help your body repair." },
        { title: "Small and often", text: "5–6 small meals are easier than 3 large ones when appetite is low." },
        { title: "Soft when sore", text: "Khichuri, suji, mashed potato and soups are gentle on a sore mouth." },
        { title: "Safe food", text: "Avoid raw salads, street food and unboiled water while counts are low." },
        { title: "Fluids", text: "Water, ORS, coconut water and thin soups — aim for 2–3 litres a day." },
      ],
    },
    {
      id: "after-chemo",
      title: "After treatment",
      intro: "Recovery continues after the last cycle. Follow-up visits help us catch problems early.",
      checklist: [
        "Keep every follow-up appointment, even if you feel well",
        "Return to light activity gradually; walking is the best start",
        "Report any new lump, pain or weight loss without waiting for your next visit",
        "Ask about emotional support — recovery is also about how you feel",
      ],
    },
  ],

  cta: {
    title: "Have a question about your treatment?",
    description: "Registered patients can call or WhatsApp us at any time.",
    primary: { label: "Book a follow-up", href: "/appointment" },
  },
};
