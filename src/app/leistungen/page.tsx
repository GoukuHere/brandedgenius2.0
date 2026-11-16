import type { Metadata } from "next";
import { AgentsSection } from "@/components/pages/leistungen/agents";
import { CallbotsSection } from "@/components/pages/leistungen/callbots";
import { ChatbotsSection } from "@/components/pages/leistungen/chatbots";
import { ClosingSection } from "@/components/pages/leistungen/closing";
import { EcosystemSection } from "@/components/pages/leistungen/ecosystem";
import { HeroSection } from "@/components/pages/leistungen/hero";
import { MarketingSection } from "@/components/pages/leistungen/marketing";
import { PotenzialSection } from "@/components/pages/leistungen/potenzial";
import { VorgehenSection } from "@/components/pages/leistungen/vorgehen";
import { SiteShell } from "@/components/site/site-shell";
import "@/components/pages/leistungen/leistungen.css";

// The client's own page title and description from brandedgenius.de/leistungen/.
export const metadata: Metadata = {
  title: "KI-Leistungen & Automatisierung",
  description: "Entdecken Sie die Leistungen von Branded Genius rund um KI-Agenten, Automatisierung, digitale Prozesse, Beratung und individuelle KI-Lösungen für Unternehmen.",
};

/*
  /leistungen: built 2026-11-16 from the client's own copy on brandedgenius.de/leistungen/, in sections that repeat nothing
  from the homepage or the other pages. Sections live in src/components/pages/leistungen/:
  the BG Engine hero, Das Potenzial (a statement lit by the scroll), his four services as working demos (agent console,
  messenger phone, voice engine, pipeline track), the ecosystem ring, the Vorgehen staircase and the closing question.
*/
export default function LeistungenPage() {
  return (
    <SiteShell>
      <HeroSection />
      <PotenzialSection />
      <AgentsSection />
      <ChatbotsSection />
      <CallbotsSection />
      <MarketingSection />
      <EcosystemSection />
      <VorgehenSection />
      <ClosingSection />
    </SiteShell>
  );
}
