import type { Metadata } from "next";
import { BenefitsSection } from "@/components/pages/use-cases/benefits";
import { ClosingSection } from "@/components/pages/use-cases/closing";
import { UseCasesHero } from "@/components/pages/use-cases/hero";
import { ProjectsSection } from "@/components/pages/use-cases/projects";
import { SiteShell } from "@/components/site/site-shell";
import { getCopy } from "@/i18n/server";
import "@/components/pages/use-cases/use-cases.css";

// The client's own page title and description from brandedgenius.de/use-cases/ (round 5: per language, in the page's copy).
export async function generateMetadata(): Promise<Metadata> {
  const { UC_META } = (await getCopy()).useCases;
  return { title: UC_META.title, description: UC_META.description };
}

/*
  /use-cases: built 2026-11-16 from the client's own copy on brandedgenius.de/use-cases/, in sections that repeat nothing
  from the homepage or the other pages. Sections live in src/components/pages/use-cases/:
  - hero: his headline over his seven project names in outlined type, drifting in depth and parting with the scroll;
  - projekte: his filter chips over the seven projects as posters with cover art, each opening its full case view;
  - mehrwert: his six benefits as a radar chart that grows with the scroll;
  - anfrage: the seven projects' marks converging into one point above his closing call to action.
  His six-step process is left out here on purpose: the Über uns page carries it.
  Round 5 (2026-11-18, Roman): the featured Mega Screen block came off ("the filter ... is completely enough ... if we
  display like from that customer here again, that will be too much. You can remove that").
  Round 5 (DE/EN): copy by language; the title and description come from the page's copy (UC_META).
*/
export default function UseCasesPage() {
  return (
    <SiteShell>
      <UseCasesHero />
      <ProjectsSection />
      <BenefitsSection />
      <ClosingSection />
    </SiteShell>
  );
}
