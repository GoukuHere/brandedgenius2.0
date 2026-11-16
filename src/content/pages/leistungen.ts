// The copy of /leistungen, all of it the client's own, from brandedgenius.de/leistungen/ (November 2026): the page
// text, plus the words his own demos show on that page (the chatbot's lines, the voice engine's states and transcript,
// the workflow states). Shortened only by leaving things out. Changes, each listed in the build report:
// - "Verwandeln Sie repetitive Arbeit intelligente Prozesse" misses a word on his site: "in" is added.
// - His en dashes in two headings are dropped where the accent phrase starts its own line.
// - His all-caps status lines ("AUTONOMER PROZESS BEREIT") are set in sentence case.
// The only strings that are not his: the weekday abbreviations and times of the chat's slot picker (the brief allows
// weekdays and times there). Every accessible name is one of his own lines too.

export const HERO = {
  title: "KI-Systeme, die natürlich kommunizieren und für",
  accent: "Ihr Unternehmen arbeiten",
  // The first of his two lead sentences.
  text: "Wir entwickeln intelligente KI-Lösungen, die Workflows automatisieren, natürlich mit Kunden kommunizieren, Vertriebsteams unterstützen und Geschäftsprozesse verbinden.",
  primary: "KI-Potenziale entdecken",
  secondary: "Mit einem KI-Experten sprechen",
  // His label under the core of the engine ("BG ENGINE"), used as the engine's accessible name.
  engine: "BG Engine",
};

/** The four services of his "BG Engine", each linking to its section below. `lines` is his own line break. */
export const SERVICES = [
  { id: "ki-agenten", name: "KI-Agenten & Workflows", lines: ["KI-Agenten &", "Workflows"], sub: "Autonome Prozessausführung" },
  { id: "chatbots", name: "WhatsApp- & Telegram-Chatbots", lines: ["WhatsApp- &", "Telegram-Chatbots"], sub: "24/7 Kundenkommunikation" },
  { id: "callbots", name: "KI-Callbots", lines: ["KI-Callbots"], sub: "Natürliche Sprachassistenten" },
  { id: "marketing", name: "Marketing & Vertrieb", lines: ["Marketing &", "Vertrieb"], sub: "End-to-End Automatisierung" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const POTENZIAL = {
  title: "Verwandeln Sie repetitive Arbeit in",
  accent: "intelligente Prozesse",
  text: "Viele Unternehmen verlieren Zeit durch manuelle Aufgaben, isolierte Tools und wiederkehrende Kommunikation. Wir identifizieren die größten Potenziale und entwickeln KI-Systeme, die Aufgaben effizient übernehmen und natürlich kommunizieren.",
  benefits: [
    { title: "Repetitive Prozesse automatisieren", text: "Reduzieren Sie manuelle Arbeit bei wiederkehrenden Aufgaben und Abläufen." },
    { title: "Schneller reagieren", text: "Bearbeiten Sie Kunden- und Lead-Anfragen ohne unnötige Verzögerungen und in einer natürlichen Tonalität." },
    { title: "Systeme verbinden", text: "Schaffen Sie automatisierte Workflows zwischen den Tools, die Ihr Team bereits nutzt." },
    { title: "Effizient skalieren", text: "Steigern Sie Ihre operative Kapazität, ohne dass der Arbeitsaufwand im gleichen Verhältnis wächst." },
  ],
};

export const AGENTS = {
  title: "KI-Agenten, die verstehen, handeln",
  accent: "und natürlich kommunizieren",
  text: "Wir entwickeln KI-Agenten, die Informationen verstehen, Entscheidungen unterstützen, Aktionen auslösen und mit bestehenden Systemen interagieren. Sie kommunizieren kontextbezogen und werden zum aktiven Bestandteil Ihrer Geschäftsprozesse.",
  usesLabel: "Mögliche Einsatzbereiche",
  uses: [
    "Lead-Qualifizierung und Weiterleitung",
    "Automatisierte Recherche",
    "Interne Wissensassistenten",
    "Reporting und Benachrichtigungen",
    "Dokumenten- und Datenverarbeitung",
    "CRM-Aktualisierungen und Aufgabenerstellung",
    "Kundenservice-Workflows",
    "Mehrstufige Geschäftsprozesse",
  ],
  cta: "KI-Agenten entdecken",
  // His agent console and the states his own script shows.
  console: {
    ready: "Autonomer Prozess bereit",
    active: "Workflow aktiv",
    finished: "Workflow erfolgreich abgeschlossen",
    start: "Workflow starten",
    running: "Workflow läuft...",
    again: "Erneut starten",
    done: "Erledigt",
    steps: [
      { title: "1. Neuer Lead", text: "Eingang via Website / Formular" },
      { title: "2. KI-Analyse", text: "Bedarf & Relevanzprüfung" },
      { title: "3. Qualifizierung", text: "Score: 94% / High Priority", score: 94 },
      { title: "4. CRM-Aktualisierung", text: "HubSpot / Pipedrive Sync" },
      { title: "5. Aufgabe & Follow-up", text: "Terminvorschlag & Benachrichtigung" },
    ],
    facts: ["Latenz: <1.2 Sek.", "100% DSGVO-konform", "CRM Real-time Sync"],
  },
};

export const CHATBOTS = {
  title: "Kommunikation wie mit einem echten Mitarbeiter",
  accent: "rund um die Uhr",
  // The first of his two sentences.
  text: "Unsere KI-Chatbots führen über WhatsApp und Telegram natürliche, kontextbezogene Gespräche und können große Teile des Kundenservices übernehmen.",
  usesLabel: "KI-Chatbots für",
  uses: [
    "WhatsApp- und Telegram-Kundenservice",
    "Lead-Qualifizierung und Lead-Erfassung",
    "Terminvereinbarung",
    "Interne Mitarbeiterunterstützung",
    "Natürliche 24/7-Kundenkommunikation",
    "Produkt- und Serviceanfragen",
    "FAQ-Automatisierung",
    "Automatische Übergabe an echte Mitarbeiter",
  ],
  cta: "KI-Chatbot entwickeln",
  // His chatbot demo: the channel tabs, the bot's own lines and the three quick replies.
  phone: {
    channels: ["WhatsApp", "Telegram"],
    name: "Branded Genius",
    status: "Natürliche 24/7-Kundenkommunikation",
    reset: "Chat zurücksetzen",
    greeting: "Guten Tag! Willkommen bei Branded Genius. Wie kann ich Sie heute unterstützen?",
    replies: [
      // `user` is what his script sends as the visitor's message; `reply` the first sentence(s) of his bot's answer.
      { id: "consulting", label: "Beratung anfragen", user: "Beratung", reply: "Sehr gerne! Wir analysieren Ihre Prozesse und zeigen Ihnen konkrete KI-Potenziale." },
      { id: "appointment", label: "Termin buchen", user: "Termin buchen", reply: "Sehr gerne! Wann passt es Ihnen am besten?" },
      { id: "service", label: "Serviceanfrage", user: "Serviceanfrage", reply: "Natürlich! Beschreiben Sie uns kurz Ihr Anliegen." },
    ],
    // "Beratung anfragen" ends in his hero's second button, as a card in the chat.
    expert: "Mit einem KI-Experten sprechen",
    // "Serviceanfrage" ends in his own line about the handover.
    handover: "Automatische Übergabe an echte Mitarbeiter",
    // The slot picker of "Termin buchen": weekdays and times only (not his words; the brief allows them).
    days: ["Mo", "Di", "Mi", "Do", "Fr"],
    times: ["09:00", "10:30", "14:00", "16:30"],
  },
};

export const CALLBOTS = {
  title: "Telefongespräche wie mit einem echten Mitarbeiter",
  accent: "natürlich, intelligent und rund um die Uhr",
  text: "Unsere KI-Callbots sprechen mit natürlicher Stimme, verstehen den Gesprächskontext und reagieren individuell. Sie bearbeiten eingehende und ausgehende Anrufe, erfassen Informationen, qualifizieren Interessenten, vereinbaren Termine und leiten komplexe Anliegen bei Bedarf an echte Mitarbeiter weiter.",
  cta: "KI-Callbots entdecken",
  // His "Branded Genius Voice Engine" and the states, buttons and transcript of his own demo.
  engine: {
    name: "Branded Genius Voice Engine",
    ready: "Bereit für Sprachdemo",
    playing: "Spielt ab...",
    paused: "Pausiert",
    play: "Abspielen",
    pause: "Pause",
    resume: "Fortsetzen",
    restart: "Neu starten",
    transcriptLabel: "Live-Transkription (Voice-to-Text)",
    transcript: "„Guten Tag. Willkommen bei Branded Genius. Wie kann ich Sie heute unterstützen?“",
    modes: [
      {
        id: "inbound",
        label: "Inbound",
        title: "Eingehende Anrufe & Service",
        topics: ["Kundenanfragen", "Terminanfragen", "Qualifizierung", "Support", "Anrufweiterleitung"],
      },
      {
        id: "outbound",
        label: "Outbound",
        title: "Proaktive Vertriebs- & Follow-up-Anrufe",
        topics: ["Lead-Qualifizierung", "Follow-ups", "Terminvereinbarung", "Reaktivierung", "Kundenbefragungen"],
      },
    ],
  },
};

export const MARKETING = {
  title: "Automatisieren Sie",
  accent: "Ihre Customer Journey",
  text: "Wir verbinden Marketing, Vertrieb, CRM und natürlich kommunizierende KI-Systeme zu intelligenten Workflows, die Interessenten von der ersten Interaktion bis zur Conversion begleiten. Informationen und Aktionen fließen dabei automatisch zwischen Plattformen und Teams.",
  cta: "Wachstum automatisieren",
  pipelineLabel: "End-to-End Pipeline",
  replay: "Replay",
  steps: [
    { title: "Lead-Erfassung", text: "Website, Chat & Ads" },
    { title: "Qualifizierung", text: "KI-Scoring & Analyse" },
    { title: "CRM", text: "Sync & Kontakthistorie" },
    { title: "Follow-up", text: "Automatisierte Mehrkanal-Nachrichten" },
    { title: "Termin", text: "Direkte Kalenderbuchung" },
    { title: "Vertrieb", text: "Briefing für Sales-Team" },
    { title: "Conversion", text: "Abschluss & Onboarding" },
    { title: "Reporting", text: "Dashboard & KPI-Tracking" },
  ],
  usesLabel: "Mögliche Automatisierungen",
  uses: [
    "Automatisierte Lead-Erfassung",
    "CRM-Workflows",
    "Lead-Qualifizierung und Scoring",
    "E-Mail- und Follow-up-Sequenzen",
    "Sales-Pipeline-Automatisierung",
    "Termin-Workflows",
    "Lead-Nurturing",
    "Kundenreaktivierung",
    "KI-gestützter Outreach",
    "Automatisiertes Reporting",
  ],
};

export const ECOSYSTEM = {
  title: "Ihre Tools.",
  accent: "Verbunden zu einem intelligenten System.",
  text: "KI entfaltet ihren größten Mehrwert, wenn sie natürlich mit Menschen kommuniziert und mit bestehenden Systemen interagiert. Wir verbinden KI-Agenten, Chatbots und Callbots mit Ihrer Systemlandschaft zu automatisierten, intelligenten Prozessen.",
  // The states and buttons of his own workflow demo.
  ready: "10 vernetzte Plattformen & Schnittstellen",
  live: "Live-Workflow-Simulation aktiv",
  play: "Workflow abspielen",
  reset: "Zurücksetzen",
  sync: "Sync",
  stepOf: (step: number, total: number) => `Schritt ${step} von ${total}`,
  platforms: [
    { title: "CRM", tools: "HubSpot / Salesforce / Pipedrive" },
    { title: "E-Mail", tools: "Outlook / Gmail / Klaviyo" },
    { title: "Kalender", tools: "Google / Calendly / Outlook" },
    { title: "Websites", tools: "WordPress / Webflow / Custom" },
    { title: "WhatsApp", tools: "Meta Cloud API / WABA" },
    { title: "Telegram", tools: "Bot API & Workspaces" },
    { title: "APIs & Webhooks", tools: "REST / GraphQL / Zapier / Make" },
    { title: "Datenbanken", tools: "PostgreSQL / SQL / Notion" },
    { title: "Marketing-Plattformen", tools: "Meta / Google Ads / LinkedIn" },
    { title: "Interne Tools", tools: "Slack / Teams / ERP / Asana" },
  ],
  // His seven example steps, each with the platforms (indexes above) his own script lights for it.
  steps: [
    { name: "Neuer Lead", platforms: [3, 8] },
    { name: "KI-Qualifizierung", platforms: [6, 7] },
    { name: "CRM", platforms: [0] },
    { name: "Natürliches Follow-up per WhatsApp oder Telegram", platforms: [4, 5] },
    { name: "KI-Anruf", platforms: [6, 9] },
    { name: "Termin", platforms: [2] },
    { name: "Vertriebsteam", platforms: [0, 9] },
  ],
  closing: "Statt isolierter Einzellösungen entsteht ein vernetztes, intelligent kommunizierendes Gesamtsystem.",
};

export const VORGEHEN = {
  title: "Vom Geschäftsprozess zum",
  accent: "funktionierenden KI-System",
  text: "Wir implementieren KI praxisnah und stimmen jede Lösung auf Ihre Prozesse, Zielgruppen und gewünschte Kommunikationstonalität ab.",
  phases: [
    { num: "01", title: "Prozessanalyse", text: "Wir identifizieren repetitive Aufgaben, Engpässe und relevante Automatisierungspotenziale." },
    { num: "02", title: "Use-Case-Bewertung", text: "Wir bestimmen, wo KI einen messbaren Mehrwert für Ihr Unternehmen schaffen kann." },
    { num: "03", title: "Lösungsdesign", text: "Wir definieren Workflows, Integrationen, KI-Komponenten, Gesprächslogik und die technische Systemarchitektur." },
    { num: "04", title: "Implementierung", text: "Wir entwickeln, integrieren und testen die Lösung auf Funktionalität sowie eine natürliche, menschenähnliche Kommunikation." },
    { num: "05", title: "Optimierung", text: "Wir überwachen die Performance und entwickeln das System sowie seine Gesprächsqualität kontinuierlich weiter." },
  ],
};

export const CLOSING = {
  title: "Wo kann KI in Ihrem Unternehmen",
  accent: "den größten Mehrwert schaffen?",
  text: "Wir starten mit Ihren bestehenden Prozessen, identifizieren die größten Potenziale und entwickeln eine passende Lösung, die natürlich mit Ihren Kunden kommuniziert.",
  primary: "KI-Beratung vereinbaren",
  secondary: "Use Case besprechen",
};
