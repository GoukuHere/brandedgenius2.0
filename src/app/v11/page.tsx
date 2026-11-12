import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/v11/footer";
import { Header } from "@/components/layout/header";
import { CtaSection } from "@/components/sections/cta";
import { PartnersSection } from "@/components/v11/partners";
import { ProcessSection } from "@/components/v11/process";
import { WorkshopSection } from "@/components/v11/workshop";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { V11Background } from "@/components/v11/background";
import { CasesSection } from "@/components/v11/cases";
import { CompareSection } from "@/components/v11/compare";
import { HeroIntoProblem } from "@/components/v11/hero";
import { ImpactSection } from "@/components/v11/impact";
import { PromiseSection } from "@/components/v11/promise";
import { ReasonsSection } from "@/components/v11/reasons";
import { ServicesSection } from "@/components/v11/services";
import { SolutionSection } from "@/components/v11/solution";
import { SystemSection } from "@/components/v11/system-hub";
import { VoicesSection } from "@/components/v11/voices";
import { WhySection } from "@/components/v11/why";
import "@/components/v11/v11.css";

/*
  Version v11 (2026-11-10): v10 taken further at the developer's request ("v10 is not that good, avoid sections with
  too much text and use some cool layout for that, utilise 21st.dev, Magic UI"). Same base as v10: v1's page with the
  client's changes from his two Loom videos, on v1's one fixed background in v2's light navy, no section sliding over
  another. What v11 adds: the text-heavy parts become bento layouts with animated icons; the Vorher/Nachher becomes
  one drawing of the two ways; the Versprechen is v1's 3D card again, its figures counting up; the Use Cases are
  v9's fan of glass layers. Second round (the developer's notes of 2026-11-10): v1's smooth scrolling and v1's
  section rhythm. v1 and v10 stay as they are. Kept out of search engines.
*/
export const metadata: Metadata = {
  title: "v11: Feedback Plus | Branded Genius",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#061536",
};

export default function VersionElf() {
  return (
    <div className="v11">
      <V11Background />
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
      {/* v1's smooth scrolling (the developer: "add the smooth scroll on page we have on v1"). */}
      <SmoothScroll />
    </div>
  );
}
