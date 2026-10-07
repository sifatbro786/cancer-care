/**
 * Admin → Content (B5): copy + form structure for every editable collection.
 * ─────────────────────────────────────────────────────────────────
 * `entities[key].sections[].fields[]` drives the generic editor (components/admin/cms).
 * Field `name` is a dot path into the record ("contact.phone", "details.intro").
 * Limits here are UI hints only — the zod schemas in lib/validation/cms.js are authoritative.
 *
 * Field types: text · email · url · textarea · number · checkbox · select · date ·
 *              slug (auto from `from`) · lines (one item per line) · paragraphs (blank line between) ·
 *              image (media library) · repeater (list of small objects) · blocks (article editor)
 * ─────────────────────────────────────────────────────────────────
 */

const yesNo = { on: "Visible", off: "Hidden" };

export const cmsData = {
  common: {
    eyebrow: "Content",
    newItem: (noun) => `New ${noun}`,
    edit: "Edit",
    back: "Back",
    save: "Save changes",
    create: "Create",
    saving: "Saving…",
    saved: "Saved — the website shows the change on its next load.",
    created: "Created. You can keep editing below.",
    delete: "Delete",
    deleting: "Deleting…",
    deleteConfirm: (noun) => `Delete this ${noun} permanently? This can't be undone.`,
    deleted: "Deleted.",
    unsaved: "You have unsaved changes.",
    leaveConfirm: "You have unsaved changes. Leave without saving?",
    moveUp: "Move up",
    moveDown: "Move down",
    orderHint: "The order here is the order on the website.",
    searchLabel: "Search",
    searchButton: "Search",
    clear: "Clear",
    empty: "Nothing here yet.",
    emptySearch: (q) => `Nothing matches “${q}”.`,
    count: (n) => `${n} ${n === 1 ? "item" : "items"}`,
    updated: "Updated",
    dbOff: "Database is not connected (MONGODB_URI is not set) — content can't be edited.",
    missing: "This record doesn't exist yet — run `npm run seed` once.",
    viewOnSite: "View on website",
    required: "Required",
    optional: "optional",
  },

  fieldHelp: {
    lines: "One item per line.",
    paragraphs: "Leave an empty line between paragraphs.",
    slugAuto: "Filled in from the title. Lowercase letters, numbers and dashes.",
    slugLocked: "Fixed after creation — other pages and links depend on it.",
    slugChange: "Changing this changes the page address; old links will stop working.",
  },

  image: {
    none: "No image",
    stock: "Stock photo",
    upload: "Your upload",
    choose: "Choose from library",
    change: "Change",
    remove: "Remove",
    alt: "Alt text",
    altHint: "Describe the photo for screen readers.",
    pickerTitle: "Choose a photo",
    pickerIntro: "Photos come from Admin → Media. Upload new ones there first.",
    pickerEmpty: "The library is empty — upload photos in Admin → Media.",
    pickerLoading: "Loading photos…",
    pickerError: "Couldn't load the library. Close and try again.",
    use: "Use this photo",
    more: "Load more",
    close: "Close",
  },

  repeater: {
    add: (noun) => `Add ${noun}`,
    remove: "Remove",
    item: (noun, i) => `${noun} ${i + 1}`,
    max: (n) => `Up to ${n}.`,
  },

  blocks: {
    heading: "Article",
    intro: "Build the article from simple blocks. No formatting codes needed.",
    empty: "No blocks yet — start with a paragraph.",
    add: "Add",
    types: { paragraph: "Paragraph", heading: "Heading", list: "List", callout: "Note box" },
    hints: {
      list: "One point per line.",
      callout: "Highlighted note — use for warnings or important advice.",
    },
    remove: "Remove block",
  },

  badges: {
    active: yesNo,
    approved: { on: "Approved", off: "Waiting for approval" },
    published: "Published",
    draft: "Draft",
    scheduled: "Scheduled",
    featured: "Featured",
    outOfStock: "Out of stock",
    rx: "Rx",
    noindex: "Hidden from search",
  },

  toggles: {
    active: { on: "Hide", off: "Show" },
    approved: { on: "Unapprove", off: "Approve" },
  },

  errors: {
    invalid: "Please fix the highlighted fields.",
    conflict: "Someone else saved this in the meantime. Reload the page to see their version, then make your change again.",
    notFound: "That item no longer exists.",
    duplicate: (label) => `That ${label} is already used by another item.`,
    inUse: (n, what) => `Can't delete — ${n} ${what} still use${n === 1 ? "s" : ""} it. Move or delete those first.`,
    category: "Choose a category that exists.",
    server: "Something went wrong on our side. Please try again.",
    required: "This field is required.",
    tooLong: (n) => `Keep it under ${n} characters.`,
    tooMany: (n) => `Up to ${n} items.`,
    template: "Must contain %s (where the page title goes).",
    slug: "Use lowercase letters, numbers and single dashes (e.g. day-care-chemotherapy).",
    url: "Enter a full https:// link.",
    mapEmbed: "Paste the src link from Google Maps → Share → Embed a map.",
    email: "Enter a valid email address.",
    phone: "Enter a phone number (digits, spaces, + and dashes).",
    whatsapp: "Digits only, with country code — e.g. 8801540129969.",
    number: "Enter a number.",
    integer: "Whole taka only — no decimals.",
    range: (min, max) => `Between ${min} and ${max}.`,
    mrp: "MRP can't be lower than the selling price.",
    date: "Pick a date.",
    image: "Choose an image from the library.",
    blocks: "Add at least one block.",
  },

  /** Sidebar & page titles. `noun` is used in buttons/messages ("New service"). */
  entities: {
    settings: {
      singleton: true,
      noun: "settings",
      title: "Site settings",
      highlight: "settings",
      intro: "Phone, address, opening hours and social links — shown in the header, footer, contact page and search results.",
      sections: [
        {
          title: "Contact",
          fields: [
            { name: "contact.phone", type: "text", label: "Phone", required: true, max: 30, hint: "As people should see it, e.g. +880 1540-129969." },
            { name: "contact.whatsapp", type: "text", label: "WhatsApp number", required: true, max: 15, hint: "Digits only with country code, e.g. 8801540129969." },
            { name: "contact.whatsappMessage", type: "text", label: "WhatsApp greeting", max: 200, hint: "Pre-filled when a visitor taps WhatsApp.", width: "full" },
            { name: "contact.email", type: "email", label: "Email", max: 120 },
          ],
        },
        {
          title: "Address & map",
          fields: [
            { name: "address.line1", type: "text", label: "Address line 1", required: true, max: 120 },
            { name: "address.line2", type: "text", label: "Address line 2", max: 120 },
            { name: "address.full", type: "text", label: "Full address (one line)", required: true, max: 240, width: "full", hint: "Used in the top bar and for Google." },
            { name: "address.city", type: "text", label: "City", max: 60 },
            { name: "address.region", type: "text", label: "Division", max: 60 },
            { name: "address.postalCode", type: "text", label: "Postcode", max: 12 },
            { name: "address.mapLink", type: "url", label: "Google Maps link", max: 600, width: "full", hint: "The “Get directions” link." },
            { name: "address.mapEmbed", type: "url", label: "Map embed link", max: 600, width: "full", hint: "Google Maps → Share → Embed a map → copy only the link inside src=\"…\"." },
            { name: "address.geo.lat", type: "number", label: "Latitude", step: "any", hint: "Optional — exact pin for Google." },
            { name: "address.geo.lng", type: "number", label: "Longitude", step: "any" },
          ],
        },
        {
          title: "Opening hours",
          fields: [
            {
              name: "hours",
              type: "repeater",
              label: "Hours",
              noun: "row",
              maxItems: 8,
              hint: "The first row is shown in the top bar.",
              fields: [
                { name: "label", type: "text", label: "Service", required: true, max: 60 },
                { name: "days", type: "text", label: "Days", required: true, max: 60 },
                { name: "time", type: "text", label: "Time", required: true, max: 60 },
              ],
            },
            { name: "emergencyNote", type: "text", label: "Emergency note", max: 200, width: "full" },
          ],
        },
        {
          title: "Social links",
          fields: [
            {
              name: "social",
              type: "repeater",
              label: "Profiles",
              noun: "link",
              maxItems: 6,
              fields: [
                {
                  name: "key",
                  type: "select",
                  label: "Network",
                  required: true,
                  options: [
                    { value: "facebook", label: "Facebook" },
                    { value: "youtube", label: "YouTube" },
                    { value: "whatsapp", label: "WhatsApp" },
                    { value: "google", label: "Google" },
                  ],
                },
                { name: "label", type: "text", label: "Label", required: true, max: 40 },
                { name: "href", type: "url", label: "Link", required: true, max: 300 },
              ],
            },
          ],
        },
        {
          title: "Footer",
          fields: [
            { name: "footer.about", type: "textarea", label: "About text", max: 600, width: "full" },
            { name: "footer.disclaimer", type: "textarea", label: "Medical disclaimer", max: 600, width: "full", hint: "Shown as a note in the “Medical information” section of the Terms of Use page." },
          ],
        },
        {
          title: "Review summary",
          description: "The score shown next to testimonials on the home page.",
          fields: [
            { name: "ratingSummary.average", type: "number", label: "Average rating", min: 0, max: 5, step: "0.1" },
            { name: "ratingSummary.count", type: "number", label: "Number of reviews", min: 0, step: "1" },
            { name: "ratingSummary.sources", type: "lines", label: "Sources", hint: "e.g. Facebook, Google — one per line." },
          ],
        },
      ],
    },

    doctor: {
      singleton: true,
      noun: "profile",
      title: "Doctor profile",
      highlight: "profile",
      intro: "Credentials and biography shown on the home and About pages.",
      sections: [
        {
          title: "Identity",
          fields: [
            { name: "honorific", type: "text", label: "Title", max: 20, hint: "e.g. Dr." },
            { name: "name", type: "text", label: "Full name", required: true, max: 100 },
            { name: "shortTitle", type: "text", label: "Short title", max: 120 },
            { name: "designation", type: "text", label: "Designation", max: 200 },
            { name: "bmdcReg", type: "text", label: "BMDC registration no.", max: 30 },
            { name: "photo", type: "image", label: "Portrait", width: "full" },
          ],
        },
        {
          title: "Qualifications",
          fields: [
            { name: "degrees", type: "lines", label: "Degrees", width: "full", hint: "One degree per line, e.g. MBBS (DMC)." },
            {
              name: "training",
              type: "repeater",
              label: "Training",
              noun: "training",
              maxItems: 12,
              fields: [
                { name: "year", type: "text", label: "Year", max: 10 },
                { name: "title", type: "text", label: "Course / fellowship", required: true, max: 160 },
                { name: "place", type: "text", label: "Place", max: 160 },
              ],
            },
            {
              name: "affiliations",
              type: "repeater",
              label: "Hospital affiliations",
              noun: "affiliation",
              maxItems: 10,
              fields: [
                { name: "name", type: "text", label: "Hospital", required: true, max: 160 },
                { name: "role", type: "text", label: "Role", max: 160 },
                { name: "period", type: "text", label: "Period", max: 40 },
              ],
            },
            { name: "memberships", type: "lines", label: "Memberships", width: "full" },
          ],
        },
        {
          title: "About",
          fields: [
            { name: "summary", type: "textarea", label: "Short summary", max: 600, width: "full", hint: "Two or three sentences — also used for Google." },
            { name: "bio", type: "paragraphs", label: "Biography", width: "full", rows: 10 },
            { name: "specialties", type: "lines", label: "Areas of focus" },
            { name: "languages", type: "lines", label: "Languages" },
          ],
        },
        {
          title: "Numbers",
          fields: [
            {
              name: "stats",
              type: "repeater",
              label: "Highlights",
              noun: "number",
              maxItems: 6,
              hint: "e.g. 15 + “Years of practice”.",
              fields: [
                { name: "value", type: "number", label: "Number", required: true, min: 0, step: "1" },
                { name: "suffix", type: "text", label: "Suffix", max: 6, hint: "+, k, %" },
                { name: "label", type: "text", label: "Label", required: true, max: 80 },
              ],
            },
          ],
        },
        {
          title: "Philosophy",
          fields: [
            { name: "philosophy.quote", type: "textarea", label: "Quote", max: 400, width: "full" },
            { name: "philosophy.signature", type: "text", label: "Signed as", max: 80 },
          ],
        },
      ],
    },

    services: {
      noun: "service",
      title: "Services",
      highlight: "Services",
      intro: "The care services listed on the home page, the Services page and the appointment form.",
      orderable: true,
      toggle: "active",
      viewPath: (r) => `/services#${r.slug}`,
      defaults: { icon: "heart", active: true, highlights: [], details: { precautions: [], facilities: [], steps: [] } },
      sections: [
        {
          title: "Basics",
          fields: [
            { name: "title", type: "text", label: "Title", required: true, max: 120 },
            { name: "slug", type: "slug", label: "Page anchor", from: "title", lockOnEdit: true, required: true },
            { name: "icon", type: "select", label: "Icon", options: "icons", required: true },
            { name: "active", type: "checkbox", label: "Show on the website" },
            { name: "short", type: "textarea", label: "Short description", max: 300, width: "full" },
            { name: "image", type: "image", label: "Photo", width: "full" },
          ],
        },
        {
          title: "Details",
          fields: [
            { name: "highlights", type: "lines", label: "Card highlights", width: "full" },
            { name: "details.intro", type: "textarea", label: "Introduction", max: 1000, width: "full", rows: 5 },
            { name: "details.steps", type: "lines", label: "How it works (steps)", width: "full", hint: "Optional — one step per line." },
            { name: "details.precautions", type: "lines", label: "Before you come", width: "full" },
            { name: "details.facilities", type: "lines", label: "Facilities", width: "full" },
          ],
        },
      ],
    },

    products: {
      noun: "medicine",
      title: "Medicines",
      highlight: "Medicines",
      intro: "The medicine shop catalogue. Prices are whole taka. Hidden items stay in old orders but can't be ordered.",
      toggle: "active",
      paged: true,
      search: { placeholder: "Name, generic or SKU" },
      related: { href: "/admin/content/product-categories", label: "Categories" },
      viewPath: (r) => `/shop/${r.slug}`,
      defaults: { active: true, inStock: true, requiresPrescription: true, coldChain: false },
      sections: [
        {
          title: "Basics",
          fields: [
            { name: "name", type: "text", label: "Name", required: true, max: 160, hint: "Brand + strength, e.g. Capecitabine 500 mg." },
            { name: "slug", type: "slug", label: "Page address", from: "name", required: true },
            { name: "generic", type: "text", label: "Generic name", max: 160 },
            { name: "category", type: "select", label: "Category", options: "productCategories", required: true },
            { name: "manufacturer", type: "text", label: "Manufacturer", max: 120 },
            { name: "pack", type: "text", label: "Pack size", max: 120, hint: "e.g. Box of 30 tablets." },
            { name: "sku", type: "text", label: "SKU / code", max: 40, hint: "Optional, must be unique." },
          ],
        },
        {
          title: "Price & availability",
          fields: [
            { name: "price", type: "number", label: "Selling price (৳)", required: true, min: 0, step: "1" },
            { name: "mrp", type: "number", label: "MRP (৳)", required: true, min: 0, step: "1" },
            { name: "inStock", type: "checkbox", label: "In stock" },
            { name: "requiresPrescription", type: "checkbox", label: "Prescription required" },
            { name: "coldChain", type: "checkbox", label: "Needs cold chain" },
            { name: "active", type: "checkbox", label: "Show in the shop" },
          ],
        },
        {
          title: "Photo & description",
          fields: [
            { name: "image", type: "image", label: "Photo", width: "full" },
            { name: "description", type: "textarea", label: "Description", max: 2000, width: "full", rows: 5 },
          ],
        },
        {
          title: "Search engines",
          description: "Optional. Leave empty to use the medicine name and summary.",
          fields: [
            { name: "seo.title", type: "text", label: "Search title", max: 70, width: "full", hint: "Google shows about 60 characters." },
            { name: "seo.description", type: "textarea", label: "Search description", max: 170, width: "full", hint: "About 150–160 characters." },
          ],
        },
      ],
    },

    "product-categories": {
      noun: "category",
      title: "Medicine categories",
      highlight: "categories",
      intro: "Filters in the medicine shop.",
      parent: { href: "/admin/content/products", label: "Medicines" },
      orderable: true,
      toggle: "active",
      defaults: { active: true },
      sections: [
        {
          title: "Category",
          fields: [
            { name: "label", type: "text", label: "Name", required: true, max: 60 },
            { name: "key", type: "slug", label: "Key", from: "label", lockOnEdit: true, required: true },
            { name: "active", type: "checkbox", label: "Show in the shop" },
          ],
        },
      ],
    },

    blog: {
      noun: "article",
      title: "Blog",
      highlight: "Blog",
      intro: "Health articles. Drafts are never public; a future publish date schedules the article.",
      paged: true,
      search: { placeholder: "Title" },
      tabs: [
        { key: "all", label: "All" },
        { key: "published", label: "Published" },
        { key: "scheduled", label: "Scheduled" },
        { key: "draft", label: "Drafts" },
      ],
      related: { href: "/admin/content/blog-categories", label: "Categories" },
      viewPath: (r) => `/blog/${r.slug}`,
      defaults: { status: "draft", featured: false, content: [{ type: "paragraph", text: "" }] },
      sections: [
        {
          title: "Article",
          fields: [
            { name: "title", type: "text", label: "Title", required: true, max: 200, width: "full" },
            { name: "slug", type: "slug", label: "Page address", from: "title", required: true },
            { name: "category", type: "select", label: "Category", options: "blogCategories", required: true },
            { name: "author", type: "text", label: "Author", max: 100 },
            { name: "excerpt", type: "textarea", label: "Summary", max: 400, width: "full", hint: "Shown on cards and in search results." },
            { name: "cover", type: "image", label: "Cover photo", width: "full" },
          ],
        },
        {
          title: "Publishing",
          fields: [
            {
              name: "status",
              type: "select",
              label: "Status",
              required: true,
              options: [
                { value: "draft", label: "Draft — not public" },
                { value: "published", label: "Published" },
              ],
            },
            { name: "publishedAt", type: "date", label: "Publish date", hint: "Empty = now. A future date schedules it." },
            { name: "featured", type: "checkbox", label: "Feature on the home page" },
          ],
        },
        { title: "Content", fields: [{ name: "content", type: "blocks", label: "Article body", width: "full" }] },
        {
          title: "Search engines",
          description: "Optional. Leave empty to use the article title and summary.",
          fields: [
            { name: "seo.title", type: "text", label: "Search title", max: 70, width: "full", hint: "Google shows about 60 characters." },
            { name: "seo.description", type: "textarea", label: "Search description", max: 170, width: "full", hint: "About 150–160 characters." },
          ],
        },
      ],
    },

    "blog-categories": {
      noun: "category",
      title: "Blog categories",
      highlight: "categories",
      intro: "Filters on the blog page.",
      parent: { href: "/admin/content/blog", label: "Blog" },
      orderable: true,
      defaults: {},
      sections: [
        {
          title: "Category",
          fields: [
            { name: "label", type: "text", label: "Name", required: true, max: 60 },
            { name: "key", type: "slug", label: "Key", from: "label", lockOnEdit: true, required: true },
          ],
        },
      ],
    },

    testimonials: {
      noun: "testimonial",
      title: "Testimonials",
      highlight: "Testimonials",
      intro: "Only approved testimonials appear on the website. Use initials — never a patient's full name or diagnosis without written consent.",
      orderable: true,
      toggle: "approved",
      tabs: [
        { key: "pending", label: "Waiting" },
        { key: "approved", label: "Approved" },
        { key: "all", label: "All" },
      ],
      defaultTab: "pending",
      defaults: { rating: 5, source: "direct", approved: false },
      sections: [
        {
          title: "Testimonial",
          fields: [
            { name: "quote", type: "textarea", label: "Quote", required: true, max: 800, width: "full", rows: 5 },
            { name: "name", type: "text", label: "Name (initials)", required: true, max: 60, hint: "e.g. S. Akter" },
            { name: "relation", type: "text", label: "Relation", max: 60, hint: "e.g. Daughter of a patient" },
            { name: "location", type: "text", label: "Location", max: 60 },
            {
              name: "rating",
              type: "select",
              label: "Rating",
              required: true,
              options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n === 1 ? "" : "s"}` })),
            },
            {
              name: "source",
              type: "select",
              label: "Source",
              required: true,
              options: [
                { value: "direct", label: "Directly to the clinic" },
                { value: "facebook", label: "Facebook" },
                { value: "google", label: "Google" },
              ],
            },
            { name: "approved", type: "checkbox", label: "Approved — show on the website" },
          ],
        },
      ],
    },

    "seo-pages": {
      noun: "page",
      title: "Search & sharing",
      highlight: "sharing",
      intro: "How each page appears on Google and when shared on Facebook/WhatsApp. Empty fields use the text built into the site.",
      permission: "seo:write",
      noCreate: true,
      noDelete: true,
      related: { href: "/admin/content/seo-default", label: "Site-wide defaults" },
      pageLabels: {
        home: "Home",
        about: "About the doctor",
        services: "Services",
        appointment: "Appointment",
        shop: "Medicine shop",
        blog: "Blog",
        patientGuide: "Patient guide",
        contact: "Contact",
        privacy: "Privacy policy",
        terms: "Terms of use",
      },
      sections: [
        {
          title: "Search result",
          fields: [
            { name: "title", type: "text", label: "Page title", max: 120, width: "full", hint: "Shown as “Title | Cancer Care & Medical Services”. Empty = default." },
            { name: "description", type: "textarea", label: "Description", max: 300, width: "full", hint: "About 150–160 characters work best." },
            { name: "noindex", type: "checkbox", label: "Hide this page from search engines" },
          ],
        },
        { title: "Sharing image", fields: [{ name: "ogImage", type: "image", label: "Image for Facebook / WhatsApp previews", width: "full" }] },
      ],
    },

    "seo-default": {
      singleton: true,
      noun: "defaults",
      title: "Search defaults",
      highlight: "defaults",
      intro: "Site-wide fallback used by every page that has no text of its own.",
      permission: "seo:write",
      parent: { href: "/admin/content/seo-pages", label: "Search & sharing" },
      sections: [
        {
          title: "Defaults",
          fields: [
            { name: "title", type: "text", label: "Home & fallback title", required: true, max: 120, width: "full" },
            { name: "titleTemplate", type: "text", label: "Title pattern", required: true, max: 120, width: "full", hint: "%s is replaced by the page title." },
            { name: "description", type: "textarea", label: "Default description", required: true, max: 300, width: "full" },
            { name: "ogHeadline", type: "text", label: "Share-image headline", max: 160, width: "full" },
            { name: "keywords", type: "lines", label: "Keywords", width: "full" },
            { name: "ogImage", type: "image", label: "Default sharing image", width: "full", hint: "Empty = the generated card with the clinic name." },
          ],
        },
      ],
    },

    faqs: {
      noun: "question",
      title: "FAQ",
      highlight: "FAQ",
      intro: "Questions on the home page (also given to Google as FAQ data).",
      orderable: true,
      toggle: "active",
      defaults: { active: true },
      sections: [
        {
          title: "Question",
          fields: [
            { name: "q", type: "text", label: "Question", required: true, max: 300, width: "full" },
            { name: "a", type: "textarea", label: "Answer", required: true, max: 2000, width: "full", rows: 6 },
            { name: "active", type: "checkbox", label: "Show on the website" },
          ],
        },
      ],
    },
  },
};

export const CMS_ENTITY_KEYS = Object.freeze(Object.keys(cmsData.entities));
