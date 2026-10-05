/**
 * Health & cancer-awareness articles (mock).
 * `content` is an array of typed blocks (heading | paragraph | list | callout)
 * — the same structure a headless CMS / the Phase 2 admin editor will store.
 * Reading time is computed in `services/content.js`, never hardcoded.
 */

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

export const blogCategories = [
  { key: "chemotherapy", label: "Chemotherapy" },
  { key: "nutrition", label: "Nutrition" },
  { key: "awareness", label: "Awareness" },
  { key: "caregivers", label: "For Caregivers" },
];

export const blogsData = [
  {
    id: "b-001",
    slug: "preparing-for-your-first-chemotherapy-session",
    title: "Preparing for your first chemotherapy session",
    excerpt:
      "What to eat, what to bring and what actually happens in the day care suite — a calm walkthrough for patients and families.",
    category: "chemotherapy",
    author: "Dr. Farhana Rahman",
    publishedAt: "2026-09-18",
    featured: true,
    cover: { src: img("1710698936989-500f359c6482"), alt: "A calm treatment room with a bed and a chair" },
    content: [
      { type: "paragraph", text: "The night before your first session, it is normal to feel anxious. Knowing what to expect makes the day much easier — for you and for the person coming with you." },
      { type: "heading", text: "The day before" },
      { type: "list", items: ["Complete the blood tests your doctor asked for", "Drink plenty of water", "Pack a small bag: reports, medicines, a shawl, water and a light snack"] },
      { type: "heading", text: "On the day" },
      { type: "paragraph", text: "Eat a light meal. When you arrive, a nurse will check your weight, blood pressure and reports. Pre-medicines are given first, then the chemotherapy drip begins. Most sessions take between two and five hours." },
      { type: "callout", text: "Tell the nurse immediately if you feel itching, breathlessness, chest tightness or pain at the drip site." },
    ],
  },
  {
    id: "b-002",
    slug: "eating-well-during-cancer-treatment",
    title: "Eating well during cancer treatment",
    excerpt:
      "Simple, Bangladeshi-kitchen-friendly ways to keep up protein and energy when appetite is low.",
    category: "nutrition",
    author: "Care Team",
    publishedAt: "2026-09-02",
    featured: true,
    cover: { src: img("1512621776951-a57141f2eefd"), alt: "A bowl of fresh vegetables" },
    content: [
      { type: "paragraph", text: "Chemotherapy can change taste and reduce appetite. Small, frequent meals usually work better than three large ones." },
      { type: "list", items: ["Add an egg, dal or fish to each meal for protein", "Try khichuri, soft rice with lentils, or suji when the mouth is sore", "Keep homemade lemon water or ORS nearby to stay hydrated"] },
      { type: "callout", text: "Avoid raw salads, street food and unpasteurised milk when your white blood cell count is low." },
    ],
  },
  {
    id: "b-003",
    slug: "early-signs-of-breast-cancer",
    title: "Early signs of breast cancer every family should know",
    excerpt:
      "Breast cancer found early is highly treatable. Learn the changes to look for and when to see a doctor.",
    category: "awareness",
    author: "Dr. Farhana Rahman",
    publishedAt: "2026-08-21",
    featured: true,
    cover: { src: img("1555777223-2b7c13eaeaae"), alt: "Pink ribbon for breast cancer awareness" },
    content: [
      { type: "paragraph", text: "Most breast changes are not cancer — but every new change deserves a check-up." },
      { type: "list", items: ["A new lump in the breast or armpit", "Change in size or shape of the breast", "Skin dimpling, redness or an orange-peel texture", "Nipple discharge or a newly inverted nipple"] },
      { type: "paragraph", text: "Do a gentle self-examination once a month, a few days after your period ends." },
    ],
  },
  {
    id: "b-004",
    slug: "caring-for-a-loved-one-through-chemotherapy",
    title: "Caring for a loved one through chemotherapy",
    excerpt: "Practical and emotional guidance for the family member who is holding everything together.",
    category: "caregivers",
    author: "Care Team",
    publishedAt: "2026-08-05",
    featured: false,
    cover: { src: img("1586324304780-c9a5031a3599"), alt: "A caregiver holding a patient's hand" },
    content: [
      { type: "paragraph", text: "Caregivers carry a quiet, heavy load. Looking after yourself is part of looking after them." },
      { type: "list", items: ["Keep one folder with all reports, in date order", "Note side effects daily — it helps the doctor adjust treatment", "Accept help with cooking, travel and errands"] },
    ],
  },
];
