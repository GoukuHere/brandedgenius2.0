import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CtaSection } from "@/components/sections/cta";
import { PartnersSection } from "@/components/sections/partners";
import { ProcessSection } from "@/components/sections/process";
import { WorkshopSection } from "@/components/sections/workshop";
import { RevealObserver } from "@/components/system/reveal-observer";
import { V10Background } from "@/components/v10/background";
import { CasesSection } from "@/components/v10/cases";
import { CompareSection } from "@/components/v10/compare";
import { HeroIntoProblem } from "@/components/v10/hero";
import { ImpactSection } from "@/components/v10/impact";
import { PromiseSection } from "@/components/v10/promise";
import { ReasonsSection } from "@/components/v10/reasons";
import { ServicesSection } from "@/components/v10/services";
import { SolutionSection } from "@/components/v10/solution";
import { SystemSection } from "@/components/v10/system-hub";
import { VoicesSection } from "@/components/v10/voices";
import { WhySection } from "@/components/v10/why";
import "@/components/v10/v10.css";

/*
  Version v10 (2026-11-10, rebuilt from v1 the same day): v1's homepage (src/app/page.tsx) with only the changes the
  client asked for in his two Loom videos, as the developer went through them line by line. Same sections in the same
  order with v1's placement, type, spacing and behaviour; v1's own section files wherever a section is unchanged
  (Ablauf, Workshop, Partner, Kontakt, header, footer); copies in components/v10 only where something changes:
  - colour: v2's light navy on v1's one fixed background (V10Background), buttons in v2's royal;
  - hero: only the film, its headline and the two actions, zooming once into the top of v1's Problem section, whose
    six cards are left out; v2's reasons panel replaces v1's reasons list;
  - Vorher/Nachher and Versprechen stand still, the pillars are calm panels, the qualities sit in the hub;
  - Leistungen: v1's stacked plates in navy; Use Cases: results and headline only; Warum: titles only, with icons;
    Impact with icons; testimonial arrows beside the card.
  No section slides over another, and no smooth-scroll library: the page scrolls normally. Kept out of search engines.
*/
export const metadata: Metadata = {
  title: "v10: Feedback | Branded Genius",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#061536",
};

export default function VersionZehn() {
  return (
    <div className="v10">
      <V10Background />
      <Header />
      <main id="main" className="overflow-x-clip">
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
      </main>
      <Footer />
      <RevealObserver />
    </div>
  );
}
