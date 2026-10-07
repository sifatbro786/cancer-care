/**
 * Privacy Policy & Terms of Use copy.
 * Written to match how this site actually handles data (forms → database +
 * email, prescriptions in private storage, admin-only session cookie, no
 * analytics or advertising trackers). If any of that changes, update here.
 *
 * TODO(client): have these reviewed by the clinic's legal adviser before launch,
 * then set `updated` to the date the reviewed text goes live.
 *
 * Body format: `sections[].blocks` = [{ p: "…" } | { list: ["…"] }].
 * The clinic's phone / email / address are inserted at render time from the
 * live site settings, so they never go stale here.
 */

export const legalData = {
  eyebrow: "Legal",
  updatedLabel: "Last updated",
  tocLabel: "On this page",
  contact: {
    heading: "Questions about this page?",
    text: "Call or write to us and a member of the clinic team will help.",
  },

  privacy: {
    title: "Privacy Policy",
    highlight: "Policy",
    description:
      "What we collect when you book, order medicines or contact us, why we need it, and how we keep it safe. Written in plain language.",
    updated: "2026-10-07",
    sections: [
      {
        id: "who-we-are",
        heading: "Who we are",
        blocks: [
          {
            p: "This website is run by Cancer Care & Medical Services, an oncology chamber and day care chemotherapy service in Dhaka. In this policy, “we” and “us” mean the clinic team.",
          },
        ],
      },
      {
        id: "what-we-collect",
        heading: "Information we collect",
        blocks: [
          { p: "We only collect what you type into our forms or upload yourself:" },
          {
            list: [
              "Appointment requests — patient name, mobile number, optional email and age, visit type, preferred date and time, and any note you add.",
              "Medicine orders — name, mobile number, delivery address, the medicines and quantity, and your prescription (photo or PDF) when one is required.",
              "Contact messages — your name, phone or email, and your message.",
              "Basic technical data — your IP address is used briefly to block spam and repeated form submissions.",
            ],
          },
          {
            p: "We do not use advertising trackers or sell any data. Please share only what is needed — do not send full medical reports through the contact form; bring them to your consultation instead.",
          },
        ],
      },
      {
        id: "how-we-use",
        heading: "How we use it",
        blocks: [
          {
            list: [
              "To confirm and manage your appointment, usually by phone.",
              "To check your prescription, prepare your medicines and arrange delivery.",
              "To answer your questions and follow up on your care.",
              "To keep the service secure and prevent misuse.",
            ],
          },
          { p: "We do not use your information for marketing without asking you first." },
        ],
      },
      {
        id: "prescriptions",
        heading: "Prescriptions and health information",
        blocks: [
          {
            p: "Prescriptions you upload are stored privately on our own server — never on a public web address — and can be opened only by signed-in clinic staff. Every time a prescription is viewed or downloaded, it is recorded in an access log.",
          },
          {
            p: "Prescription medicines are dispensed only after a pharmacist has checked the prescription and spoken with you.",
          },
        ],
      },
      {
        id: "sharing",
        heading: "Who we share it with",
        blocks: [
          { p: "Your information is seen by the doctor and clinic staff who look after you. Beyond that, we share only what is necessary:" },
          {
            list: [
              "Delivery staff receive your name, phone number and address to deliver an order.",
              "Our email and hosting providers process data on our behalf to run this website.",
              "Authorities, when the law requires it.",
            ],
          },
        ],
      },
      {
        id: "cookies",
        heading: "Cookies and third-party content",
        blocks: [
          {
            p: "Visitors are not tracked with cookies. A single security cookie is used only when clinic staff sign in to the admin area.",
          },
          {
            p: "Some photos are loaded from Unsplash, and the map on our contact page is provided by Google Maps. The map loads only when you choose to open it; these services may receive your IP address when their content loads.",
          },
        ],
      },
      {
        id: "security-retention",
        heading: "Security and how long we keep it",
        blocks: [
          {
            p: "Access to the admin area is limited to named staff accounts with strong passwords. Connections to this website are encrypted.",
          },
          {
            p: "We keep appointment, order and prescription records for as long as they are needed for your care and for medical and legal record-keeping. Security logs are deleted automatically after about 13 months.",
          },
        ],
      },
      {
        id: "your-choices",
        heading: "Your choices",
        blocks: [
          {
            p: "You can ask us to show you, correct or delete the information we hold about you. Some records may need to be kept where the law or safe medical practice requires it — we will explain if that applies. Contact us using the details below.",
          },
        ],
      },
      {
        id: "children",
        heading: "Patients under 18",
        blocks: [
          {
            p: "If the patient is under 18, a parent or guardian should book the appointment or place the order on their behalf.",
          },
        ],
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        blocks: [
          {
            p: "If we change how we handle information, we will update this page and the date at the top.",
          },
        ],
      },
    ],
  },

  terms: {
    title: "Terms of Use",
    highlight: "of Use",
    description:
      "The rules for using this website, booking appointments and ordering medicines. Please read them before you use our online services.",
    updated: "2026-10-07",
    sections: [
      {
        id: "about-these-terms",
        heading: "About these terms",
        blocks: [
          {
            p: "By using this website you agree to these terms. If you do not agree, please do not use the online booking or ordering services — you can always call the clinic instead.",
          },
        ],
      },
      {
        id: "medical-information",
        heading: "Medical information",
        // The clinic's medical disclaimer (Admin → Site settings) is shown as a note in this section.
        calloutFromSettings: true,
        blocks: [
          {
            p: "Articles, guides and answers on this website are for general awareness. They are not a diagnosis and do not replace a consultation with a doctor who knows your case.",
          },
          {
            p: "Never start, stop or change a medicine or treatment because of something you read here — always ask your doctor first.",
          },
        ],
      },
      {
        id: "appointments",
        heading: "Appointments and online consultations",
        blocks: [
          {
            list: [
              "Booking online sends a request. Your appointment is confirmed only when the clinic calls you.",
              "Times can change when the doctor is needed for an urgent patient. We will let you know as early as we can.",
              "For video consultations, you are responsible for a working phone or computer and a reasonably private place to talk.",
              "Some conditions cannot be assessed safely online. The doctor may ask you to visit the chamber in person.",
            ],
          },
        ],
      },
      {
        id: "medicine-orders",
        heading: "Medicine orders",
        blocks: [
          {
            list: [
              "Prescription medicines are supplied only against a valid prescription from a registered doctor, after our pharmacist has checked it.",
              "An order request is not final until we call you to confirm the medicine, price and delivery.",
              "Prices shown on the website may change; the price confirmed on the phone applies.",
              "We may decline or cancel an order if the prescription is unclear, invalid or unsafe.",
              "Cold-chain medicines must be refrigerated as soon as they arrive.",
              "For safety, medicines cannot be returned once delivered unless they are damaged, incorrect or expired — tell us within 24 hours of delivery.",
            ],
          },
        ],
      },
      {
        id: "your-responsibilities",
        heading: "Your responsibilities",
        blocks: [
          {
            list: [
              "Give accurate details for the patient, including contact number and address.",
              "Upload only genuine prescriptions issued to the patient.",
              "Do not misuse the website, try to access the admin area, or send harmful files.",
            ],
          },
        ],
      },
      {
        id: "liability",
        heading: "Limits of our responsibility",
        blocks: [
          {
            p: "We work hard to keep the website accurate and available, but we cannot promise it will always be error-free or online. We are not responsible for losses caused by relying on general information on this website instead of seeking medical advice.",
          },
        ],
      },
      {
        id: "content",
        heading: "Website content",
        blocks: [
          {
            p: "The text, design and logo on this website belong to Cancer Care & Medical Services and may not be copied for commercial use without permission. Some photographs are licensed from third parties.",
          },
        ],
      },
      {
        id: "law-changes",
        heading: "Governing law and changes",
        blocks: [
          {
            p: "These terms are governed by the laws of Bangladesh. We may update them from time to time; the date at the top shows the latest version.",
          },
        ],
      },
    ],
  },
};
