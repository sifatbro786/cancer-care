/**
 * Central image registry.
 * Phase 1–2: Unsplash placeholders (IDs verified against Unsplash search results;
 * remote pattern allowed in next.config.mjs).
 * Backend phase: replace `src` with `/uploads/...` paths stored in the database.
 * Every image renders through <SmartImage>, which swaps to a local fallback
 * if a remote URL ever fails — so a dead placeholder never breaks the layout.
 */

export const unsplash = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const FALLBACK_IMAGE = "/images/fallback-care.svg";

export const media = {
  hero: {
    src: unsplash("1631217868264-e5b90bb7e133", 2000),
    alt: "A smiling doctor in a white coat talking with a patient in the clinic",
  },
  doctorPortrait: {
    src: unsplash("1623854767648-e7bb8009f0db", 1000),
    alt: "Portrait of the consultant oncologist with a stethoscope",
  },
  chemoSuite: {
    src: unsplash("1576671081741-c538eafccfff", 1400),
    alt: "Nurse preparing an infusion for a patient in the treatment room",
  },
  infusion: {
    src: unsplash("1650174378624-c9ab2c99e512", 1200),
    alt: "An infusion pump mounted on a drip stand",
  },
  treatmentRoom: {
    src: unsplash("1710698936989-500f359c6482", 1400),
    alt: "A clean, calm treatment room with a bed and a chair for family",
  },
  consultation: {
    src: unsplash("1758691462858-f1286e5daf40", 1400),
    alt: "Doctor consulting with an elderly patient in the chamber",
  },
  bedsideCare: {
    src: unsplash("1581056771107-24ca5f033842", 1400),
    alt: "A doctor speaking gently with a patient in a hospital bed",
  },
  reportReview: {
    src: unsplash("1758691461990-03b49d969495", 1200),
    alt: "Doctor writing notes on a patient's chart",
  },
  telemedicine: {
    src: unsplash("1758691462743-f9fc9e430d39", 1400),
    alt: "Doctor consulting a patient over a video call on a laptop",
  },
  pharmacy: {
    src: unsplash("1584308666744-24d5c474f2ae", 1400),
    alt: "Blister packs of prescribed tablets",
  },
  careHands: {
    src: unsplash("1749065311606-fa115df115af", 1400),
    alt: "A hand gently holding another hand for comfort",
  },
  caregiver: {
    src: unsplash("1586324304780-c9a5031a3599", 1400),
    alt: "Two people holding hands in support",
  },
  nutrition: {
    src: unsplash("1512621776951-a57141f2eefd", 1400),
    alt: "A bowl of fresh vegetables and grains for recovery nutrition",
  },
  ribbon: {
    src: unsplash("1555777223-2b7c13eaeaae", 1200),
    alt: "A pink awareness ribbon",
  },
};
