/*
  English copy for the Contact page, /en/contact (round 5, the DE/EN switch). Each export mirrors the German one in
  content/pages/kontakt.ts (same names, same shape; checked with Shape<...>). Written to the copy standard from the
  German meaning. The contact form itself is the client's hosted LeadConnector form and stays German in both
  languages: KONTAKT_FORM keeps its id and address, and only the frame's accessible title is English.
*/
import type * as DE from "../../pages/kontakt";
import type { Shape } from "@/i18n/shape";

export const KONTAKT_META: Shape<typeof DE.KONTAKT_META> = {
  title: "Contact",
  description: "Contact Branded Genius for AI consulting, automation, workshops and custom digital solutions. Send us a no-obligation inquiry today.",
};

export const KONTAKT_HERO: Shape<typeof DE.KONTAKT_HERO> = {
  title: "Let's talk about",
  accent: "your project.",
  text: "Tell us briefly how you want to put AI, automation or digital growth to work in your business. We will get back to you in person.",
  primary: "Send inquiry",
  secondary: "Book an initial consultation",
  dialogTitle: "Direct line",
  steps: [
    { label: "Starting point", text: "Your business & needs" },
    { label: "First step", text: "Qualified inquiry" },
    { label: "Alignment", text: "Personal talk with an expert" },
    { label: "Result", text: "Concrete roadmap & implementation" },
  ],
  responseLabel: "Response time",
  responseValue: "Within 24 hours",
  formTitle: "How can we help you?",
  formText: "Share the key details with us. We review your inquiry and work out the right next steps together with you.",
};

/** His hosted contact form (LeadConnector), the same form in both languages; the id is the one in LINKS.contact. */
export const KONTAKT_FORM: Shape<typeof DE.KONTAKT_FORM> = {
  id: "JemoFrrJQ5D665FZaVM0",
  src: "https://api.brandedgenius.net/widget/form/JemoFrrJQ5D665FZaVM0",
  title: "Branded Genius contact form",
};
