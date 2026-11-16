// /use-cases: every line below is the client's own, from brandedgenius.de/use-cases/ (November 2026), the case-study
// popups (PROJEKT 01 to 07) included. Shortened only by leaving things out. His all-caps labels are set in normal
// case here (same words), because the site sets no uppercase labels.

export type FilterId = "all" | "ki" | "web" | "marketing" | "crm";

export type ProjectSlug = "mega-screen" | "wrapwerk" | "ledbow" | "cryptotransfer" | "elysium" | "km-electronics" | "martin-wildt";

export type Project = {
  slug: ProjectSlug;
  number: string;
  name: string;
  /** The name as it floats in the hero (the part before his dash, for the one long name). */
  short: string;
  /** His industry line, e.g. "LED-DISPLAYS · EVENTLÖSUNGEN", in normal case. */
  tag: string;
  /** The poster's one line: his project card's first sentence, shortened only by leaving words out. */
  summary: string;
  /** The popup: PROJEKTÜBERSICHT, AUSGANGSSITUATION & HERAUSFORDERUNG, LÖSUNGSANSATZ & UMSETZUNGSSCHWERPUNKTE. */
  overview: string;
  challenge: string;
  solution: string[];
  /** Which of his filter chips show the project (his filter has no assignment; see the report for the reasons). */
  topics: Exclude<FilterId, "all">[];
};

export const UC_HERO = {
  title: "Digitale Lösungen,",
  accent: "die messbare Fortschritte schaffen.",
  lead: "Entdecken Sie ausgewählte Projekte und erfahren Sie, wie aus konkreten Herausforderungen verständliche, funktionierende und skalierbare Lösungen entstehen.",
  primary: "Anfrage senden",
  secondary: "Unsere Lösung entdecken",
};

export const UC_PROJECTS = {
  title: "Unterschiedliche Unternehmen.",
  accent: "Individuelle Lösungen.",
  text: "Jedes Projekt beginnt mit einer konkreten Herausforderung und wird auf die Prozesse, Zielgruppen und Ziele des jeweiligen Unternehmens abgestimmt.",
  filterLabel: "Themenschwerpunkte filtern",
  filters: [
    { id: "all", label: "Alle Projekte" },
    { id: "ki", label: "KI & Automatisierung" },
    { id: "web", label: "Websites & Landingpages" },
    { id: "marketing", label: "Marketing & Leadgenerierung" },
    { id: "crm", label: "CRM & Vertriebsprozesse" },
  ] as { id: FilterId; label: string }[],
  open: "Case Study öffnen",
};

/** The case view: his popup's headings, question and two buttons. */
export const UC_CASE = {
  project: "Projekt",
  overview: "Projektübersicht",
  challenge: "Ausgangssituation & Herausforderung",
  solution: "Lösungsansatz & Umsetzungsschwerpunkte",
  value: "Mehrwert für das Unternehmen",
  /** The same paragraph closes every one of his seven popups. */
  valueText:
    "Strukturierte Customer Journey, höhere Conversion-Raten und spürbare Entlastung interner Teams durch verständliche Leistungsdarstellung und nahtlose Anschluss-Prozesse.",
  question: "Interesse an einer vergleichbaren Lösung für Ihr Unternehmen?",
  booking: "Erstgespräch buchen",
  contact: "Anfrage stellen",
  /** Not his: the close button's accessible name (the button shows only a cross). */
  close: "Schließen",
};

export const UC_ITEMS: Project[] = [
  {
    slug: "mega-screen",
    number: "01",
    name: "Mega Screen",
    short: "Mega Screen",
    tag: "LED-Displays · Eventlösungen",
    summary: "Eine digitale Lösung für die professionelle Präsentation von LED-Display- und Eventangeboten.",
    overview:
      "Die Herausforderung bestand darin, komplexe LED-Display- und Eventlösungen übersichtlich und verständlich zu präsentieren. Unterschiedliche Leistungen und Einsatzbereiche sollten klar strukturiert werden, damit Interessenten schnell die passende Lösung finden und gezielt zur Kontaktaufnahme geführt werden.",
    challenge: "Unterschiedliche Event- und Displaylösungen sollten übersichtlich, hochwertig und verständlich präsentiert werden.",
    solution: ["Digitale Markenpräsentation", "Strukturierung komplexer Leistungen", "Optimierte Nutzerführung", "Vereinfachte Kontaktaufnahme"],
    topics: ["ki", "web", "marketing", "crm"],
  },
  {
    slug: "wrapwerk",
    number: "02",
    name: "WrapWerk Academy",
    short: "WrapWerk Academy",
    tag: "Fahrzeugfolierung · Window Tinting",
    summary: "Eine moderne digitale Plattform, die Fachwissen, Dienstleistungen und Weiterbildungsangebote rund um Fahrzeugfolierung präsentiert.",
    overview:
      "Eine moderne digitale Lern- und Serviceplattform für die WrapWerk Academy, die Fachwissen, Schulungen und professionelle Dienstleistungen rund um Fahrzeugfolierung und Scheibentönung übersichtlich an einem Ort bündelt.",
    challenge: "Kurse, Leistungen und Fachkompetenz benötigten eine klare gemeinsame digitale Struktur.",
    solution: ["Positionierung der Academy", "Übersichtliche Kursdarstellung", "Klare Interessentenführung", "Optimierte Anfrageprozesse"],
    topics: ["web", "marketing", "crm"],
  },
  {
    slug: "ledbow",
    number: "03",
    name: "LedBow Germany",
    short: "LedBow Germany",
    tag: "Krypto-Bildung · Investmentstrategien",
    summary: "Eine strukturierte digitale Präsenz für Bildungsangebote aus dem Bereich Kryptowährungen.",
    overview:
      "Eine strukturierte digitale Präsenz für Bildungsangebote aus dem Bereich Kryptowährungen. Komplexe Informationen werden verständlich aufbereitet und in eine nachvollziehbare Customer Journey integriert.",
    challenge: "Erklärungsbedürftige Inhalte sollten verständlich vermittelt und mit einem klaren nächsten Schritt verbunden werden.",
    solution: ["Verständliche Wissensvermittlung", "Strukturierte Angebotskommunikation", "Vertrauensbildende Nutzerführung", "Digitale Leadgenerierung"],
    topics: ["web", "marketing"],
  },
  {
    slug: "cryptotransfer",
    number: "04",
    name: "Cryptotransfer",
    short: "Cryptotransfer",
    tag: "Digitale Prozesse · Nutzerführung",
    summary: "Eine strukturierte digitale Lösung für ein technologieorientiertes Geschäftsmodell.",
    overview:
      "Eine strukturierte digitale Lösung für ein technologieorientiertes Geschäftsmodell mit Fokus auf verständliche Kommunikation und klare nächste Schritte.",
    challenge: "Technologieorientierte Prozessabläufe erforderten eine transparente, sichere und leicht verständliche Benutzerführung.",
    solution: ["Prozess-Strukturierung", "Intuitive Nutzerführung", "Transparente Statusmeldungen", "Conversion-Optimierung"],
    topics: ["ki", "marketing"],
  },
  {
    slug: "elysium",
    number: "05",
    name: "Elysium Agency",
    short: "Elysium Agency",
    tag: "Markenauftritt · Digitale Präsenz",
    summary: "Eine moderne Marken- und Webpräsenz, die Positionierung, Nutzererlebnis und Kundenanfragen miteinander verbindet.",
    overview: "Eine moderne Marken- und Webpräsenz, die Positionierung, Nutzererlebnis und Kundenanfragen miteinander verbindet.",
    challenge: "Premium-Dienstleistungen und Kreativkompetenz sollten online überzeugend, modern und anfrageorientiert inszeniert werden.",
    solution: ["Markenpositionierung", "Modernes UI/UX-Design", "Lead-Erfassung", "Interaktive Showcase-Elemente"],
    topics: ["web", "marketing"],
  },
  {
    slug: "km-electronics",
    number: "06",
    name: "K&M Electronics",
    short: "K&M Electronics",
    tag: "Technische Leistungen · Webpräsenz",
    summary: "Eine übersichtliche digitale Darstellung technischer Produkte und Leistungen.",
    overview: "Eine übersichtliche digitale Darstellung technischer Produkte und Leistungen für eine verständlichere Kundenkommunikation.",
    challenge: "Komplexe technische Produktmerkmale mussten für Geschäftskunden schnell vergleichbar und verständlich aufbereitet werden.",
    solution: ["Produktkatalog-Struktur", "Technische Spezifikationen", "B2B-Anfrageformular", "Such- & Filterlogik"],
    topics: ["web", "crm"],
  },
  {
    slug: "martin-wildt",
    number: "07",
    name: "Martin Wildt – Real Estate Standing",
    short: "Martin Wildt",
    tag: "Immobilien · Positionierung",
    summary: "Eine professionelle digitale Präsentation von Immobilienkompetenz.",
    overview: "Eine professionelle digitale Präsentation von Immobilienkompetenz mit klarer Positionierung und vertrauensbildender Nutzerführung.",
    challenge: "Ein anspruchsvolles Immobilienportfolio verlangte nach einem vertrauensstiftenden und diskreten digitalen Auftritt.",
    solution: ["Repräsentatives Design", "Exposé-Führung", "Diskrete Kontaktwege", "Vertrauensbildende Bausteine"],
    topics: ["web", "crm"],
  },
];

/** His "Case Study Architecture / Live Systeme" block for project 01 (its two header labels are left out). */
export const UC_FEATURED = {
  title: "Mega Screen",
  accent: "Display Plattform",
  project: "Projekt 01 · LED & Eventlösungen",
  status: "Im Einsatz",
  facts: [
    { label: "Strukturierung", value: "100% Klarheit" },
    { label: "Anfrage-Pfad", value: "Direkt qualifiziert" },
  ],
  pipeline: "Automatisierung & Pipeline",
  layers: ["Web", "KI-Agent", "CRM"],
  focus: "Branchenfokus: B2B, Handwerk, Dienstleistung",
  individual: "100% Individuell",
  verified: "Verifizierte Praxisbeispiele",
  cta: "Mega Screen Case Study ansehen",
};

export const UC_BENEFITS = {
  title: "Technologie muss ein konkretes",
  accent: "Geschäftsziel unterstützen.",
  text: "Eine erfolgreiche digitale Lösung sollte nicht nur professionell aussehen. Sie muss Informationen verständlich machen, Prozesse vereinfachen und Nutzern einen klaren nächsten Schritt bieten.",
  items: [
    { title: "Klarere Positionierung", text: "Leistungen, Kompetenzen und Mehrwerte werden schneller verständlich." },
    { title: "Bessere Nutzerführung", text: "Besucher finden relevante Informationen und Handlungsoptionen ohne unnötige Umwege." },
    { title: "Effizientere Prozesse", text: "Wiederkehrende Aufgaben und Kommunikationsabläufe werden sinnvoll automatisiert." },
    { title: "Mehr qualifizierte Anfragen", text: "Kontaktpunkte und Customer Journeys werden auf relevante Interessenten ausgerichtet." },
    { title: "Vernetzte Systeme", text: "Website, CRM, Marketing und Kommunikation arbeiten als gemeinsamer Prozess." },
    { title: "Skalierbare Grundlagen", text: "Die entwickelte Lösung kann mit neuen Anforderungen und wachsendem Bedarf erweitert werden." },
  ],
};

export const UC_CLOSING = {
  /** His label above the block; here the name of the drawing (never shown above the headline). */
  label: "Ihr Projekt könnte das nächste sein",
  title: "Lassen Sie uns aus Ihrer Herausforderung",
  accent: "eine funktionierende Lösung entwickeln.",
  text: "Ganz gleich, ob Sie Ihre digitale Präsenz modernisieren, Prozesse automatisieren oder neue Kunden gewinnen möchten: Wir analysieren Ihre Ausgangssituation und zeigen Ihnen, welche nächsten Schritte für Ihr Unternehmen sinnvoll sind.",
  primary: "Kostenloses Erstgespräch buchen",
  secondary: "Projekt unverbindlich besprechen",
  emailLabel: "E-Mail-Kontakt:",
  email: "info@brandedgenius.de",
};
