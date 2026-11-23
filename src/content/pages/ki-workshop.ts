/*
  /ki-workshop: every visible word below is the client's own, from brandedgenius.de/ki-workshop/ (November 2026), in
  the order of his page. Shortened only by leaving things out (his kicker lines above the headings are dropped). Two
  renderings: "PRAXISTRANSFER GARANTIERT" is set in sentence case, and the trainer heading's dash became a line break.
  The alt texts are the only words that are not his (accessibility only, never shown).
*/

// The client's own page title and description from brandedgenius.de/ki-workshop/ (round 5: moved here from the page).
export const KW_META = {
  title: "KI-Workshop für Unternehmen",
  description: "Praxisnahe KI-Workshops für Unternehmen: Entdecken Sie konkrete Einsatzmöglichkeiten, Automatisierungen und Strategien für den effizienten Einsatz von künstlicher Intelligenz.",
};

export const KW_MEDIA = {
  hero: "/media/process/training.webp",
  onsite: "/media/workshop/vor-ort.webp",
  online: "/media/workshop/r5-online-roman.webp",
  custom: "/media/workshop/r5-individuell-roman.webp",
  trainer: "/media/photos/roman-standing.webp",
  // A square crop of his face from photos/team.webp, for the small round portrait beside the quote.
  face: "/media/pages/ki-workshop/roman-portrait.webp",
};

export const KW_HERO = {
  title: "KI verstehen. Praktisch anwenden.",
  accent: "Produktiver arbeiten.",
  text: "Buchen Sie Roman Tränkle als KI-Trainer für Ihr Unternehmen. In praxisnahen Workshops lernt Ihr Team, wie künstliche Intelligenz sicher und sinnvoll im Arbeitsalltag eingesetzt wird.",
  points: ["Auf Ihre Geschäftsprozesse abgestimmt", "Remote, vor Ort oder hybrid", "Für Teams und Führungskräfte", "Verständlich und direkt anwendbar"],
  cta: "KI-Workshop anfragen",
  tag: { name: "Roman Tränkle", role: "KI-Trainer & Umsetzungspartner", note: "Praxisnahes Training" },
  alt: "Roman Tränkle im Workshop mit einem Team",
};

export const KW_CHALLENGES = {
  title: "Viele Unternehmen nutzen bereits KI –",
  accent: "aber noch ohne klare Struktur.",
  text: "KI-Tools sind verfügbar, doch häufig fehlt das Wissen, wie sie sicher, produktiv und einheitlich im Unternehmen eingesetzt werden können.",
  items: [
    { title: "Unsicherheit im Team", text: "Mitarbeiter wissen nicht, welche KI-Tools sie nutzen dürfen und wie sie richtig damit arbeiten." },
    { title: "Tool-Chaos", text: "Verschiedene Anwendungen werden getestet, aber nicht sinnvoll in bestehende Prozesse integriert." },
    { title: "Fehlende Richtlinien", text: "Datenschutz, Freigaben und interne Regeln sind noch nicht eindeutig definiert." },
    { title: "Zu wenig Praxis", text: "Viele Schulungen erklären nur die Theorie und schaffen keine Veränderung im Arbeitsalltag." },
  ],
};

export const KW_RESULTS = {
  title: "Aus KI-Wissen werden",
  accent: "konkrete Anwendungen.",
  text: "Nach dem Workshop versteht Ihr Team nicht nur die Möglichkeiten von KI, sondern weiß auch, wie diese im eigenen Arbeitsbereich genutzt werden können.",
  items: [
    "Relevante KI-Anwendungsfälle erkennen",
    "Passende Tools sicher einsetzen",
    "Bessere Prompts und Workflows entwickeln",
    "Wiederkehrende Aufgaben vereinfachen",
    "Chancen und Risiken realistisch bewerten",
    "Klare nächste Schritte festlegen",
  ],
  done: "Praxistransfer garantiert",
  cta: "Workshop-Ziele besprechen",
};

export const KW_MODULES = {
  title: "Die passenden KI-Themen",
  accent: "für Ihren Arbeitsalltag",
  text: "Die Inhalte werden nach Branche, Wissensstand, Abteilung und konkreten Zielen zusammengestellt.",
  pick: "Modul für Workshop wählbar",
  items: [
    { title: "ChatGPT und Prompting", text: "Bessere Anweisungen formulieren und zuverlässigere Ergebnisse erzielen." },
    { title: "KI-Tools im Arbeitsalltag", text: "Geeignete Tools auswählen und produktiv in tägliche Aufgaben integrieren." },
    { title: "KI-Automatisierung", text: "Wiederkehrende Prozesse erkennen und sinnvoll automatisieren." },
    { title: "KI für Marketing und Vertrieb", text: "Content, Recherche, Leadbearbeitung und Kundenkommunikation optimieren." },
    { title: "KI-Strategie und Umsetzung", text: "Anwendungsbereiche priorisieren und eine realistische KI-Roadmap entwickeln." },
    { title: "AI Literacy und sichere Nutzung", text: "Möglichkeiten, Grenzen, Datenschutz und verantwortungsvollen KI-Einsatz verstehen." },
  ],
  cta: "Individuelle Workshop-Inhalte anfragen",
  // The e-mail the button opens: his address; the subject is the page's own name, the body the chosen modules.
  mail: { to: "info@brandedgenius.de", subject: "KI-Workshop" },
};

export const KW_DEPARTMENTS = {
  title: "Passende Inhalte für",
  accent: "verschiedene Unternehmensbereiche",
  root: "Fokusbereich für Ihr Team",
  items: [
    { title: "Geschäftsführung", text: "KI strategisch einordnen, Potenziale bewerten und sichere Entscheidungen treffen." },
    { title: "Marketing-Teams", text: "Content, Recherche, Planung und Kampagnen effizienter umsetzen." },
    { title: "Vertriebsteams", text: "Leads vorbereiten, Follow-ups verbessern und CRM-Prozesse unterstützen." },
    { title: "Kundenservice", text: "Antworten, Wissensmanagement und wiederkehrende Support-Prozesse optimieren." },
    { title: "Backoffice und Operations", text: "Dokumente, Daten und interne Arbeitsabläufe einfacher bearbeiten." },
    { title: "HR und Teamleitung", text: "Mitarbeiter befähigen und eine verantwortungsvolle KI-Nutzung fördern." },
  ],
};

export type FormatKey = "onsite" | "online" | "hybrid" | "custom";

export const KW_FORMATS = {
  title: "Remote, vor Ort,",
  accent: "hybrid oder individuell",
  items: [
    {
      key: "onsite",
      title: "Vor-Ort-Workshop",
      label: "Direkt vor Ort",
      text: "Interaktives Training direkt in Ihrem Unternehmen – ideal für Teams, Abteilungen und Führungskräfte.",
      alt: "Roman Tränkle im Vor-Ort-Workshop",
    },
    {
      key: "online",
      title: "Online-Seminar",
      label: "Remote / Virtuell",
      text: "Kompaktes, interaktives Training für verteilte Teams oder einen schnellen Einstieg.",
      alt: "Roman Tränkle im Online-Seminar",
    },
    {
      key: "hybrid",
      title: "Hybrid-Workshop",
      label: "Online & Vor Ort",
      text: "Online-Vorbereitung kombiniert mit einer intensiven Vor-Ort-Session und Nachbereitung.",
      alt: "Roman Tränkle vor Ort und online",
    },
    {
      key: "custom",
      title: "Individuelles Training",
      label: "100% Maßgeschneidert",
      text: "Maßgeschneiderte Inhalte für Ihre Branche, Tools, Ziele und konkrete Anwendungsfälle.",
      alt: "Roman Tränkle im individuellen Training mit einem Team",
    },
  ] as { key: FormatKey; title: string; label: string; text: string; alt: string }[],
  notes: ["Für kleine und große Teams geeignet", "Dauer und Umfang flexibel planbar", "Praxisbeispiele aus Ihrem Unternehmen", "Termine nach Verfügbarkeit"],
};

export const KW_STEPS = {
  title: "In fünf Schritten zum",
  accent: "passenden KI-Workshop",
  items: [
    { title: "Zielklärung", text: "Wir besprechen Zielgruppe, aktuellen Wissensstand und gewünschte Ergebnisse." },
    { title: "Themenauswahl", text: "Gemeinsam wählen wir passende Module und praktische Anwendungsfälle aus." },
    { title: "Vorbereitung", text: "Inhalte, Übungen und Beispiele werden auf Ihr Unternehmen abgestimmt." },
    { title: "Durchführung", text: "Der Workshop findet remote, vor Ort oder im hybriden Format statt." },
    { title: "Transfer", text: "Ihr Team erhält konkrete Empfehlungen, Vorlagen und klare nächste Schritte." },
  ],
  quote: "Ein guter KI-Workshop endet nicht mit Theorie, sondern mit konkreten Anwendungsfällen, die Ihr Team sofort versteht und nutzen kann.",
  author: "Roman Tränkle",
  role: "Gründer & KI-Trainer",
};

export const KW_TRAINER = {
  title: "Roman Tränkle",
  accent: "KI-Trainer und Umsetzungspartner",
  text: [
    "Roman Tränkle verbindet künstliche Intelligenz mit praktischem Wissen aus Marketing, Vertrieb, Automatisierung und digitalen Geschäftsprozessen.",
    "Seine Workshops sind verständlich aufgebaut und konsequent auf die praktische Anwendung ausgerichtet. Das Ziel: Ihr Team soll KI nicht nur kennenlernen, sondern direkt produktiv einsetzen können.",
  ],
  skillsLabel: "Kernkompetenzen",
  skills: [
    "KI-Automatisierung",
    "ChatGPT und KI-Tools",
    "Marketing und Vertrieb",
    "CRM und digitale Workflows",
    "Prozessoptimierung",
    "Team- und Führungskräftetrainings",
    "AI Literacy",
  ],
  cta: "Workshop mit Roman anfragen",
  alt: "Roman Tränkle, KI-Trainer und Umsetzungspartner",
};

export const KW_ACADEMY = {
  title: "Teil der",
  accent: "Branded Genius KI-Akademie",
  text: "Unsere KI-Workshops sind Teil des Weiterbildungsbereichs von Branded Genius. Im Mittelpunkt stehen keine allgemeinen Standardkurse, sondern individuell entwickelte Formate für Unternehmen, Teams und Führungskräfte.",
  perksLabel: "Ihre Vorteile",
  perks: ["Inhalte passend zu Ihrem Unternehmen", "Konkrete Aufgaben und Anwendungsfälle", "Verständliche Vermittlung", "Direkter Transfer in den Arbeitsalltag"],
  cta: "Workshop-Angebot anfragen",
};

export const KW_FAQ = {
  title: "Alles Wichtige zu unseren",
  accent: "KI-Workshops",
  items: [
    { q: "Sind Vorkenntnisse erforderlich?", a: "Nein. Die Inhalte werden an den aktuellen Wissensstand der Teilnehmer angepasst." },
    { q: "Wie lange dauert ein Workshop?", a: "Je nach Ziel kann das Format wenige Stunden, einen ganzen Tag oder mehrere Einheiten umfassen." },
    { q: "Können eigene Geschäftsprozesse behandelt werden?", a: "Ja. Konkrete Prozesse, Tools und Anwendungsfälle können in den Workshop integriert werden." },
    { q: "Sind die Workshops auch remote möglich?", a: "Ja. Die Workshops können online, vor Ort oder hybrid durchgeführt werden." },
    { q: "Wie viele Personen können teilnehmen?", a: "Das Format eignet sich sowohl für kleine Gruppen als auch für größere Teams und Abteilungen." },
    {
      q: "Was kostet ein KI-Workshop?",
      a: "Der Preis richtet sich nach Dauer, Teilnehmerzahl, Format und individuellem Vorbereitungsaufwand. Sie erhalten ein transparentes Angebot.",
    },
  ],
};
