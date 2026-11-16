import type { Metadata } from "next";
import { UberClosing } from "@/components/pages/uber-uns/closing";
import { UberExpertise } from "@/components/pages/uber-uns/expertise";
import { UberFounder } from "@/components/pages/uber-uns/founder";
import { UberHero } from "@/components/pages/uber-uns/hero";
import { UberMission } from "@/components/pages/uber-uns/mission";
import { UberProcess } from "@/components/pages/uber-uns/process-dial";
import { UberTrust } from "@/components/pages/uber-uns/trust";
import { SiteShell } from "@/components/site/site-shell";
import "@/components/pages/uber-uns/uber-uns.css";

// The client's own page title and description from brandedgenius.de/uber-uns/.
export const metadata: Metadata = {
  title: "Über Branded Genius | KI & Automatisierung",
  description: "Lernen Sie Branded Genius kennen und erfahren Sie mehr über unsere Mission, unsere Arbeitsweise und unseren Fokus auf KI, Automatisierung und digitale Lösungen.",
};

/*
  /uber-uns: built 2026-11-16 from the client's own copy on brandedgenius.de/uber-uns/, in sections that repeat nothing
  from the homepage or the other pages. Sections live in src/components/pages/uber-uns/:
  the manifesto over the bG mark, the mission as a growth line, the founder spread, the expertise as large type with a
  floating photo, the promises around a turning seal, "So arbeiten wir" on a dial (the site's one held section), and a
  quiet close.
*/
export default function UeberUnsPage() {
  return (
    <SiteShell>
      <UberHero />
      <UberMission />
      <UberFounder />
      <UberExpertise />
      <UberTrust />
      <UberProcess />
      <UberClosing />
    </SiteShell>
  );
}
