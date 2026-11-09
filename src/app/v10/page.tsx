import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CompareSection } from "@/components/sections/compare";
import { CtaSection } from "@/components/sections/cta";
import { PartnersSection } from "@/components/sections/partners";
import { WorkshopSection } from "@/components/sections/workshop";
import { RevealObserver } from "@/components/system/reveal-observer";
import { CasesSection } from "@/components/v10/cases";
import { HeroIntoProblem } from "@/components/v10/hero";
import { ImpactSection } from "@/components/v10/impact";
import { ProcessSection } from "@/components/v10/process";
import { PromiseSection } from "@/components/v10/promise";
import { ServicesSection } from "@/components/v10/services";
import { SolutionSection } from "@/components/v10/solution";
import { Sheet, StackMotion } from "@/components/v10/stack";
import { SystemSection } from "@/components/v10/system-hub";
import { VoicesSection } from "@/components/v10/voices";
import { WhySection } from "@/components/v10/why";
import "@/components/v10/v10.css";

/*
  Version v10 (2026-11-10): the client's feedback from his two Loom videos, applied to v1. v1's sections in v1's
  order, in v2's navy and rounded sheets, with v2's overlay between them and normal scrolling; v6's zoom once, from
  the full-screen film into v2's Problem panel. No smooth-scroll library (the client found v1 lagging); the only
  held stretches are the hero's zoom and the team photo in "Über uns", which he liked. Reached from the version
  switcher; kept out of search engines.

  Sheets: a sheet holds one section, or two where one alone would be shorter than the screen (it could not be
  covered whole by the next).
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
        <Sheet light="a">
          <CompareSection />
          <PromiseSection />
        </Sheet>
        <Sheet light="c">
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
        <Sheet light="a">
          <ProcessSection />
        </Sheet>
        <Sheet light="b">
          <WhySection />
        </Sheet>
        <Sheet light="c">
          <ImpactSection />
        </Sheet>
        <Sheet light="a">
          <WorkshopSection />
        </Sheet>
        <Sheet light="d">
          <PartnersSection />
          <VoicesSection />
        </Sheet>
        <Sheet light="b">
          <CtaSection />
          <Footer />
        </Sheet>
      </main>
      <RevealObserver />
      <StackMotion />
    </div>
  );
}
