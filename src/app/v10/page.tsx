import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CtaSection } from "@/components/sections/cta";
import { PartnersSection } from "@/components/sections/partners";
import { WorkshopSection } from "@/components/sections/workshop";
import { RevealObserver } from "@/components/system/reveal-observer";
import { CasesSection } from "@/components/v10/cases";
import { CompareSection } from "@/components/v10/compare";
import { HeroIntoProblem } from "@/components/v10/hero";
import { ImpactSection } from "@/components/v10/impact";
import { ProcessSection } from "@/components/v10/process";
import { PromiseSection } from "@/components/v10/promise";
import { ReasonsSection } from "@/components/v10/reasons";
import { ServicesSection } from "@/components/v10/services";
import { SolutionSection } from "@/components/v10/solution";
import { Sheet, StackMotion } from "@/components/v10/stack";
import { SystemSection } from "@/components/v10/system-hub";
import { VoicesSection } from "@/components/v10/voices";
import { WhySection } from "@/components/v10/why";
import "@/components/v10/v10.css";

/*
  Version v10 (2026-11-10, reworked the same day): the client's two Loom videos, as the developer went through them
  line by line. v1's page (its sections in v1's order, placement, type and spacing, and the behaviour of the sections
  he liked) in v2's light navy and rounded sheets, with v2's overlay between sections and normal scrolling. Changed
  are only the parts he turned down: the hero is the film alone with its headline, zooming once into the top of v1's
  Problem section; v2's reasons replace v1's problem cards and reasons list; Vorher/Nachher stands still; the pillars
  are calm panels; the qualities sit in the hub; Use Cases and Warum carry less text. No smooth-scroll library.
  Reached from the version switcher; kept out of search engines.

  A sheet holds one section, or two where one alone would be much shorter than the screen.
*/
export const metadata: Metadata = {
  title: "v10: Feedback | Branded Genius",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#02060f",
};

export default function VersionZehn() {
  return (
    <div className="v10">
      <Header />
      <main id="main" className="overflow-x-clip">
        <HeroIntoProblem />
        <Sheet light="c">
          <ReasonsSection />
        </Sheet>
        <Sheet light="e">
          <CompareSection />
          <PromiseSection />
        </Sheet>
        <Sheet light="a">
          <SolutionSection />
        </Sheet>
        <Sheet light="b">
          <SystemSection />
        </Sheet>
        <Sheet light="c">
          <ServicesSection />
        </Sheet>
        <Sheet light="d">
          <CasesSection />
        </Sheet>
        <Sheet light="e">
          <ProcessSection />
        </Sheet>
        <Sheet light="a">
          <WhySection />
        </Sheet>
        <Sheet light="c">
          <ImpactSection />
        </Sheet>
        <Sheet light="b">
          <WorkshopSection />
        </Sheet>
        <Sheet light="d">
          <PartnersSection />
          <VoicesSection />
        </Sheet>
        <Sheet light="e">
          <CtaSection />
          <Footer />
        </Sheet>
      </main>
      <RevealObserver />
      <StackMotion />
    </div>
  );
}
