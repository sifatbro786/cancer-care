/**
 * Central image registry.
 * Phase 1: Unsplash placeholders (remote patterns allowed in next.config.mjs).
 * Phase 2: replace `src` with `/uploads/...` paths returned by the backend.
 * Every image renders through <SmartImage>, which swaps to a local fallback
 * if a remote URL ever 404s — so a dead placeholder never breaks the layout.
 */

const unsplash = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const FALLBACK_IMAGE = "/images/fallback-care.svg";

export const media = {
  hero: {
    src: unsplash("1579684385127-1ef15d508118", 1800),
    alt: "Oncologist reviewing a treatment plan with a patient in a calm consultation room",
  },
  doctorPortrait: {
    src: unsplash("1612349317150-e413f6a5b16d", 1000),
    alt: "Portrait of the consultant oncologist in a white coat",
  },
  chemoSuite: {
    src: unsplash("1586773860418-d37222d8fce3", 1400),
    alt: "Bright day care chemotherapy suite with reclining treatment chairs",
  },
  consultation: {
    src: unsplash("1576091160550-2173dba999ef", 1400),
    alt: "Doctor explaining test results on a tablet",
  },
  telemedicine: {
    src: unsplash("1584982751601-97dcc096659c", 1400),
    alt: "Patient attending a video consultation from home",
  },
  pharmacy: {
    src: unsplash("1587854692152-cbe660dbde88", 1400),
    alt: "Neatly arranged prescription medicines",
  },
  careTeam: {
    src: unsplash("1559839734-2b71ea197ec2", 1400),
    alt: "Nurse holding a patient's hand during treatment",
  },
  nutrition: {
    src: unsplash("1512621776951-a57141f2eefd", 1400),
    alt: "A bowl of fresh vegetables and grains for recovery nutrition",
  },
};
