/*
  English copy for /en/use-cases (round 5, the DE/EN switch). Each export mirrors the German one in
  content/pages/use-cases.ts (same names, same shape, same project slugs and filter ids; checked with Shape<...>). The
  English is written to the copy standard (plain words, no dashes as punctuation, no contrast framing), from the
  German meaning. The projects are the client's real customers: their names stay as he writes them.
*/
import type * as DE from "../../pages/use-cases";
import type { Shape } from "@/i18n/shape";

/** A project: its slug and topics are the German ids (checked here, the code keys on them), its words English. */
type Project = Shape<DE.Project> & Pick<DE.Project, "slug" | "topics">;

export const UC_META: Shape<typeof DE.UC_META> = {
  title: "AI Use Cases for Businesses",
  description: "Explore practical AI use cases for marketing, sales, customer service and internal processes, and see how businesses work more efficiently with AI.",
};

export const UC_HERO: Shape<typeof DE.UC_HERO> = {
  title: "Digital solutions",
  accent: "that deliver measurable progress.",
  lead: "Explore selected projects and see how specific challenges turn into clear solutions that work and scale.",
  primary: "Send a request",
  secondary: "Discover our solution",
};

export const UC_PROJECTS: Shape<typeof DE.UC_PROJECTS> & { filters: { id: DE.FilterId; label: string }[] } = {
  title: "Different businesses.",
  accent: "Tailored solutions.",
  text: "Every project starts with a specific challenge. We fit it to the company's processes, audiences and goals.",
  filterLabel: "Filter by topic",
  filters: [
    { id: "all", label: "All projects" },
    { id: "ki", label: "AI & automation" },
    { id: "web", label: "Websites & landing pages" },
    { id: "marketing", label: "Marketing & lead generation" },
    { id: "crm", label: "CRM & sales processes" },
  ],
  open: "Open case study",
};

export const UC_CASE: Shape<typeof DE.UC_CASE> = {
  project: "Project",
  overview: "Project overview",
  challenge: "Starting point & challenge",
  solution: "Approach & focus areas",
  value: "Value for the business",
  valueText:
    "A structured customer path, higher conversion rates and noticeable relief for internal teams, because the services are easy to understand and the follow-up steps run smoothly.",
  question: "Interested in a similar solution for your business?",
  booking: "Book an initial consultation",
  contact: "Send a request",
  close: "Close",
};

export const UC_ITEMS: Project[] = [
  {
    slug: "mega-screen",
    number: "01",
    name: "Mega Screen",
    short: "Mega Screen",
    tag: "LED displays · Event solutions",
    summary: "A digital solution that presents LED display and event offers in a professional way.",
    overview:
      "The challenge was to present complex LED display and event solutions in a well-organized way that is easy to follow. The many services and areas of use needed a clear structure, so prospects find the right solution fast and are led straight to getting in touch.",
    challenge: "A range of event and display solutions needed a presentation that is clear, high-end and easy to understand.",
    solution: ["Digital brand presentation", "Structure for complex services", "Optimized user flow", "Easier contact"],
    topics: ["ki", "web", "marketing", "crm"],
  },
  {
    slug: "wrapwerk",
    number: "02",
    name: "WrapWerk Academy",
    short: "WrapWerk Academy",
    tag: "Vehicle wrapping · Window tinting",
    summary: "A modern digital platform that presents expert knowledge, services and training for vehicle wrapping.",
    overview:
      "A modern digital learning and service platform for the WrapWerk Academy. It brings expert knowledge, training and professional services for vehicle wrapping and window tinting together in one clear place.",
    challenge: "Courses, services and expertise needed one clear, shared digital structure.",
    solution: ["Academy positioning", "Well-organized course overview", "Clear path for prospects", "Optimized inquiry process"],
    topics: ["web", "marketing", "crm"],
  },
  {
    slug: "ledbow",
    number: "03",
    name: "LedBow Germany",
    short: "LedBow Germany",
    tag: "Crypto education · Investment strategies",
    summary: "A structured digital presence for cryptocurrency education.",
    overview:
      "A structured digital presence for cryptocurrency education. It makes complex information easy to understand and builds it into a clear path for customers to follow.",
    challenge: "Content that needs explaining had to be easy to understand and lead to a clear next step.",
    solution: ["Knowledge explained clearly", "Structured offer messaging", "User flow that builds trust", "Digital lead generation"],
    topics: ["web", "marketing"],
  },
  {
    slug: "cryptotransfer",
    number: "04",
    name: "Cryptotransfer",
    short: "Cryptotransfer",
    tag: "Digital processes · User flow",
    summary: "A structured digital solution for a technology-driven business model.",
    overview: "A structured digital solution for a technology-driven business model, with a focus on plain communication and clear next steps.",
    challenge: "Technology-driven processes needed a user flow that is transparent, secure and easy to understand.",
    solution: ["Process structure", "Intuitive user flow", "Transparent status updates", "Conversion optimization"],
    topics: ["ki", "marketing"],
  },
  {
    slug: "elysium",
    number: "05",
    name: "Elysium Agency",
    short: "Elysium Agency",
    tag: "Brand identity · Digital presence",
    summary: "A modern brand and web presence that connects positioning, user experience and customer inquiries.",
    overview: "A modern brand and web presence that connects positioning, user experience and customer inquiries.",
    challenge: "Premium services and creative skill needed an online showcase that is convincing, modern and built to win inquiries.",
    solution: ["Brand positioning", "Modern UI/UX design", "Lead capture", "Interactive showcase elements"],
    topics: ["web", "marketing"],
  },
  {
    slug: "km-electronics",
    number: "06",
    name: "K&M Electronics",
    short: "K&M Electronics",
    tag: "Technical services · Web presence",
    summary: "A clear digital overview of technical products and services.",
    overview: "A clear digital overview of technical products and services that makes customer communication easier to follow.",
    challenge: "Complex technical product features had to be quick to compare and easy to understand for business customers.",
    solution: ["Product catalog structure", "Technical specifications", "B2B inquiry form", "Search & filter logic"],
    topics: ["web", "crm"],
  },
  {
    slug: "martin-wildt",
    number: "07",
    name: "Martin Wildt – Real Estate Standing",
    short: "Martin Wildt",
    tag: "Real estate · Positioning",
    summary: "A professional digital showcase of real estate expertise.",
    overview: "A professional digital showcase of real estate expertise, with clear positioning and a user flow that builds trust.",
    challenge: "A high-end real estate portfolio called for a digital presence that builds trust and stays discreet.",
    solution: ["Prestigious design", "Guided property listings", "Discreet ways to get in touch", "Trust-building elements"],
    topics: ["web", "crm"],
  },
];

export const UC_FEATURED: Shape<typeof DE.UC_FEATURED> = {
  title: "Mega Screen",
  accent: "Display Platform",
  project: "Project 01 · LED & event solutions",
  status: "Live",
  facts: [
    { label: "Structure", value: "100% clarity" },
    { label: "Inquiry path", value: "Qualified directly" },
  ],
  pipeline: "Automation & pipeline",
  layers: ["Web", "AI agent", "CRM"],
  focus: "Industry focus: B2B, trades, services",
  individual: "100% custom",
  verified: "Verified real-world examples",
  cta: "View the Mega Screen case study",
};

export const UC_BENEFITS: Shape<typeof DE.UC_BENEFITS> = {
  title: "Technology must support",
  accent: "a concrete business goal.",
  text: "A successful digital solution looks professional. It also has to make information easy to understand, simplify processes and give users a clear next step.",
  items: [
    { title: "Clearer positioning", text: "Services, skills and added value become clear faster." },
    { title: "Better user flow", text: "Visitors find the information and next steps they need without detours." },
    { title: "More efficient processes", text: "Repeat tasks and communication flows run on automation where it makes sense." },
    { title: "More qualified inquiries", text: "Every touchpoint and every step toward an inquiry is aimed at the right prospects." },
    { title: "Connected systems", text: "Website, CRM, marketing and communication work as one process." },
    { title: "Scalable foundations", text: "The solution can grow with new requirements and rising demand." },
  ],
};

export const UC_CLOSING: Shape<typeof DE.UC_CLOSING> = {
  /** The name of the drawing above the headline (its accessible name; never shown). */
  label: "Your project could be the next one",
  title: "Let's turn your challenge",
  accent: "into a solution that works.",
  text: "Whether you want to modernize your digital presence, automate processes or win new customers, we analyze your starting point and show you which next steps make sense for your business.",
  primary: "Book a free initial consultation",
  secondary: "Discuss your project with no obligation",
  emailLabel: "Email:",
  email: "info@brandedgenius.de",
};
