/*
  English copy for /en/services (round 5, the DE/EN switch). Each export mirrors the German one in
  content/pages/leistungen.ts (same names, same shape, same ids, numbers and tool names; checked with Shape<...>). The
  English is written to the copy standard (plain words, no dashes as punctuation, no contrast framing), from the
  German meaning. Every link on this page goes to the client's own outside forms (site LINKS); the hero's pills link
  to the section ids, which stay German in both languages.
*/
import type * as DE from "../../pages/leistungen";
import type { Shape } from "@/i18n/shape";

export const LEISTUNGEN_META: Shape<typeof DE.LEISTUNGEN_META> = {
  title: "AI Services & Automation",
  description: "Discover the services of Branded Genius for AI agents, automation, digital processes, consulting and custom AI solutions for businesses.",
};

export const HERO: Shape<typeof DE.HERO> = {
  title: "AI systems that communicate naturally and",
  accent: "work for your business",
  text: "We build smart AI solutions that automate workflows, talk naturally with customers, support sales teams and connect business processes.",
  primary: "Discover your AI potential",
  secondary: "Talk to an AI expert",
  engine: "BG Engine",
};

/** The four services of his "BG Engine"; the ids are the German section ids. `lines` is the phone line break. */
export const SERVICES: Shape<typeof DE.SERVICES> = [
  { id: "ki-agenten", name: "AI Agents & Workflows", lines: ["AI Agents &", "Workflows"], sub: "Autonomous processes" },
  { id: "chatbots", name: "WhatsApp & Telegram Chatbots", lines: ["WhatsApp &", "Telegram Chatbots"], sub: "24/7 customer communication" },
  { id: "callbots", name: "AI Callbots", lines: ["AI Callbots"], sub: "Natural voice assistants" },
  { id: "marketing", name: "Marketing & Sales", lines: ["Marketing &", "Sales"], sub: "End-to-end automation" },
];

export const POTENZIAL: Shape<typeof DE.POTENZIAL> = {
  title: "Turn repetitive work into",
  accent: "smart processes",
  text: "Many businesses lose time to manual tasks, separate tools and repetitive communication. We find the biggest opportunities and build AI systems that handle tasks efficiently and communicate naturally.",
  benefits: [
    { title: "Automate repetitive processes", text: "Cut manual work on recurring tasks and workflows." },
    { title: "Respond faster", text: "Handle customer and lead requests without needless delays, in a natural tone." },
    { title: "Connect systems", text: "Build automated workflows between the tools your team already uses." },
    { title: "Scale efficiently", text: "Increase your operating capacity without the workload rising at the same rate." },
  ],
};

export const AGENTS: Shape<typeof DE.AGENTS> = {
  title: "AI agents that understand, act",
  accent: "and communicate naturally",
  text: "We build AI agents that understand information, support decisions, trigger actions and work with your existing systems. They communicate in context and become an active part of your business processes.",
  usesLabel: "Possible applications",
  uses: [
    "Lead qualification and routing",
    "Automated research",
    "Internal knowledge assistants",
    "Reporting and notifications",
    "Document and data processing",
    "CRM updates and task creation",
    "Customer service workflows",
    "Multi-step business processes",
  ],
  cta: "Explore AI agents",
  console: {
    ready: "Autonomous process ready",
    active: "Workflow active",
    finished: "Workflow completed successfully",
    start: "Start workflow",
    running: "Workflow running...",
    again: "Run again",
    done: "Done",
    steps: [
      { title: "1. New lead", text: "Received via website / form" },
      { title: "2. AI analysis", text: "Needs & relevance check" },
      { title: "3. Qualification", text: "Score: 94% / High priority", score: 94 },
      { title: "4. CRM update", text: "HubSpot / Pipedrive sync" },
      { title: "5. Task & follow-up", text: "Meeting suggestion & notification" },
    ],
    facts: ["Latency: <1.2 sec.", "100% GDPR compliant", "CRM real-time sync"],
  },
};

export const CHATBOTS: Shape<typeof DE.CHATBOTS> = {
  title: "Chats that feel like talking to a real employee",
  accent: "around the clock",
  text: "Our AI chatbots hold natural conversations in context on WhatsApp and Telegram and can take over large parts of your customer service.",
  usesLabel: "AI chatbots for",
  uses: [
    "WhatsApp and Telegram customer service",
    "Lead qualification and lead capture",
    "Appointment booking",
    "Internal staff support",
    "Natural 24/7 customer communication",
    "Product and service requests",
    "FAQ automation",
    "Automatic handover to real staff",
  ],
  cta: "Build an AI chatbot",
  phone: {
    channels: ["WhatsApp", "Telegram"],
    name: "Branded Genius",
    status: "Natural 24/7 customer communication",
    reset: "Reset chat",
    greeting: "Hello! Welcome to Branded Genius. How can I help you today?",
    replies: [
      { id: "consulting", label: "Request a consultation", user: "Consultation", reply: "Happy to help! We analyze your processes and show you concrete AI opportunities." },
      { id: "appointment", label: "Book an appointment", user: "Book an appointment", reply: "Happy to help! What time works best for you?" },
      { id: "service", label: "Service request", user: "Service request", reply: "Of course! Tell us briefly what you need." },
    ],
    expert: "Talk to an AI expert",
    handover: "Automatic handover to real staff",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    times: ["09:00", "10:30", "14:00", "16:30"],
  },
};

export const CALLBOTS: Shape<typeof DE.CALLBOTS> = {
  title: "Phone calls that feel like talking to a real employee",
  accent: "natural, smart and around the clock",
  text: "Our AI callbots speak with a natural voice, understand the context of the call and respond to each caller individually. They handle inbound and outbound calls, capture information, qualify prospects, book appointments and pass complex requests to real staff when needed.",
  cta: "Explore AI callbots",
  engine: {
    name: "Branded Genius Voice Engine",
    ready: "Ready for voice demo",
    playing: "Playing...",
    paused: "Paused",
    play: "Play",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    transcriptLabel: "Live transcription (voice to text)",
    speakers: { agent: "AI assistant", inbound: "Caller", outbound: "Mr. Weber" },
    credit: "Voices by ElevenLabs",
    modes: [
      {
        id: "inbound",
        label: "Inbound",
        title: "Inbound calls & service",
        topics: ["Customer inquiries", "Appointment requests", "Qualification", "Support", "Call forwarding"],
      },
      {
        id: "outbound",
        label: "Outbound",
        title: "Proactive sales & follow-up calls",
        topics: ["Lead qualification", "Follow-ups", "Appointment setting", "Reactivation", "Customer surveys"],
      },
    ],
  },
};

export const MARKETING: Shape<typeof DE.MARKETING> = {
  title: "Automate every step",
  accent: "from lead to customer",
  text: "We build smart workflows that connect marketing, sales, your CRM and AI systems that communicate naturally. They guide prospects from the first contact to the conversion. Information and actions move between platforms and teams automatically.",
  cta: "Automate your growth",
  pipelineLabel: "End-to-end pipeline",
  replay: "Replay",
  steps: [
    { title: "Lead capture", text: "Website, chat & ads" },
    { title: "Qualification", text: "AI scoring & analysis" },
    { title: "CRM", text: "Sync & contact history" },
    { title: "Follow-up", text: "Automated multichannel messages" },
    { title: "Appointment", text: "Direct calendar booking" },
    { title: "Sales", text: "Briefing for the sales team" },
    { title: "Conversion", text: "Deal closed & onboarding" },
    { title: "Reporting", text: "Dashboard & KPI tracking" },
  ],
  usesLabel: "Possible automations",
  uses: [
    "Automated lead capture",
    "CRM workflows",
    "Lead qualification and scoring",
    "Email and follow-up sequences",
    "Sales pipeline automation",
    "Appointment workflows",
    "Lead nurturing",
    "Customer reactivation",
    "AI-powered outreach",
    "Automated reporting",
  ],
};

export const ECOSYSTEM: Shape<typeof DE.ECOSYSTEM> = {
  title: "Your tools.",
  accent: "Connected into one smart system.",
  text: "AI adds the most value when it communicates naturally with people and works with your existing systems. We connect AI agents, chatbots and callbots with your systems to build automated, smart processes.",
  ready: "10 connected platforms & interfaces",
  live: "Live workflow simulation active",
  play: "Play workflow",
  reset: "Reset",
  sync: "Sync",
  stepOf: (step: number, total: number) => `Step ${step} of ${total}`,
  platforms: [
    { title: "CRM", tools: "HubSpot / Salesforce / Pipedrive" },
    { title: "Email", tools: "Outlook / Gmail / Klaviyo" },
    { title: "Calendar", tools: "Google / Calendly / Outlook" },
    { title: "Websites", tools: "WordPress / Webflow / Custom" },
    { title: "WhatsApp", tools: "Meta Cloud API / WABA" },
    { title: "Telegram", tools: "Bot API & Workspaces" },
    { title: "APIs & Webhooks", tools: "REST / GraphQL / Zapier / Make" },
    { title: "Databases", tools: "PostgreSQL / SQL / Notion" },
    { title: "Marketing platforms", tools: "Meta / Google Ads / LinkedIn" },
    { title: "Internal tools", tools: "Slack / Teams / ERP / Asana" },
  ],
  // The same seven steps and platform indexes as the German.
  steps: [
    { name: "New lead", platforms: [3, 8] },
    { name: "AI qualification", platforms: [6, 7] },
    { name: "CRM", platforms: [0] },
    { name: "Natural follow-up via WhatsApp or Telegram", platforms: [4, 5] },
    { name: "AI call", platforms: [6, 9] },
    { name: "Appointment", platforms: [2] },
    { name: "Sales team", platforms: [0, 9] },
  ],
  // The German opens with "Statt" (instead of); the English says the result plainly.
  closing: "The result is one connected system that communicates intelligently.",
  closingAccentAt: 3,
};

export const VORGEHEN: Shape<typeof DE.VORGEHEN> = {
  title: "From business process to",
  accent: "a working AI system",
  text: "We implement AI in a practical way and tailor each solution to your processes, your audiences and the tone you want.",
  phases: [
    { num: "01", title: "Process analysis", text: "We identify repetitive tasks, bottlenecks and relevant potential for automation." },
    { num: "02", title: "Use case assessment", text: "We determine where AI can create measurable value for your business." },
    { num: "03", title: "Solution design", text: "We define workflows, integrations, AI components, conversation logic and the technical system architecture." },
    { num: "04", title: "Implementation", text: "We build, integrate and test the solution for function and for natural, human-like communication." },
    { num: "05", title: "Optimization", text: "We monitor performance and keep improving the system and the quality of its conversations." },
  ],
};

// The German heading is a question; the English states it, so the line under it does not read as its answer.
export const CLOSING: Shape<typeof DE.CLOSING> = {
  title: "Find out where AI creates",
  accent: "the most value in your business",
  text: "We start with your current processes, find the biggest opportunities and build a fitting solution that communicates naturally with your customers.",
  primary: "Book an AI consultation",
  secondary: "Discuss your use case",
};
