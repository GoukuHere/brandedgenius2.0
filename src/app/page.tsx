import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CasesSection } from "@/components/sections/cases";
import { CompareSection } from "@/components/sections/compare";
import { CtaSection } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { ImpactSection } from "@/components/sections/impact";
import { PartnersSection } from "@/components/sections/partners";
import { ProblemSection } from "@/components/sections/problem";
import { ProcessSection } from "@/components/sections/process";
import { PromiseSection } from "@/components/sections/promise";
import { RealitySection } from "@/components/sections/reality";
import { ServicesSection } from "@/components/sections/services";
import { SolutionSection } from "@/components/sections/solution";
import { SystemSection } from "@/components/sections/system-hub";
import { VoicesSection } from "@/components/sections/voices";
import { WhySection } from "@/components/sections/why";
import { WorkshopSection } from "@/components/sections/workshop";

// The client's own section order from brandedgenius.de (the second film removed at the developer's request).
export default function Home() {
  return (
    <>
      <Header />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <ProblemSection />
        <RealitySection />
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
    </>
  );
}
