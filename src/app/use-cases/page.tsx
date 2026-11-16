import type { Metadata } from "next";
import { BenefitsSection } from "@/components/pages/use-cases/benefits";
import { ClosingSection } from "@/components/pages/use-cases/closing";
import { FeaturedSection } from "@/components/pages/use-cases/featured";
import { UseCasesHero } from "@/components/pages/use-cases/hero";
import { ProjectsSection } from "@/components/pages/use-cases/projects";
import { SiteShell } from "@/components/site/site-shell";
import "@/components/pages/use-cases/use-cases.css";

// The client's own page title and description from brandedgenius.de/use-cases/.
export const metadata: Metadata = {
  title: "KI Use Cases für Unternehmen",
  description: "Entdecken Sie praxisnahe KI Use Cases für Marketing, Vertrieb, Kundenservice und interne Prozesse und erfahren Sie, wie Unternehmen mit KI effizienter arbeiten.",
};

/*
  /use-cases: built 2026-11-16 from the client's own copy on brandedgenius.de/use-cases/, in sections that repeat nothing
  from the homepage or the other pages. Sections live in src/components/pages/use-cases/:
  - hero: his headline over his seven project names in outlined type, drifting in depth and parting with the scroll;
  - projekte: his filter chips over the seven projects as posters with cover art, each opening its full case view;
  - mega-screen: his featured case as an isometric stack (Web, KI-Agent, CRM) with a lead dropping through it;
  - mehrwert: his six benefits as a radar chart that grows with the scroll;
  - anfrage: the seven projects' marks converging into one point above his closing call to action.
  His six-step process is left out here on purpose: the Über uns page carries it.
*/
export default function UseCasesPage() {
  return (
    <SiteShell>
      <UseCasesHero />
      <ProjectsSection />
      <FeaturedSection />
      <BenefitsSection />
      <ClosingSection />
    </SiteShell>
  );
}
