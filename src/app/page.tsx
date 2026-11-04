import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CasesSection } from "@/components/sections/cases";
import { CompareSection } from "@/components/sections/compare";
import { CtaSection } from "@/components/sections/cta";
import { FilmSection } from "@/components/sections/film";
import { Hero } from "@/components/sections/hero";
import { ImpactSection } from "@/components/sections/impact";
import { Marquee } from "@/components/sections/marquee";
import { PartnersSection } from "@/components/sections/partners";
import { ProblemSection } from "@/components/sections/problem";
import { ProcessSection } from "@/components/sections/process";
import { PromiseSection } from "@/components/sections/promise";
import { SolutionSection } from "@/components/sections/solution";
import { SystemSection } from "@/components/sections/system-hub";
import { VoicesSection } from "@/components/sections/voices";
import { WhySection } from "@/components/sections/why";
import { WorkshopSection } from "@/components/sections/workshop";

// The client's own section order from brandedgenius.de, redesigned on one background.
export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <FilmSection />
        <ProblemSection />
        <CompareSection />
        <PromiseSection />
        <SolutionSection />
        <SystemSection />
        {/* ServicesSection goes here once its builder finishes. */}
        <CasesSection />
        <Marquee />
        <ProcessSection />
        <WhySection />
        <ImpactSection />
        <WorkshopSection />
        <PartnersSection />
        <VoicesSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
