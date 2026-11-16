import type { Metadata } from "next";
import { KontaktClosing } from "@/components/pages/kontakt/closing";
import { KontaktDirect } from "@/components/pages/kontakt/direct";
import { KontaktFaq } from "@/components/pages/kontakt/faq";
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
  beside his real contact form, his two direct channels as one split panel, his five questions answered in the open,
  and a close over a quiet beacon. Nothing here repeats a homepage section.
*/
export default function KontaktPage() {
  return (
    <SiteShell>
      <KontaktHero />
      <KontaktDirect />
      <KontaktFaq />
      <KontaktClosing />
    </SiteShell>
  );
}
