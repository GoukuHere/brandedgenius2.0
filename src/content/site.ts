// All copy below is the client's own, taken from the live brandedgenius.de homepage (November 2026), in its order.
// Do not invent copy: if a section needs a line that is not here, take it from brandedgenius.de.

export const LINKS = {
  analysis: "https://api.brandedgenius.net/widget/survey/FXLzi1dZ9ecKm8EVD5sf",
  booking: "https://api.brandedgenius.net/widget/booking/CiuYtyMNCf8R7Dkft6Pe",
  // The client's hosted contact form: the original opens it from "Jetzt Kontakt aufnehmen", "Send Message",
  // "Leistungen entdecken", the service cards and the Lösung button.
  contact: "https://api.brandedgenius.net/widget/form/JemoFrrJQ5D665FZaVM0",
  imprint: "https://brandedgenius.de/impressum/",
  privacy: "https://brandedgenius.de/datenschutzerklarung/",
  terms: "https://brandedgenius.de/agb/",
  blog: "https://brandedgenius.de/blog/",
  wiki: "https://brandedgenius.de/wikipedia/",
};

export const MEDIA = {
  heroVideo: "/media/hero.mp4",
  heroPoster: "/media/hero-poster.webp",
};

export const NAV = [
  { label: "Startseite", href: "#top" },
  { label: "Leistungen", href: "#leistungen" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "KI-Workshop", href: "#ki-workshop" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Kontakt", href: "#kontakt" },
];

export const HEADER = {
  cta: "Jetzt Kontakt aufnehmen",
  mobileCta: "Analyse",
  menuCta: "KI-Potenzialanalyse anfragen",
};

export const HERO = {
  title: "KI-Automatisierung,",
  accent: "die Ergebnisse schafft.",
  label: "KI-Agenten & Workflows",
  text: "Branded Genius entwickelt KI-Agenten, Automatisierungen und intelligente Workflows für Marketing, Vertrieb, Kundenservice und interne Prozesse – von der Potenzialanalyse bis zur Umsetzung.",
  primary: "Potenzialanalyse anfragen",
  secondary: "Strategiegespräch",
  claim: ["Strategisch.", "Automatisiert.", "Messbar."],
};

export const PROBLEM = {
  title: "Viele Unternehmen testen KI –",
  accent: "aber setzen sie nicht produktiv um.",
  text: "Trotz großem Interesse bleibt das Potenzial ungenutzt. Prozesse bleiben manuell, Tools arbeiten isoliert, es fehlt eine klare Roadmap, Teams sind unsicher – und Ergebnisse lassen sich nicht messen.",
  items: [
    { title: "KI wird getestet, aber nicht umgesetzt", text: "Pilotbetrieb in der Testphase – ohne Überführung in den Alltag." },
    { title: "Zu viele manuelle Prozesse", text: "Wichtige Aufgaben sind zeitintensiv, fehleranfällig und nicht skalierbar." },
    { title: "Tools sind nicht verbunden", text: "Daten und Systeme arbeiten isoliert – ohne durchgängige Integration." },
    { title: "Keine klare KI-Roadmap", text: "Es fehlt eine Strategie, Priorisierung und ein Plan für nachhaltige Umsetzung." },
    { title: "Mitarbeiter sind unsicher", text: "Unsicherheit über Nutzen, Anwendung und Auswirkung von KI im Arbeitsalltag." },
    { title: "Keine messbaren Ergebnisse", text: "Erfolge sind nicht messbar, Wirkung bleibt unklar, Potenzial verpufft." },
  ],
  reality: [
    { label: "Tools", value: "Nicht miteinander verbunden" },
    { label: "Daten", value: "In einzelnen Systemen" },
    { label: "Aufgaben", value: "Weiterhin manuell" },
  ],
};

// "Die Realität" on brandedgenius.de: six reasons, each with the photo the client uses there.
export const REALITY = {
  title: "Die häufigsten Gründe, warum KI-Projekte",
  accent: "nicht produktiv werden.",
  text: "Viele Unternehmen investieren in KI-Tools, doch ohne klare Strategie und Struktur bleiben Potenziale ungenutzt und Ergebnisse aus.",
  items: [
    { title: "Keine klare KI-Roadmap", text: "KI-Tools werden ausprobiert, aber ohne strukturierten Umsetzungsplan.", img: "/media/reality/01.webp" },
    {
      title: "Tool-Chaos statt System",
      text: "Viele Tools werden genutzt, aber nicht sinnvoll miteinander verbunden oder in einen klaren Prozess integriert.",
      img: "/media/reality/02.webp",
    },
    {
      title: "Manuelle Prozesse bleiben bestehen",
      text: "Wiederkehrende Aufgaben kosten weiterhin Zeit und Ressourcen, obwohl sie automatisiert werden könnten.",
      img: "/media/reality/03.webp",
    },
    {
      title: "Mitarbeiter sind unsicher",
      text: "Teams wissen nicht, welche Tools sie nutzen dürfen oder wie KI richtig eingesetzt werden soll.",
      img: "/media/reality/04.webp",
    },
    { title: "Datenschutz wird zu spät berücksichtigt", text: "Compliance und interne Regeln werden häufig erst am Ende berücksichtigt.", img: "/media/reality/05.webp" },
    {
      title: "Keine KPIs und keine klare Wirkung",
      text: "KI wird getestet, aber der Business-Impact wird nicht gemessen oder transparent ausgewertet.",
      img: "/media/reality/06.webp",
    },
  ],
};

export const COMPARE = {
  title: "Der Unterschied zwischen",
  accent: "KI testen und KI wirklich umsetzen.",
  text: "Zwei Wege. Zwei Ergebnisse. Entscheiden Sie, wohin Ihr Unternehmen geht.",
  classic: {
    title: "Der klassische Weg",
    points: [
      "Viele Tools, keine klare Strategie",
      "Manuelle Aufgaben bleiben bestehen",
      "Keine messbare Wirkung",
      "Mitarbeiter sind unsicher",
      "Beratung endet oft bei Konzepten",
    ],
    result: "Viel Aufwand. Wenig Wirkung. Kein Fortschritt.",
  },
  ours: {
    title: "Der Branded Genius Weg",
    points: [
      "KI-Potenzialanalyse mit klarem Fokus",
      "Roadmap statt Tool-Chaos",
      "Automatisierung statt Theorie",
      "Teams werden befähigt",
      "Messbare Optimierung",
    ],
    result: "Klare Strategie. Messbare Ergebnisse. Nachhaltiges Wachstum.",
  },
};

export const PROMISE = {
  title: "Wir bringen KI dorthin, wo sie echten Mehrwert schafft –",
  accent: "in Ihre Prozesse.",
  figures: [
    { value: "3–6 Monate", label: "bis zu ersten messbaren Ergebnissen" },
    { value: "40–70 %", label: "weniger manuelle Aufwände" },
    { value: "100 %", label: "Befähigung Ihrer Teams" },
    { value: "Nachhaltig", label: "Prozesse, die bleiben und skalieren" },
  ],
};

export const SOLUTION = {
  title: "Branded Genius macht KI praktisch,",
  accent: "strukturiert und umsetzbar.",
  text: "Wir verwandeln KI-Potenzial in klare Systeme, effiziente Workflows und messbare Umsetzung – für nachhaltigen Geschäftserfolg.",
  pillars: [
    { title: "Plan", items: ["KI-Potenzialanalyse", "Use-Case-Priorisierung", "KI-Roadmap"] },
    { title: "Systeme", items: ["KI-Workflows", "KI-Agenten", "Automatisierungssysteme"] },
    { title: "Menschen", items: ["Workshops & Schulungen", "Kontinuierliche Optimierung"] },
  ],
  primary: "KI-Potenzialanalyse anfragen",
  secondary: "Unsere Lösung entdecken",
  // The left column of the original's Lösung section: the photo and two cards.
  img: "/media/photos/vorher-nachher.webp",
  imgAlt: "Roman Tränkle am Schreibtisch vor dem Branded Genius Logo",
  cards: [
    { title: "Klarer Plan", items: ["Analyse", "Priorisierung", "Roadmap"] },
    { title: "Verbundene Abläufe", items: ["Workflows", "Agenten", "Automatisierung"] },
  ],
};

export const SYSTEM = {
  title: "Wir verbinden Ihre bestehenden Tools zu einem",
  accent: "intelligenten KI-System",
  text: "Branded Genius verbindet Ihre Systeme, Daten und Prozesse zu einem zentralen, intelligenten Ökosystem – für bessere Entscheidungen, automatisierte Abläufe und nachhaltiges Wachstum.",
  claim: "Alle Tools. Ein System. Intelligent vernetzt.",
  cta: "KI-Potenzialanalyse anfragen",
  qualities: [
    { title: "DSGVO-bewusst", text: "Sicher & konform" },
    { title: "Systemübergreifend", text: "Offen & flexibel" },
    { title: "Skalierbar", text: "Mit Ihrem Wachstum" },
    { title: "Unternehmenstauglich", text: "Stabil & zuverlässig" },
  ],
  nodes: [
    { title: "Website", tools: ["WordPress", "Webflow", "Framer", "Shopify"] },
    { title: "CRM", tools: ["GoHighLevel", "CRM Systems"] },
    { title: "E-Mail", tools: ["Google Workspace", "Microsoft 365", "Email Marketing"] },
    { title: "Automation Tools", tools: ["n8n", "Make", "Zapier"] },
    { title: "WhatsApp", tools: ["Business API"] },
    { title: "Project Management", tools: ["ClickUp", "Asana", "Trello"] },
    { title: "Calendar Booking", tools: ["Google Calendar", "Calendly", "Microsoft Bookings"] },
    { title: "AI Agents", tools: ["Branded Genius AI Agents", "Individuelle KI-Agenten"] },
  ],
};

export const SERVICES = {
  title: "Unsere Leistungen.",
  accent: "Für messbare KI-Transformation.",
  cta: "Leistungen entdecken",
  text: "Strategie, Technologie und Training aus einer Hand – damit KI in Ihrem Unternehmen nicht nur getestet, sondern erfolgreich umgesetzt wird.",
  items: [
    {
      id: "agents",
      title: "KI-Agenten & Workflows",
      text: "Intelligente KI-Agenten und automatisierte Workflows, die wiederkehrende Prozesse übernehmen, Systeme verbinden und interne Abläufe effizienter machen.",
      cta: "Agenten & Workflows",
    },
    {
      id: "chat",
      title: "KI-Chatbots",
      text: "Intelligente Chatbots für Website, Support, Kundenservice und Lead-Qualifizierung – individuell auf Unternehmen, Prozesse und Systeme abgestimmt.",
      cta: "Chatbots einsetzen",
    },
    {
      id: "calls",
      title: "KI-Callbots",
      text: "KI-gestützte Sprachassistenten für eingehende und ausgehende Telefonate, Lead-Qualifizierung, Terminvereinbarung, Support und Follow-ups.",
      cta: "Callbots einsetzen",
    },
    {
      id: "marketing",
      // The soft hyphen lets the long compound break as "Vertriebs-automatisierung" wherever it runs out of room.
      title: "KI-Marketing & Vertriebs­automatisierung",
      text: "Automatisierte Marketing- und Vertriebsprozesse für Leadgenerierung, Follow-ups, CRM, personalisierte Kommunikation und effizientere Conversion-Prozesse.",
      cta: "Wachstum automatisieren",
    },
  ],
};

export type CaseStudy = {
  area: string;
  /** Second line of the original tab label. */
  kind: string;
  name: string;
  tagline: string;
  text: string;
  metrics: { value: string; label: string }[];
  quote: string;
  role: string;
  done: string[];
  tools: string[];
};

export const CASES = {
  title: "Praxisbeispiele. Echte Ergebnisse.",
  accent: "KI, die im Unternehmen wirkt.",
  text: "Erfahren Sie, wie wir Unternehmen mit maßgeschneiderter KI-Automatisierung messbar voranbringen.",
  doneLabel: "Was wir umgesetzt haben",
  toolsLabel: "Eingesetzte Tools",
  items: [
    {
      area: "Marketing",
      kind: "Automation",
      name: "Marketing Automation",
      tagline: "Lead-Generierung neu gedacht.",
      text: "Automatisierte Kampagnensteuerung und intelligente Lead-Qualifizierung steigern die Conversion-Raten messbar und nachhaltig.",
      metrics: [
        { value: "+43%", label: "Mehr qualifizierte Leads in 90 Tagen" },
        { value: "−62%", label: "Weniger manueller Aufwand im Marketing" },
        { value: "+28%", label: "Höhere Conversion-Rate bei Kampagnen" },
      ],
      quote: "Endlich haben wir ein System, das Marketing nicht nur automatisiert, sondern messbar erfolgreicher macht.",
      role: "Head of Marketing",
      done: ["KI-gestützte Zielgruppenanalyse", "Automatisierte Kampagnensteuerung", "Intelligente Lead-Qualifizierung", "Multi-Channel Follow-up Automation", "Echtzeit-Reporting & Optimierung"],
      tools: ["n8n", "Make", "Google Ads", "ActiveCampaign", "Zapier"],
    },
    {
      area: "Vertrieb",
      kind: "Automation",
      name: "Vertrieb Automation",
      tagline: "Mehr Abschlüsse. Weniger manuelle Vertriebsarbeit.",
      text: "KI-gestützte Pipeline-Steuerung und automatisierte Follow-ups verwandeln qualifizierte Termine schneller in erfolgreiche Abschlüsse.",
      metrics: [
        { value: "+37%", label: "Mehr qualifizierte Termine in 90 Tagen" },
        { value: "−54%", label: "Weniger manueller Aufwand im Vertrieb" },
        { value: "+31%", label: "Höhere Abschlussrate durch automatisierte Follow-ups" },
      ],
      quote: "Unser Vertrieb arbeitet heute strukturierter, schneller und deutlich effizienter – mit spürbar mehr Abschlüssen.",
      role: "Vertriebsleiter",
      done: ["KI-gestützte Lead-Qualifizierung", "Automatisierte Follow-up Sequenzen", "Pipeline-Priorisierung in Echtzeit", "Terminbuchung & Vertriebsrouting", "Reporting für Abschlussraten & Sales-Performance"],
      tools: ["LinkedIn", "HubSpot", "Pipedrive", "Google Ads", "Custom CRM"],
    },
    {
      area: "Kundenservice",
      kind: "Chatbot",
      name: "Kundenservice Chatbot",
      tagline: "Schneller antworten. Kunden besser betreuen.",
      text: "Autonome Anfrage-Erkennung und nahtlose Übergaben entlasten das Serviceteam und sichern 24/7-Reaktionszeiten.",
      metrics: [
        { value: "+61%", label: "Schnellere Erstreaktion im Kundenservice" },
        { value: "−47%", label: "Weniger manuelle Support-Anfragen" },
        { value: "+34%", label: "Höhere Lösungsquote durch Chatbot-Automation" },
      ],
      quote: "Unser Kundenservice ist heute schneller, strukturierter und rund um die Uhr ansprechbar.",
      role: "Head of Customer Support",
      done: ["KI-gestützte Anfrage-Erkennung", "Automatisierte Antwort-Workflows", "Intelligente Übergabe an Mitarbeiter", "24/7 Chatbot-Betreuung", "Echtzeit-Reporting & Serviceoptimierung"],
      tools: ["Intercom", "Zendesk", "HubSpot", "WhatsApp", "Slack"],
    },
    {
      area: "Backoffice",
      kind: "Automation",
      name: "Backoffice Automation",
      tagline: "Prozesse automatisieren. Aufwand deutlich reduzieren.",
      text: "Automatische Dokumentenerfassung und fehlerfreie Freigabe-Workflows beschleunigen interne Verwaltungsabläufe signifikant.",
      metrics: [
        { value: "+68%", label: "Schnellere Vorgangsbearbeitung in 90 Tagen" },
        { value: "−59%", label: "Weniger manueller Aufwand im Backoffice" },
        { value: "−41%", label: "Weniger Prozessfehler durch Automatisierung" },
      ],
      quote: "Unsere Backoffice-Prozesse laufen heute strukturierter, schneller und nahezu fehlerfrei.",
      role: "Operations Manager",
      done: ["KI-gestützte Dokumentenerkennung", "Automatisierte Rechnungs- & Belegverarbeitung", "Intelligente Freigabe-Workflows", "Datenabgleich zwischen Systemen", "Echtzeit-Reporting & Prozessmonitoring"],
      tools: ["Zapier", "Slack", "Airtable", "Google Drive", "n8n"],
    },
    {
      area: "Telefonie",
      kind: "AI Assistant",
      name: "Telefonie AI Assistant",
      tagline: "Anrufe automatisieren. Erreichbarkeit intelligent skalieren.",
      text: "Smarte Sprachassistenten qualifizieren Anrufer rund um die Uhr und buchen Termine eigenständig.",
      metrics: [
        { value: "+74%", label: "Schnellere Anrufannahme in 90 Tagen" },
        { value: "−58%", label: "Weniger verpasste Anrufe im Kundenservice" },
        { value: "+36%", label: "Mehr gebuchte Termine durch AI-Telefonie" },
      ],
      quote: "Unser Telefonprozess ist jetzt rund um die Uhr verfügbar, schneller und deutlich zuverlässiger. Ein echter Gamechanger.",
      role: "Operations Manager",
      done: ["AI-gestützte Anrufannahme", "Intelligente Anrufqualifizierung", "Automatisierte Terminbuchung", "Weiterleitung an passende Ansprechpartner", "Echtzeit-Reporting & Gesprächsauswertung"],
      tools: ["Twilio", "Vapi", "ElevenLabs", "HubSpot", "n8n"],
    },
    {
      area: "CRM",
      kind: "Follow-up",
      name: "CRM Follow-up",
      tagline: "Leads nachfassen. Kein Potenzial mehr verlieren.",
      text: "Automatisierte Reaktivierungssequenzen stellen sicher, dass kein wertvoller Lead im Nachfassprozess verloren geht.",
      metrics: [
        { value: "+46%", label: "Mehr reaktivierte Leads in 90 Tagen" },
        { value: "−63%", label: "Weniger manueller Aufwand im Follow-up" },
        { value: "+29%", label: "Höhere Rückmeldequote bei Follow-up-Sequenzen" },
      ],
      quote: "Unser CRM arbeitet heute strukturierter, schneller und ohne verlorene Leads im Nachfassprozess.",
      role: "Sales Operations Manager",
      done: ["Automatisierte Follow-up-Sequenzen", "Lead-Reaktivierung aus dem CRM", "Pipeline-Trigger & Erinnerungen", "Personalisierte WhatsApp- & E-Mail-Nachfassaktionen", "Echtzeit-Reporting & Deal-Tracking"],
      tools: ["HubSpot", "Pipedrive", "WhatsApp", "n8n", "Make"],
    },
  ] satisfies CaseStudy[],
};

export const PROCESS = {
  title: "Von der KI-Potenzialanalyse bis zur",
  accent: "strukturierten Umsetzung.",
  text: "Ein klarer Prozess mit transparenten Meilensteinen – damit KI nicht bei Ideen bleibt, sondern produktiv in Ihrem Unternehmen ankommt.",
  steps: [
    { title: "KI-Potenzialanalyse", text: "Wir analysieren Ihre Prozesse und identifizieren die größten Hebel für Automatisierung und KI.", img: "/media/process/01.webp" },
    { title: "Anwendungsfälle filtern", text: "Wir bewerten mögliche Anwendungsfälle nach Impact, Aufwand und realistischem Nutzen.", img: "/media/process/02.webp" },
    { title: "KI-Roadmap", text: "Sie erhalten einen klaren Fahrplan mit priorisierten Schritten für die Umsetzung.", img: "/media/process/03.webp" },
    { title: "Pilotprojekt", text: "Wir starten mit einem klar definierten, realistisch umsetzbaren Use Case.", img: "/media/process/04.webp" },
    { title: "Implementierung", text: "Automatisierungen, Workflows und KI-Agenten werden sicher in Ihre bestehenden Prozesse integriert.", img: "/media/process/05.webp" },
    { title: "Praxistraining", text: "Ihr Team lernt, die neuen Systeme sicher, effizient und produktiv im Alltag zu nutzen.", img: "/media/process/06.webp" },
    { title: "Optimierung & Skalierung", text: "Wir messen Ergebnisse, optimieren laufend und skalieren erfolgreiche Prozesse Schritt für Schritt.", img: "/media/process/07.webp" },
  ],
};

export const WHY = {
  title: "KI-Beratung ist gut.",
  accent: "Umsetzung ist besser.",
  text: "Wir denken nicht nur in Konzepten. Wir setzen um, automatisieren und liefern messbare Ergebnisse mit direkter Anbindung an Ihre Unternehmensführung.",
  center: { title: "Roman Tränkle & Team", text: "KI-Zentrum" },
  reasons: [
    { title: "Persönliche Experten-Positionierung", text: "Direkte Begleitung durch Roman Tränkle für eine glaubwürdige und wirksame Positionierung." },
    { title: "Marketing & Vertriebs-Erfahrung", text: "Fundiertes Praxiswissen für kundenorientierte Vertriebs- und Marketingprozesse." },
    { title: "KI-Automatisierung mit realem Business-Use", text: "Fokus auf rentable Prozesse, die spürbar Arbeitszeit einsparen und Umsatz hebeln." },
    { title: "Beratung & Umsetzung aus einer Hand", text: "Strategie, Technologie und Realisierung nahtlos aus einer Hand gebündelt." },
    { title: "Schnelle Pilotprojekte", text: "In wenigen Wochen vom Konzept zum messbar funktionierenden Piloten." },
    { title: "Team-Workshops inklusive", text: "Praxisorientierte Schulungen zur nachhaltigen und sicheren Verankerung im Team." },
  ],
};

export const IMPACT = {
  title: "KI lohnt sich dann, wenn sie",
  accent: "messbare Prozesse verbessert.",
  text: "Wir schaffen messbare Verbesserungen in Ihrem Unternehmen – zielgerichtet dort, wo es zählt.",
  principles: [
    { title: "Datenbasiert", text: "Statt Bauchgefühl" },
    { title: "Prozessfokussiert", text: "Statt Tool-Overload" },
    { title: "Messbar", text: "Statt unklar" },
  ],
  live: {
    label: "Live Performance",
    title: "KI-Workflow: Lead-Qualifizierung",
    text: "Automatisierte Beantwortung und direkte Synchronisierung ins CRM.",
    metricLabel: "Prozess-Durchlaufzeit",
    metric: "−84%",
  },
  benefits: [
    { title: "Mehr Effizienz", text: "Repetitive Routineaufgaben entfallen – Ihr Team gewinnt wertvolle Zeit für Kernaufgaben." },
    { title: "Schnellere Reaktionszeit", text: "Kundenanfragen und Leads werden in Sekundenschnelle automatisiert und verlässlich bearbeitet." },
    { title: "Klareres Reporting", text: "Zentrale Leistungsdaten und Dashboards ermöglichen fundierte, transparente Unternehmensentscheidungen." },
    { title: "Höhere Skalierbarkeit", text: "Automatisierte Workflows wachsen ohne zusätzliche Personalkosten flexibel mit Ihrem Geschäftsvolumen." },
  ],
  goal: {
    title: "KI, die echten Business Impact schafft.",
    text: "Strategie, Automatisierung und messbare Wirkung für nachhaltiges und profitables Wachstum.",
    cta: "Lassen Sie uns Ihren Business Impact identifizieren.",
    ctaText: "Gemeinsam finden wir heraus, wo KI in Ihrem Unternehmen den größten Unterschied macht.",
  },
};

export const WORKSHOP = {
  title: "Buchen Sie Roman Tränkle als KI-Trainer",
  accent: "für Ihr Unternehmen.",
  tagline: "Praxisnah. Verständlich. Umsetzbar.",
  text: "Wir befähigen Ihre Teams, KI sicher zu nutzen und damit echten Mehrwert im Unternehmen zu schaffen.",
  quote: "Mein Ziel ist es, Ihr Team so zu befähigen, dass KI nicht nur verstanden, sondern wirklich im Unternehmen genutzt wird.",
  author: "Roman Tränkle",
  formatsLabel: "Unsere Workshop-Formate",
  formats: [
    { title: "Vor-Ort Workshops", text: "Interaktive Hands-on-Workshops direkt in Ihrem Unternehmen vor Ort.", img: "/media/workshop/01.webp" },
    { title: "Online Seminare", text: "Kompakte Live-Online-Trainings mit praxisnahen Übungen und individuellem Austausch.", img: "/media/workshop/02.webp" },
    { title: "Leadership Workshops", text: "Strategische Entscheidungskompetenz und Zukunftssicherheit für Führungskräfte und Vorstände.", img: "/media/workshop/03.webp" },
    { title: "Individuelle Trainings", text: "Maßgeschneiderte Schulungsinhalte für spezifische Fachabteilungen und konkrete Anwendungsfälle.", img: "/media/workshop/04.webp" },
  ],
  topicsLabel: "Themenbeispiele",
  topics: [
    "Generative KI im Unternehmensalltag",
    "KI-gestützte Prozesse & Automatisierung",
    "ChatGPT & Co. effektiv nutzen",
    "KI in Marketing & Vertrieb",
    "Daten, Sicherheit & rechtliche Grundlagen",
    "KI-Strategie & Use Case Entwicklung",
    "KI-Tools, Workflows & Best Practices",
  ],
  cta: "Termin vereinbaren",
};

export const PARTNERS = {
  title: "Unsere Partner",
  names: ["Zapier", "ElevenLabs", "Google", "Runway", "OpenAI", "HighLevel"],
};

// Each testimonial is one of the client's own YouTube Shorts (channel @brandedgenius), in the order shown on brandedgenius.de.
export const VOICES = {
  title: "Echte Stimmen.",
  accent: "Echte Ergebnisse.",
  text: "Authentische Einblicke unserer Kunden in die Zusammenarbeit und messbare Projekterfolge.",
  items: [
    { quote: "Die Automatisierungen haben unsere Prozesse revolutioniert.", name: "Andrea M.", role: "Geschäftsführerin", img: "/media/testimonials/t1-portrait.webp", youtube: "c4E5xufPoAI" },
    { quote: "Branded Genius versteht unsere Sprache und liefert Ergebnisse.", name: "Daniel K.", role: "Geschäftsführer, Novaro Digital GmbH", img: "/media/testimonials/t2-portrait.webp", youtube: "D5qQ3EHY800" },
    { quote: "Hervorragende Begleitung von der ersten Idee bis zur vollendeten Integration.", name: "Sebastian S.", role: "Head of Operations, Velo Media Group", img: "/media/testimonials/t3-portrait.webp", youtube: "Wg4umIAImEw" },
    { quote: "Die Zusammenarbeit war von Anfang an professionell, schnell und unkompliziert.", name: "Michael R.", role: "Geschäftsführer, Nova Consulting GmbH", img: "/media/testimonials/t4-portrait.webp", youtube: "emZJGuqHMBY" },
  ],
};

export const CTA = {
  title: "Bereit, Ihr Unternehmen",
  accent: "mit KI zu automatisieren?",
  text: "Erfahren Sie in einer kostenlosen Potenzialanalyse oder einem persönlichen Strategiegespräch, welche Prozesse sich in Ihrem Unternehmen am schnellsten und effektivsten automatisieren lassen.",
  // The original's first button ("Send Message") opens the client's hosted contact form; it is labelled here with the
  // German label the original gives the same form elsewhere ("KI-Potenzialanalyse anfragen").
  primary: "KI-Potenzialanalyse anfragen",
  secondary: "Strategiegespräch buchen",
  checks: ["100% kostenlos & unverbindlich", "Konkrete Handlungsempfehlungen", "Keine Vorbereitung nötig"],
};

export const FOOTER = {
  title: "Lassen Sie uns",
  accent: "sprechen.",
  text: "Erweitern Sie Ihr Unternehmen mit KI-gestützten Lösungen.",
  cta: "Beratungsgespräch buchen",
  discover: { title: "Entdecken", links: [...NAV.slice(1, 5), { label: "Blogs", href: LINKS.blog }, { label: "KI Wikipedia", href: LINKS.wiki }] },
  // The client's own footer links Facebook to facebook.com itself and has no LinkedIn address, so only real contact routes are listed.
  connect: {
    title: "Verbinden",
    // The original also lists Facebook and LinkedIn; they will be added once the client sends the profile links.
    links: [{ label: "Kontakt", href: LINKS.contact }],
  },
  legal: [
    { label: "AGB", href: LINKS.terms },
    { label: "Datenschutz", href: LINKS.privacy },
    { label: "Impressum", href: LINKS.imprint },
  ],
  copyright: "© 2026 Branded Genius.",
};

export const CONTACT = {
  email: "info@brandedgenius.de",
  phone: "+49 176 24624981",
  city: "Pforzheim",
};
