/*
  English copy for /en/ai-workshop (round 5, the DE/EN switch). Each export mirrors the German one in
  content/pages/ki-workshop.ts (same names, same shape, same format keys, image paths and e-mail address; checked with
  Shape<...>). Written to the copy standard (plain words, no dashes as punctuation, no contrast framing) from the
  German meaning: where his German says "not only X, but Y", the English says the Y plainly.
*/
import type * as DE from "../../pages/ki-workshop";
import type { Shape } from "@/i18n/shape";

// The photos are the same in both languages.
export { KW_MEDIA } from "../../pages/ki-workshop";
export type { FormatKey } from "../../pages/ki-workshop";

export const KW_META: Shape<typeof DE.KW_META> = {
  title: "AI workshop for businesses",
  description: "Practical AI workshops for businesses: find concrete use cases, automations and strategies to use artificial intelligence efficiently.",
};

export const KW_HERO: Shape<typeof DE.KW_HERO> = {
  title: "Understand AI. Put it into practice.",
  accent: "Work more productively.",
  text: "Book Roman Tränkle as the AI trainer for your company. In hands-on workshops, your team learns to use artificial intelligence safely and sensibly in everyday work.",
  points: ["Tailored to your business processes", "Remote, on site or hybrid", "For teams and managers", "Clear and ready to use right away"],
  cta: "Request an AI workshop",
  tag: { name: "Roman Tränkle", role: "AI trainer & implementation partner", note: "Hands-on training" },
  alt: "Roman Tränkle in a workshop with a team",
};

export const KW_CHALLENGES: Shape<typeof DE.KW_CHALLENGES> = {
  title: "Many companies already use AI.",
  accent: "A clear structure is still missing.",
  text: "AI tools are available. What is often missing is the know-how to use them safely, productively and consistently across the company.",
  items: [
    { title: "Uncertainty in the team", text: "Employees do not know which AI tools they are allowed to use or how to work with them the right way." },
    { title: "Tool chaos", text: "Teams test different apps without building them into existing processes in a useful way." },
    { title: "Missing guidelines", text: "Data protection, approvals and internal rules are not clearly defined yet." },
    { title: "Too little practice", text: "Many training courses only explain the theory and change nothing in daily work." },
  ],
};

export const KW_RESULTS: Shape<typeof DE.KW_RESULTS> = {
  title: "From AI knowledge",
  accent: "to concrete applications.",
  text: "After the workshop, your team understands what AI can do and knows how to use it in their own area of work.",
  items: [
    "Spot relevant AI use cases",
    "Use the right tools safely",
    "Build better prompts and workflows",
    "Simplify recurring tasks",
    "Judge opportunities and risks realistically",
    "Set clear next steps",
  ],
  done: "Put into practice, guaranteed",
  cta: "Discuss your workshop goals",
};

export const KW_MODULES: Shape<typeof DE.KW_MODULES> = {
  title: "The right AI topics",
  accent: "for your daily work",
  text: "We put the content together by industry, skill level, department and your concrete goals.",
  pick: "Add to your workshop",
  items: [
    { title: "ChatGPT and prompting", text: "Write better instructions and get more reliable results." },
    { title: "AI tools in daily work", text: "Choose the right tools and use them productively in daily tasks." },
    { title: "AI automation", text: "Spot recurring processes and automate them where it makes sense." },
    { title: "AI for marketing and sales", text: "Optimize content, research, lead handling and customer communication." },
    { title: "AI strategy and implementation", text: "Set priorities for where to use AI and build a realistic AI roadmap." },
    { title: "AI literacy and safe use", text: "Understand what AI can do, its limits, data protection and responsible use of AI." },
  ],
  cta: "Request custom workshop content",
  // The same address; the subject is the page's English name, the body the chosen modules in English.
  mail: { to: "info@brandedgenius.de", subject: "AI workshop" },
};

export const KW_DEPARTMENTS: Shape<typeof DE.KW_DEPARTMENTS> = {
  title: "The right content for",
  accent: "different parts of your company",
  root: "Focus area for your team",
  items: [
    { title: "Management", text: "See where AI fits in your strategy, assess its potential and make confident decisions." },
    { title: "Marketing teams", text: "Run content, research, planning and campaigns more efficiently." },
    { title: "Sales teams", text: "Prepare leads, improve follow-ups and support CRM processes." },
    { title: "Customer service", text: "Optimize replies, knowledge management and recurring support processes." },
    { title: "Back office and operations", text: "Handle documents, data and internal workflows more easily." },
    { title: "HR and team leads", text: "Give employees the skills they need and encourage responsible use of AI." },
  ],
};

export const KW_FORMATS: Shape<typeof DE.KW_FORMATS> = {
  title: "Remote, on site,",
  accent: "hybrid or custom",
  items: [
    {
      key: "onsite",
      title: "On-site workshop",
      label: "At your location",
      text: "Interactive training right at your company. Ideal for teams, departments and managers.",
      alt: "Roman Tränkle in an on-site workshop",
    },
    {
      key: "online",
      title: "Online seminar",
      label: "Remote / virtual",
      text: "Compact, interactive training for distributed teams or a quick start.",
      alt: "Roman Tränkle in an online seminar",
    },
    {
      key: "hybrid",
      title: "Hybrid workshop",
      label: "Online & on site",
      text: "Online preparation, combined with an intensive on-site session and a follow-up.",
      alt: "Roman Tränkle on site and online",
    },
    {
      key: "custom",
      title: "Custom training",
      label: "100% tailored",
      text: "Tailored content for your industry, tools, goals and concrete use cases.",
      alt: "Roman Tränkle in a custom training session with a team",
    },
  ],
  notes: ["Suits small and large teams", "Flexible length and scope", "Real examples from your company", "Dates based on availability"],
};

export const KW_STEPS: Shape<typeof DE.KW_STEPS> = {
  title: "Five steps to",
  accent: "the right AI workshop",
  items: [
    { title: "Goal setting", text: "We talk through the audience, the current skill level and the results you want." },
    { title: "Topic selection", text: "Together we choose the right modules and practical use cases." },
    { title: "Preparation", text: "We tailor the content, exercises and examples to your company." },
    { title: "Delivery", text: "The workshop runs remotely, on site or in a hybrid format." },
    { title: "Transfer to practice", text: "Your team gets concrete recommendations, templates and clear next steps." },
  ],
  quote: "A good AI workshop ends with concrete use cases that your team understands and can use right away.",
  author: "Roman Tränkle",
  role: "Founder & AI trainer",
};

export const KW_TRAINER: Shape<typeof DE.KW_TRAINER> = {
  title: "Roman Tränkle",
  accent: "AI trainer and implementation partner",
  text: [
    "Roman Tränkle combines artificial intelligence with hands-on knowledge from marketing, sales, automation and digital business processes.",
    "His workshops are easy to follow and built around practical use. The goal: your team can put AI to productive use right away.",
  ],
  skillsLabel: "Core skills",
  skills: [
    "AI automation",
    "ChatGPT and AI tools",
    "Marketing and sales",
    "CRM and digital workflows",
    "Process optimization",
    "Team and leadership training",
    "AI literacy",
  ],
  cta: "Request a workshop with Roman",
  alt: "Roman Tränkle, AI trainer and implementation partner",
};

export const KW_ACADEMY: Shape<typeof DE.KW_ACADEMY> = {
  title: "Part of the",
  accent: "Branded Genius AI Academy",
  text: "Our AI workshops are part of the Branded Genius training program. The focus is on formats we develop for each company, team and leadership group.",
  perksLabel: "Your benefits",
  perks: ["Content that fits your company", "Concrete tasks and use cases", "Clear, easy-to-follow teaching", "Direct transfer into daily work"],
  cta: "Request a workshop quote",
};

export const KW_FAQ: Shape<typeof DE.KW_FAQ> = {
  title: "What to know about our",
  accent: "AI workshops",
  items: [
    { q: "Do we need prior knowledge?", a: "No. We match the content to what the participants already know." },
    { q: "How long does a workshop take?", a: "Depending on the goal, the format can run a few hours, a full day or several sessions." },
    { q: "Can the workshop cover our own business processes?", a: "Yes. We can build your own processes, tools and use cases into the workshop." },
    { q: "Can the workshops run remotely?", a: "Yes. The workshops can run online, on site or in a hybrid format." },
    { q: "How many people can take part?", a: "The format works for small groups and for larger teams and departments." },
    {
      q: "What does an AI workshop cost?",
      a: "The price depends on the length, the number of participants, the format and the preparation your workshop needs. You get a transparent quote.",
    },
  ],
};
