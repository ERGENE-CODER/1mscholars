/**
 * Editable homepage content. Change the text here; no other file needs touching.
 */

/** Numbers shown in the counter. "Active Opportunities" is NOT here: it is counted live from the database. */
export const STATS = {
  youthSupported: { value: 500, suffix: "+" },
  collegesCovered: { value: 7, suffix: "" },
  trainingPrograms: { value: 15, suffix: "+" },
};

/**
 * ⚠️ SAMPLE REVIEWS: REPLACE BEFORE LAUNCH ⚠️
 * These are placeholders so the section has something to show. Swap them for real,
 * permission-granted feedback from your clients. Published fake testimonials can mislead
 * visitors. Delete every entry (leave the array empty) to hide the section.
 */
export type Testimonial = { quote: string; name: string; role: string; rating?: number };

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "SAMPLE: The team explained every step of the scholarship application and checked my documents before I submitted. I felt confident instead of confused.",
    name: "Sample Student",
    role: "University student",
    rating: 5,
  },
  {
    quote:
      "SAMPLE: I had no idea where to start with fellowships. They shortlisted the ones that fitted my profile and helped me polish my CV.",
    name: "Sample Graduate",
    role: "Recent graduate",
    rating: 5,
  },
  {
    quote:
      "SAMPLE: Clear advice, honest about the process, and always quick to reply. I would recommend them to any professional planning the next career step.",
    name: "Sample Professional",
    role: "Working professional",
    rating: 5,
  },
];

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does 1M Scholars consulting cost?",
    answer:
      "Our fees are flexible and negotiated per client based on the service type and complexity. We never charge a fixed rate — we discuss with you first and agree on a fair price. Some services (like basic opportunity alerts) are free. Contact us to discuss your specific needs.",
  },
  {
    question: "Do you guarantee admission or placement?",
    answer:
      "No. 1M Scholars Ltd is a consultative agency. We provide expert guidance, document support, and application assistance, but final admission decisions rest entirely with the institutions. Fees paid cover our consulting services only.",
  },
  {
    question: "Who can use 1M Scholars services?",
    answer:
      "Our services are open to S4, S5, and S6 secondary students, university students at all levels, and working professionals seeking career advancement. We support Rwandan nationals, EAC citizens, and international applicants.",
  },
];
