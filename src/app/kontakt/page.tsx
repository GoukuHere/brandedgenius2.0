import type { Metadata } from "next";
import { KontaktHero } from "@/components/pages/kontakt/hero";
import { SiteShell } from "@/components/site/site-shell";
import "@/components/pages/kontakt/kontakt.css";

// The client's own page title and description from brandedgenius.de/kontakt/.
export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie Branded Genius für KI-Beratung, Automatisierung, Workshops und individuelle digitale Lösungen. Jetzt unverbindlich anfragen.",
};

/*
  /kontakt (2026-11-16), from the client's own copy on brandedgenius.de/kontakt/: his headline and "Direkter Draht"
  beside his real contact form. Round 5 (2026-11-18, Roman: "remove everything ... in the contact, we need only the
  contact form"): the page is this one section; the doors, the questions and the close came off.
*/
export default function KontaktPage() {
  return (
    <SiteShell>
      <KontaktHero />
    </SiteShell>
  );
}
