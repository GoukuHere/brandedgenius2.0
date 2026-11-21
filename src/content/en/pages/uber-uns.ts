/*
  English copy for the About page, /en/about (round 5, the DE/EN switch). Each export mirrors the German one in
  content/pages/uber-uns.ts (same names, same shape, same image paths; checked with Shape<...>). Written to the copy
  standard from the German meaning: plain words, no dashes as punctuation, no contrast framing. Roman Tränkle's quote
  is his own words, translated faithfully.
*/
import type * as DE from "../../pages/uber-uns";
import type { Shape } from "@/i18n/shape";

export const UU_META: Shape<typeof DE.UU_META> = {
  title: "About Branded Genius | AI & Automation",
  description: "Get to know Branded Genius: our mission, how we work and our focus on AI, automation and digital solutions.",
};

export const UU_HERO: Shape<typeof DE.UU_HERO> = {
  title: "We make AI easy to understand,",
  accent: "practical and profitable.",
  text: "We build solutions that solve real business problems and create measurable value.",
  cta: "Explore our expertise",
  kind: "AI agency",
  tagline: "Strategy • Execution • Excellence",
};

export const UU_WHO: Shape<typeof DE.UU_WHO> = {
  title: "Your partner for",
  accent: "AI-powered business growth",
  text: "Branded Genius is a German agency for AI, automation and digital growth.",
  photo: "/media/photos/team.webp",
  alt: "Roman Tränkle and the Branded Genius team",
};

export const UU_MISSION: Shape<typeof DE.UU_MISSION> = {
  title: "We make artificial intelligence",
  accent: "accessible to businesses.",
  lead: "Our mission is to make AI easy to understand and use for businesses of every size.",
  goalsIntro: "Our mission rests on three core goals:",
  goals: [
    { title: "Simplify business processes", tag: "Efficiency & focus" },
    { title: "Improve marketing and sales performance", tag: "Reach & leads" },
    { title: "Create lasting, measurable growth", tag: "Scaling & ROI" },
  ],
};

export const UU_FOUNDER: Shape<typeof DE.UU_FOUNDER> = {
  name: "Roman Tränkle,",
  role: "founder of Branded Genius",
  quoteTitle: "\"AI should not make a business more complicated.",
  quoteAccent: "It should save time, make better decisions possible and help people work more efficiently.\"",
  bio: [
    "Roman Tränkle is the founder of Branded Genius and an expert in AI-powered marketing, business automation and digital growth.",
    "With a solid background in marketing and communication, he combines strategic business thinking with a hands-on understanding of modern AI technology.",
    "Roman founded Branded Genius with one clear goal: to help businesses put artificial intelligence into practice, so that it adds real value to their daily work.",
    "Together with his team, he builds practical solutions that connect marketing, sales, customer communication and internal processes in a smart way.",
  ],
  photo: "/media/photos/roman-standing.webp",
  alt: "Roman Tränkle",
};

export const UU_EXPERTISE: Shape<typeof DE.UU_EXPERTISE> = {
  title: "Strategy, technology and growth",
  accent: "under one roof",
  text: "Our expertise covers every step, from finding the right opportunities to a successful implementation and the ongoing optimization of the solution.",
  areas: [
    {
      title: "AI strategy and consulting",
      tag: "Clarity & ROI focus",
      text: "We analyze your business, find the right uses for AI and build a clear implementation plan.",
      img: "/media/pages/uber-uns/strategie.webp",
    },
    {
      title: "AI agents and automation",
      tag: "Time saved & fewer errors",
      text: "We build smart systems that automate repetitive tasks, structure information and improve internal workflows.",
      img: "/media/pages/uber-uns/automatisierung.webp",
    },
    {
      title: "Marketing and lead generation",
      tag: "More qualified inquiries",
      text: "We build data-driven campaigns and digital strategies that help businesses reach their target audience and win qualified inquiries.",
      img: "/media/pages/uber-uns/marketing.webp",
    },
    {
      title: "CRM and sales automation",
      tag: "Higher closing rates",
      text: "We connect customer data, communication and follow-up processes, so sales teams can work faster and more efficiently.",
      img: "/media/pages/uber-uns/vertrieb.webp",
    },
    {
      title: "Websites and digital experiences",
      tag: "Maximum conversion power",
      text: "We build modern, conversion-optimized websites and landing pages that present your company professionally and support your business goals.",
      img: "/media/pages/uber-uns/websites.webp",
    },
    {
      title: "AI-powered content production",
      tag: "Scalable media content",
      text: "We combine creative strategy with modern AI tools to produce videos, images and copy at scale for digital channels.",
      img: "/media/pages/uber-uns/content.webp",
    },
  ],
};

export const UU_TRUST: Shape<typeof DE.UU_TRUST> = {
  title: "Technology is only valuable when it",
  accent: "works reliably.",
  text: "Successful AI has to fit the business it runs in. That is why we build reliable solutions, tailored to your processes, goals and requirements.",
  listLabel: "What you can expect from us:",
  standard: "Reliable standards",
  promises: [
    "Clear and honest communication",
    "Solutions tailored individually to your business",
    "Transparent processes and clear responsibilities",
    "Practical implementation and promises we keep",
    "Careful testing before going live",
    "Continuous optimization and support",
    "Responsible handling of company and customer data",
  ],
  // The same promises on the seal's two rings, in the German order. The English wording runs close to the German
  // length, so each ring's text still closes its circle with only slightly wider spacing.
  rings: {
    full: [
      ["Solutions tailored individually to your business", "Responsible handling of company and customer data", "Transparent processes and clear responsibilities"],
      ["Clear and honest communication", "Practical implementation and promises we keep", "Careful testing before going live", "Continuous optimization and support"],
    ],
    short: [
      ["Practical implementation and promises we keep", "Responsible handling of customer data", "Individually tailored solutions"],
      ["Clear and honest communication", "Transparent processes", "Careful testing", "Continuous optimization"],
    ],
  },
};

export const UU_PROCESS: Shape<typeof DE.UU_PROCESS> = {
  title: "From challenge to",
  accent: "a working solution",
  text: "Our structured method keeps every project focused, transparent and measurable.",
  stepWord: "Step",
  steps: [
    { title: "Understand", label: "Analysis & context", text: "We get to know your business, your current processes, your challenges and your goals." },
    {
      title: "Analyze",
      label: "Potential audit",
      text: "We spot inefficient workflows and check where AI, automation or digital marketing can create the most value.",
    },
    { title: "Plan", label: "Strategy roadmap", text: "We build a clear strategy with priorities, responsibilities and realistic next steps." },
    { title: "Implement", label: "Development & integration", text: "Our team builds and connects the systems, campaigns and automated workflows you need." },
    { title: "Test", label: "Quality & staging", text: "We check the solution with care, fix any problems and get it ready for daily use." },
    { title: "Optimize", label: "Growth & monitoring", text: "We measure the results and keep improving the system based on real performance data." },
  ],
};

export const UU_CTA: Shape<typeof DE.UU_CTA> = {
  title: "Let's turn your AI potential into",
  accent: "real business results.",
  text: "Starting out with AI or improving your processes: in a free initial consultation, we analyze your challenges, spot your potential and show you the most useful next steps for your business.",
  cta: "Book a free initial consultation",
  assurance: [
    "Plain language you can follow.",
    "A solution that fits your business.",
    "A clear conversation about your business and its opportunities.",
  ],
};
