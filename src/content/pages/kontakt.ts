/*
  /kontakt: the client's own copy from brandedgenius.de/kontakt/ (2026-11-16). His small caps labels above headings
  ("PROJEKT-DIALOG", "IHRE ANFRAGE", "HÄUFIGE FRAGEN", "BEREIT FÜR DEN NÄCHSTEN SCHRITT?") are left out: the site uses
  no labels above headlines. Nothing here is new wording.
  Round 5 (2026-11-18, Roman): the page is only the first section now ("in the contact, we need only the contact
  form"), so his "Direkter Kontakt" doors, his five questions and the closing call came off with their sections.
*/

// The client's own page title and description from brandedgenius.de/kontakt/ (round 5: moved here from the page).
export const KONTAKT_META = {
  title: "Kontakt",
  description: "Kontaktieren Sie Branded Genius für KI-Beratung, Automatisierung, Workshops und individuelle digitale Lösungen. Jetzt unverbindlich anfragen.",
};

export const KONTAKT_HERO = {
  title: "Lassen Sie uns über",
  accent: "Ihr Projekt sprechen.",
  text: "Sie möchten KI, Automatisierung oder digitales Wachstum sinnvoll in Ihrem Unternehmen einsetzen? Beschreiben Sie uns kurz Ihr Vorhaben – wir melden uns persönlich bei Ihnen.",
  primary: "Anfrage senden",
  secondary: "Erstgespräch buchen",
  dialogTitle: "Direkter Draht",
  steps: [
    { label: "Ausgangspunkt", text: "Unternehmen & Anforderung" },
    { label: "Impuls", text: "Qualifizierte Anfrage" },
    { label: "Abstimmung", text: "Persönliches Expertengespräch" },
    { label: "Ergebnis", text: "Konkrete Roadmap & Umsetzung" },
  ],
  responseLabel: "Reaktionszeit",
  responseValue: "Innerhalb von 24 Std.",
  formTitle: "Wie können wir Sie unterstützen?",
  formText: "Teilen Sie uns die wichtigsten Informationen mit. Wir prüfen Ihre Anfrage und besprechen gemeinsam die nächsten sinnvollen Schritte.",
};

/** His hosted contact form (LeadConnector), embedded on this page; the id is the one in LINKS.contact. */
export const KONTAKT_FORM = {
  id: "JemoFrrJQ5D665FZaVM0",
  src: "https://api.brandedgenius.net/widget/form/JemoFrrJQ5D665FZaVM0",
  title: "Kontaktformular Branded Genius",
};
