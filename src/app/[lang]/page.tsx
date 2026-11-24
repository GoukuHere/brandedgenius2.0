import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { CtaSection } from "@/components/sections/cta";
import { CasesSection } from "@/components/v11/cases";
import { CompareSection } from "@/components/v11/compare";
import { HeroIntoProblem } from "@/components/v11/hero";
import { ImpactSection } from "@/components/v11/impact";
import { PartnersSection } from "@/components/v11/partners";
import { ProcessSection } from "@/components/v11/process";
import { PromiseSection } from "@/components/v11/promise";
import { ReasonsSection } from "@/components/v11/reasons";
import { ServicesSection } from "@/components/v11/services";
import { SolutionSection } from "@/components/v11/solution";
import { SystemSection } from "@/components/v11/system-hub";
import { VoicesSection } from "@/components/v11/voices";
import { WhySection } from "@/components/v11/why";
import { WorkshopSection } from "@/components/v11/workshop";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

/*
  The home page's title and description (2026-11-24): the German ones are the old site's, word for word, kept for the
  move; the English ones are the site's own.
*/
const HOME_META = {
  de: {
    title: "KI-Automatisierung & digitale Transformation | Branded Genius",
    description:
      "Branded Genius entwickelt KI-Agenten, Automatisierungen und intelligente Workflows für Marketing, Vertrieb, Kundenservice und interne Prozesse – strategisch, messbar und praxisnah umgesetzt.",
  },
  en: {
    title: "AI automation that delivers results | Branded Genius",
    description:
      "Branded Genius builds AI agents, automations and smart workflows for marketing, sales, customer service and internal processes. From the potential analysis to the finished system.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return pageMetadata("home", locale, HOME_META[locale]);
}

/*
  The homepage: v11 "Feedback Plus", approved by the client on 2026-11-16 and now the only version (the ten earlier
  ones live on in the git tag versions-archive-2026-11-16; their old addresses redirect here). v1's page with the
  client's changes from his Loom rounds, on one fixed navy background, no section sliding over another.
*/
export default function HomePage() {
  return (
    <SiteShell>
      <HeroIntoProblem />
      <ReasonsSection />
      <CompareSection />
      <PromiseSection />
      <SolutionSection />
      <SystemSection />
      <ServicesSection />
      <CasesSection />
      <ProcessSection />
      <WhySection />
      <ImpactSection />
      <WorkshopSection />
      <PartnersSection />
      <VoicesSection />
      <CtaSection />
    </SiteShell>
  );
}
