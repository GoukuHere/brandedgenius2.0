/*
  English copy for the homepage and the site frame (round 5, the DE/EN switch). Each export mirrors the German one in
  content/site.ts (same names, same shape, same ids, image paths and outside links; checked with Shape<...>). The
  English is written to the copy standard (plain words, no dashes as punctuation, no contrast framing), from the
  German meaning; internal links use the English addresses (i18n/config.ts PAGES).

*/
import type * as DE from "../site";
import type { Shape } from "@/i18n/shape";
import { LINKS } from "../site";

// The outside links are the client's own (his forms and his German site's pages); they stay as they are.
export { LINKS } from "../site";

export const NAV: Shape<typeof DE.NAV> = [
  { label: "Home", href: "/en/" },
  { label: "Services", href: "/en/services/" },
  { label: "Use Cases", href: "/en/use-cases/" },
  { label: "AI Workshop", href: "/en/ai-workshop/" },
  { label: "About", href: "/en/about/" },
  { label: "Contact", href: "/en/contact/" },
];

export const HEADER: Shape<typeof DE.HEADER> = {
  cta: "Get in touch",
  mobileCta: "Analysis",
  menuCta: "Request an AI potential analysis",
};

/* Homepage, first half (group HOME-A): HERO to SERVICES. */

export const HERO: Shape<typeof DE.HERO> = {
  title: "AI automation",
  accent: "that delivers results.",
  label: "AI Agents & Workflows",
  text: "Branded Genius builds AI agents, automations and smart workflows for marketing, sales, customer service and internal processes. We cover every step, from the potential analysis to the rollout.",
  primary: "Request a potential analysis",
  secondary: "Strategy call",
  claim: ["Strategic.", "Automated.", "Measurable."],
};

export const PROBLEM: Shape<typeof DE.PROBLEM> = {
  title: "Many companies test AI.",
  accent: "Then it stalls in the test phase.",
  text: "The interest is there, and the potential still goes unused. Processes stay manual, tools work alone, there is no clear roadmap, teams feel unsure, and nobody can measure the results.",
  items: [
    { title: "AI gets tested and stops there", text: "Pilots stay in the test phase and never reach daily work." },
    { title: "Too many manual processes", text: "Key tasks take a lot of time, are prone to errors and cannot scale." },
    { title: "Tools are not connected", text: "Data and systems work in isolation, with no end-to-end integration." },
    { title: "No clear AI roadmap", text: "There is no strategy, no set of priorities and no plan for a lasting rollout." },
    { title: "Staff feel unsure", text: "People are unsure what AI is for, how to use it and what it changes at work." },
    { title: "No measurable results", text: "Wins cannot be measured, the impact stays unclear and the potential fades." },
  ],
  reality: [
    { label: "Tools", value: "Not connected to each other" },
    { label: "Data", value: "In separate systems" },
    { label: "Tasks", value: "Still done by hand" },
  ],
};

export const REALITY: Shape<typeof DE.REALITY> = {
  title: "The most common reasons AI projects",
  accent: "never go live.",
  text: "Many companies invest in AI tools. Without a clear strategy and structure, the potential goes unused and the results never come.",
  items: [
    { title: "No plan for AI", heading: { title: "No plan", accent: "for AI." }, text: "Every team tests its own tools. Nobody decides what comes first.", img: "/media/reality/r6-fahrplan.webp" },
    { title: "Disconnected tools", heading: { title: "Disconnected", accent: "tools." }, text: "Your team copies data by hand between the CRM, email and spreadsheets.", img: "/media/reality/r6-tools.webp" },
    { title: "Routine work costs time", heading: { title: "Routine work", accent: "costs time." }, text: "Your team still enters quotes, invoices and appointments by hand.", img: "/media/reality/r6-routine.webp" },
    { title: "The team is unsure", heading: { title: "The team", accent: "is unsure." }, text: "Nobody knows which tools are allowed. So the AI sits unused.", img: "/media/reality/r6-unsicher.webp" },
    { title: "Data protection comes too late", heading: { title: "Data protection", accent: "comes too late." }, text: "Just before launch, someone checks the rules. Then the project stops.", img: "/media/reality/r6-datenschutz.webp" },
    { title: "Nobody measures the value", heading: { title: "Nobody measures", accent: "the value." }, text: "The AI is running. Nobody knows how much time and money it saves.", img: "/media/reality/r6-nutzen.webp" },
  ],
};

export const COMPARE: Shape<typeof DE.COMPARE> = {
  title: "The difference between",
  accent: "testing AI and putting it to work.",
  text: "Two paths. Two results. You decide where your company goes.",
  vs: "VS",
  classic: {
    title: "The classic way",
    points: ["Many tools, no clear strategy", "Manual tasks stay in place", "No measurable impact", "Staff feel unsure", "Consulting often ends with concepts"],
    result: "Lots of effort. Little impact. No progress.",
  },
  ours: {
    title: "The Branded Genius way",
    points: ["AI potential analysis with a clear focus", "One roadmap for all your tools", "Automation in daily use", "Teams gain the skills", "Measurable improvement"],
    result: "Clear strategy. Measurable results. Lasting growth.",
  },
};

export const PROMISE: Shape<typeof DE.PROMISE> = {
  title: "We bring AI to where it creates real value:",
  accent: "your processes.",
  figures: [
    { value: "3 to 6 months", label: "to the first measurable results" },
    { value: "40 to 70%", label: "less manual work" },
    { value: "100%", label: "of your teams up to speed" },
    { value: "Lasting", label: "processes that stay and scale" },
  ],
};

export const SOLUTION: Shape<typeof DE.SOLUTION> = {
  title: "Branded Genius makes AI practical,",
  accent: "structured and ready to use.",
  text: "We turn AI potential into clear systems, efficient workflows and a rollout you can measure, for lasting business success.",
  pillars: [
    { title: "Plan", items: ["AI potential analysis", "Use case prioritization", "AI roadmap"] },
    { title: "Systems", items: ["AI workflows", "AI agents", "Automation systems"] },
    { title: "People", items: ["Workshops & training", "Ongoing optimization"] },
  ],
  primary: "Request an AI potential analysis",
  secondary: "Explore our solution",
  img: "/media/photos/desk.webp",
  imgAlt: "Roman Tränkle at his desk in front of the Branded Genius logo",
  cards: [
    { title: "Clear plan", items: ["Analysis", "Prioritization", "Roadmap"] },
    { title: "Connected processes", items: ["Workflows", "Agents", "Automation"] },
  ],
};

export const SYSTEM: Shape<typeof DE.SYSTEM> = {
  title: "We connect your existing tools into one",
  accent: "smart AI system",
  text: "Branded Genius links your systems, data and processes into one central, smart ecosystem. The result: better decisions, automated workflows and lasting growth.",
  claim: "All tools. One system. Smartly connected.",
  cta: "Request an AI potential analysis",
  qualities: [
    { title: "GDPR-aware", text: "Secure & compliant" },
    { title: "Cross-system", text: "Open & flexible" },
    { title: "Scalable", text: "Grows with you" },
    { title: "Enterprise-ready", text: "Stable & reliable" },
  ],
  nodes: [
    { title: "Website", tools: ["WordPress", "Webflow", "Framer", "Shopify"] },
    { title: "CRM", tools: ["GoHighLevel", "CRM Systems"] },
    { title: "Email", tools: ["Google Workspace", "Microsoft 365", "Email Marketing"] },
    { title: "Automation Tools", tools: ["n8n", "Make", "Zapier"] },
    { title: "WhatsApp", tools: ["Business API"] },
    { title: "Project Management", tools: ["ClickUp", "Asana", "Trello"] },
    { title: "Calendar Booking", tools: ["Google Calendar", "Calendly", "Microsoft Bookings"] },
    { title: "AI Agents", tools: ["Custom AI agents", "Claude Code", "Codex"] },
  ],
};

export const SERVICES: Shape<typeof DE.SERVICES> = {
  title: "Our services.",
  accent: "For AI results you can measure.",
  cta: "Explore our services",
  text: "Strategy, technology and training from one team, so AI goes live in your company and gets results.",
  items: [
    {
      id: "agents",
      title: "AI Agents & Workflows",
      text: "Smart AI agents and automated workflows that take over recurring processes, connect your systems and make internal work more efficient.",
      cta: "Agents & workflows",
    },
    {
      id: "chat",
      title: "AI Chatbots",
      text: "Smart chatbots for your website, support, customer service and lead qualification, tailored to your company, processes and systems.",
      cta: "Put chatbots to work",
    },
    {
      id: "calls",
      title: "AI Callbots",
      text: "AI voice assistants for inbound and outbound calls, lead qualification, booking appointments, support and follow-ups.",
      cta: "Put callbots to work",
    },
    {
      id: "marketing",
      title: "AI Marketing & Sales Automation",
      text: "Automated marketing and sales processes for lead generation, follow-ups, CRM, personal messaging and more efficient conversion.",
      cta: "Automate growth",
    },
  ],
};

/* Homepage, second half and the footer (group HOME-B): MEDIA, CASES to CONTACT. */

// The hero video and the contact details carry no words; they are the same in both languages.
export { CONTACT, MEDIA } from "../site";

export const CASES: Shape<typeof DE.CASES> = {
  title: "Real cases. Real results.",
  accent: "AI that works in your business.",
  text: "See how custom AI automation moves companies forward, with results you can measure.",
  doneLabel: "What we built",
  toolsLabel: "Tools used",
  items: [
    {
      id: "marketing",
      area: "Marketing",
      kind: "Automation",
      name: "Marketing Automation",
      tagline: "Lead generation, rethought.",
      text: "Automated campaign control and smart lead qualification raise conversion rates. The gains are measurable and they last.",
      metrics: [
        { value: "+43%", label: "More qualified leads in 90 days" },
        { value: "−62%", label: "Less manual work in marketing" },
        { value: "+28%", label: "Higher conversion rate on campaigns" },
      ],
      quote: "At last we have a system that automates our marketing and makes it measurably more successful.",
      role: "Head of Marketing",
      done: ["AI-powered audience analysis", "Automated campaign control", "Smart lead qualification", "Multi-channel follow-up automation", "Real-time reporting & optimization"],
      tools: ["n8n", "Make", "Google Ads", "ActiveCampaign", "Zapier"],
    },
    {
      id: "vertrieb",
      area: "Sales",
      kind: "Automation",
      name: "Sales Automation",
      tagline: "More deals closed. Less manual sales work.",
      text: "AI-powered pipeline control and automated follow-ups turn qualified meetings into closed deals faster.",
      metrics: [
        { value: "+37%", label: "More qualified meetings in 90 days" },
        { value: "−54%", label: "Less manual work in sales" },
        { value: "+31%", label: "Higher close rate from automated follow-ups" },
      ],
      quote: "Our sales team is now more structured, faster and much more efficient, and we close noticeably more deals.",
      role: "Head of Sales",
      done: ["AI-powered lead qualification", "Automated follow-up sequences", "Real-time pipeline prioritization", "Meeting booking & sales routing", "Reporting on close rates & sales performance"],
      tools: ["LinkedIn", "HubSpot", "Pipedrive", "Google Ads", "Custom CRM"],
    },
    {
      id: "kundenservice",
      area: "Support",
      kind: "Chatbot",
      name: "Customer Service Chatbot",
      tagline: "Answer faster. Look after customers better.",
      text: "The bot recognizes each request on its own and hands it over smoothly. That takes load off your service team and keeps you responsive 24/7.",
      metrics: [
        { value: "+61%", label: "Faster first response in customer service" },
        { value: "−47%", label: "Fewer manual support requests" },
        { value: "+34%", label: "Higher resolution rate from chatbot automation" },
      ],
      quote: "Our customer service is now faster, more structured and available around the clock.",
      role: "Head of Customer Support",
      done: ["AI-powered request detection", "Automated reply workflows", "Smart handover to staff", "24/7 chatbot support", "Real-time reporting & service optimization"],
      tools: ["Intercom", "Zendesk", "HubSpot", "WhatsApp", "Slack"],
    },
    {
      id: "backoffice",
      area: "Back Office",
      kind: "Automation",
      name: "Back Office Automation",
      tagline: "Automate processes. Cut the workload sharply.",
      text: "Automatic document capture and error-free approval workflows speed up internal admin work significantly.",
      metrics: [
        { value: "+68%", label: "Faster case handling in 90 days" },
        { value: "−59%", label: "Less manual work in the back office" },
        { value: "−41%", label: "Fewer process errors through automation" },
      ],
      quote: "Our back office processes are now more structured, faster and almost free of errors.",
      role: "Operations Manager",
      done: ["AI-powered document recognition", "Automated invoice & receipt processing", "Smart approval workflows", "Data sync between systems", "Real-time reporting & process monitoring"],
      tools: ["Zapier", "Slack", "Airtable", "Google Drive", "n8n"],
    },
    {
      id: "telefonie",
      area: "Phone",
      kind: "AI Assistant",
      name: "Phone AI Assistant",
      tagline: "Automate calls. Scale your availability the smart way.",
      text: "Smart voice assistants qualify callers around the clock and book appointments on their own.",
      metrics: [
        { value: "+74%", label: "Faster call answering in 90 days" },
        { value: "−58%", label: "Fewer missed calls in customer service" },
        { value: "+36%", label: "More booked appointments through AI calls" },
      ],
      quote: "Our phone process is now available around the clock, faster and much more reliable. It has made a real difference for us.",
      role: "Operations Manager",
      done: ["AI-powered call answering", "Smart call qualification", "Automated appointment booking", "Transfer to the right contact", "Real-time reporting & call analysis"],
      tools: ["Twilio", "Vapi", "ElevenLabs", "HubSpot", "n8n"],
    },
    {
      id: "crm",
      area: "CRM",
      kind: "Follow-up",
      name: "CRM Follow-up",
      tagline: "Follow up on every lead. Stop losing potential.",
      text: "Automated reactivation sequences make sure no valuable lead gets lost in follow-up.",
      metrics: [
        { value: "+46%", label: "More reactivated leads in 90 days" },
        { value: "−63%", label: "Less manual work in follow-up" },
        { value: "+29%", label: "Higher reply rate on follow-up sequences" },
      ],
      quote: "Our CRM is now more structured and faster, and we lose no leads in follow-up.",
      role: "Sales Operations Manager",
      done: ["Automated follow-up sequences", "Lead reactivation from the CRM", "Pipeline triggers & reminders", "Personal WhatsApp & email follow-ups", "Real-time reporting & deal tracking"],
      tools: ["HubSpot", "Pipedrive", "WhatsApp", "n8n", "Make"],
    },
  ],
};

export const PROCESS: Shape<typeof DE.PROCESS> = {
  title: "From the AI potential analysis",
  accent: "to a structured rollout.",
  text: "A clear process with transparent milestones, so AI goes from an idea to daily, productive use in your business.",
  steps: [
    { title: "AI potential analysis", text: "We analyze your processes and find the biggest levers for automation and AI.", img: "/media/process/analyse.webp" },
    { title: "Filter use cases", text: "We rate possible use cases by impact, effort and realistic benefit.", img: "/media/process/filtern.webp" },
    { title: "AI roadmap", text: "You get a clear plan with prioritized steps for the rollout.", img: "/media/process/roadmap.webp" },
    { title: "Pilot project", text: "We start with one clearly defined use case that is realistic to build.", img: "/media/process/pilot.webp" },
    { title: "Implementation", text: "We integrate automations, workflows and AI agents safely into your existing processes.", img: "/media/process/implementierung.webp" },
    { title: "Hands-on training", text: "Your team learns to use the new systems safely, efficiently and productively in daily work.", img: "/media/process/training.webp" },
    { title: "Optimization & scaling", text: "We measure results, keep optimizing and scale successful processes step by step.", img: "/media/process/skalierung.webp" },
  ],
};

export const WHY: Shape<typeof DE.WHY> = {
  title: "AI consulting is good.",
  accent: "Implementation is better.",
  text: "We turn concepts into working systems. We implement, automate and deliver measurable results, in direct contact with your management.",
  center: { title: "Roman Tränkle & Team", text: "AI Center" },
  reasons: [
    { id: "positionierung", title: "Personal expert positioning", text: "Roman Tränkle guides you in person, for positioning that is credible and effective." },
    { id: "erfahrung", title: "Marketing & sales experience", text: "Solid hands-on knowledge for customer-focused sales and marketing processes." },
    { id: "business-use", title: "AI automation with real business use", text: "We focus on profitable processes that save noticeable working time and lift revenue." },
    { id: "aus-einer-hand", title: "Consulting & implementation from one team", text: "Strategy, technology and delivery, bundled in one place." },
    { id: "pilotprojekte", title: "Fast pilot projects", text: "From concept to a working pilot with measurable results in a few weeks." },
    { id: "workshops", title: "Team workshops included", text: "Practical training that anchors AI in your team, safely and for the long term." },
  ],
};

export const IMPACT: Shape<typeof DE.IMPACT> = {
  title: "AI pays off when it",
  accent: "improves measurable processes.",
  text: "We make measurable improvements in your business, aimed where they count.",
  principles: [
    { title: "Data-driven", text: "Built on facts" },
    { title: "Process-focused", text: "Tools that fit the process" },
    { title: "Measurable", text: "Results you can see" },
  ],
  live: {
    label: "Live performance",
    title: "AI workflow: lead qualification",
    text: "Automated replies and direct sync to the CRM.",
    metricLabel: "Process cycle time",
    metric: "−84%",
  },
  benefits: [
    { id: "effizienz", title: "More efficiency", text: "Repetitive routine tasks go away. Your team gains valuable time for core work." },
    { id: "reaktionszeit", title: "Faster response time", text: "The system handles customer requests and leads automatically and reliably, in seconds." },
    { id: "reporting", title: "Clearer reporting", text: "Key performance data and dashboards support sound, transparent business decisions." },
    { id: "skalierbarkeit", title: "Easier scaling", text: "Automated workflows grow with your business volume, with no extra staff costs." },
  ],
  goal: {
    title: "AI that creates real",
    accent: "business impact.",
    text: "Strategy, automation and measurable impact for lasting, profitable growth.",
    cta: "Let's find your business impact.",
    ctaText: "Together we find out where AI makes the biggest difference in your business.",
  },
};

export const WORKSHOP: Shape<typeof DE.WORKSHOP> = {
  title: "Book Roman Tränkle as an AI trainer",
  accent: "for your company.",
  tagline: "Practical. Clear. Ready to use.",
  text: "We train your teams to use AI safely and to create real value for your business with it.",
  quote: "My goal is for your team to understand AI and to put it to real use in your business.",
  author: "Roman Tränkle",
  formatsLabel: "Our workshop formats",
  formats: [
    { title: "On-site workshops", text: "Interactive hands-on workshops, held right at your company.", img: "/media/workshop/vor-ort.webp" },
    { title: "Online seminars", text: "Compact live online training with practical exercises and personal exchange.", img: "/media/workshop/r6-online.webp" },
    { title: "Leadership workshops", text: "Strategic decision skills and future readiness for managers and boards.", img: "/media/workshop/leadership.webp" },
    { title: "Custom training", text: "Tailored training content for specific departments and concrete use cases.", img: "/media/workshop/r6-individuell.webp" },
  ],
  topicsLabel: "Example topics",
  topics: [
    "Generative AI in everyday business",
    "AI-powered processes & automation",
    "Using ChatGPT & co. effectively",
    "AI in marketing & sales",
    "Data, security & legal basics",
    "AI strategy & use case development",
    "AI tools, workflows & best practices",
  ],
  cta: "Book an appointment",
};

export const PARTNERS: Shape<typeof DE.PARTNERS> = {
  title: "Our partners",
  names: ["Zapier", "ElevenLabs", "Google", "Runway", "OpenAI", "HighLevel"],
};

// The testimonials are the clients' own German videos; their quotes are given here in English.
export const VOICES: Shape<typeof DE.VOICES> = {
  title: "Real voices.",
  accent: "Real results.",
  text: "Our clients share how we work together and the measurable results of their projects.",
  items: [
    { quote: "The automations changed our processes from the ground up.", name: "Andrea M.", role: "Managing Director", img: "/media/testimonials/t1-portrait.webp", youtube: "c4E5xufPoAI" },
    { quote: "Branded Genius speaks our language and delivers results.", name: "Daniel K.", role: "Managing Director, Novaro Digital GmbH", img: "/media/testimonials/t2-portrait.webp", youtube: "D5qQ3EHY800" },
    { quote: "Excellent support from the first idea to the finished integration.", name: "Sebastian S.", role: "Head of Operations, Velo Media Group", img: "/media/testimonials/t3-portrait.webp", youtube: "Wg4umIAImEw" },
    { quote: "Working with them was professional, fast and easy from day one.", name: "Michael R.", role: "Managing Director, Nova Consulting GmbH", img: "/media/testimonials/t4-portrait.webp", youtube: "emZJGuqHMBY" },
  ],
};

export const CTA: Shape<typeof DE.CTA> = {
  title: "Ready to automate",
  accent: "your business with AI?",
  text: "In a free potential analysis or a personal strategy call, you learn which processes in your business you can automate fastest and most effectively.",
  primary: "Request an AI potential analysis",
  secondary: "Book a strategy call",
  checks: ["100% free & no obligation", "Concrete recommendations", "No preparation needed"],
};

export const FOOTER: Shape<typeof DE.FOOTER> = {
  title: "Let's",
  accent: "talk.",
  text: "Grow your business with AI-powered solutions.",
  cta: "Book a consultation",
  // The English pages from the English NAV; the blog and the AI Wikipedia are the client's German pages.
  discover: { title: "Explore", links: [...NAV.slice(1, 5), { label: "Blog", href: LINKS.blog }, { label: "AI Wikipedia", href: LINKS.wiki }] },
  connect: {
    title: "Connect",
    links: [{ label: "Contact", href: LINKS.contact }],
  },
  legal: [
    { label: "Terms", href: LINKS.terms },
    { label: "Privacy", href: LINKS.privacy },
    { label: "Legal notice", href: LINKS.imprint },
  ],
  copyright: "© 2026 Branded Genius.",
};
