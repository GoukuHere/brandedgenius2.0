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
import { getCopy, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import "@/components/pages/leistungen/leistungen.css";

// The client's own page title and description from brandedgenius.de/leistungen/ (round 5, DE/EN: from the page's copy, by language).
export async function generateMetadata(): Promise<Metadata> {
  // 2026-11-24: one title per page (the German word for word as the old site served it), the canonical and the
  // language pair (lib/seo.ts).
  const { LEISTUNGEN_META } = (await getCopy()).leistungen;
  return pageMetadata("leistungen", await getLocale(), LEISTUNGEN_META);
}

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
