/** Validation & submission messages shared by every form (client + server). */
export const formMessages = {
  required: "This field is required.",
  name: "Please enter the full name (at least 3 letters).",
  phone: "Enter a valid Bangladeshi mobile number, e.g. 01712345678.",
  email: "Enter a valid email address.",
  age: "Enter an age between 1 and 120.",
  message: "Please keep it under 1,000 characters.",
  messageMin: "Please write at least 10 characters.",
  consent: "Please confirm we may contact you.",
  date: "Please choose a valid day.",
  slot: "Please choose a time.",
  type: "Please choose the type of consultation.",
  quantity: "Quantity must be between 1 and 20.",
  address: "Please enter a delivery address.",
  file: {
    required: "Please attach the prescription.",
    type: "Only JPG, PNG, WEBP or PDF files are accepted.",
    size: "The file is larger than 4 MB.",
  },
  server: {
    invalid: "Please check the highlighted fields.",
    rateLimited: "Too many requests. Please wait a few minutes and try again, or call us.",
    failed: "We couldn't send your request. Please try again or call us directly.",
    forbidden: "This request was blocked. Please reload the page and try again.",
    network: "Network problem — please check your connection and try again.",
  },
};
