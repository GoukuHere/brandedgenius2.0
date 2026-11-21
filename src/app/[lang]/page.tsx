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
