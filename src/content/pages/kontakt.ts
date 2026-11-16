/*
  /kontakt: the client's own copy from brandedgenius.de/kontakt/ (2026-11-16). His small caps labels above headings
  ("PROJEKT-DIALOG", "IHRE ANFRAGE", "HÄUFIGE FRAGEN", "BEREIT FÜR DEN NÄCHSTEN SCHRITT?") are left out: the site uses
  no labels above headlines. Nothing here is new wording.
*/

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

export const KONTAKT_DIRECT = {
  title: "Direkter",
  accent: "Kontakt",
  text: "Sie möchten lieber direkt sprechen oder haben eine dringende Frage? Nutzen Sie unsere direkten Kanäle:",
  booking: { label: "Online-Termin", action: "Erstgespräch buchen" },
  email: { label: "E-Mail-Anfrage", action: "info@brandedgenius.de" },
  privacyTitle: "Verbindlich & vertraulich",
  privacyText: "Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage genutzt und niemals an Dritte weitergegeben.",
};

export const KONTAKT_FAQ = {
  title: "Fragen vor",
  accent: "Ihrer Anfrage",
  text: "Hier finden Sie die wichtigsten Antworten zur ersten Kontaktaufnahme, zum Ablauf und zu unseren Beratungsformaten.",
  items: [
    {
      q: "Welche Informationen sollte ich in meiner Anfrage angeben?",
      a: "Beschreiben Sie kurz Ihr Unternehmen, Ihre aktuelle Herausforderung und welches Ergebnis Sie erreichen möchten.",
    },
    {
      q: "Ich weiß noch nicht, welche KI-Lösung ich benötige. Kann ich trotzdem anfragen?",
      a: "Ja. Wir beginnen mit Ihren bestehenden Prozessen und prüfen gemeinsam, wo KI oder Automatisierung sinnvoll eingesetzt werden kann.",
    },
    {
      q: "Ist das Erstgespräch kostenlos?",
      a: "Ja. Im kostenlosen Erstgespräch besprechen wir Ihre aktuelle Situation und mögliche nächste Schritte.",
    },
    {
      q: "Können Gespräche auch remote stattfinden?",
      a: "Ja. Erstgespräche und Projektabstimmungen können remote durchgeführt werden.",
    },
    {
      q: "Kann ich auch einen individuellen KI-Workshop anfragen?",
      a: "Ja. Workshop-Inhalte und Formate werden an Ihr Unternehmen, Ihr Team und Ihre Ziele angepasst.",
    },
  ],
};

export const KONTAKT_CLOSING = {
  title: "Lassen Sie uns gemeinsam",
  accent: "die passende Lösung finden.",
  text: "Im persönlichen Gespräch klären wir Ihre Ziele, Herausforderungen und die nächsten sinnvollen Schritte.",
  primary: "Erstgespräch buchen",
  secondary: "Anfrage senden",
};

/** His hosted contact form (LeadConnector), embedded on this page; the id is the one in LINKS.contact. */
export const KONTAKT_FORM = {
  id: "JemoFrrJQ5D665FZaVM0",
  src: "https://api.brandedgenius.net/widget/form/JemoFrrJQ5D665FZaVM0",
  title: "Kontaktformular Branded Genius",
};
