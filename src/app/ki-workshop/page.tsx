import type { Metadata } from "next";
import { KwAcademy } from "@/components/pages/ki-workshop/academy";
import { KwChallenges } from "@/components/pages/ki-workshop/challenges";
import { KwDepartments } from "@/components/pages/ki-workshop/departments";
import { KwFaq } from "@/components/pages/ki-workshop/faq";
import { KwFormats } from "@/components/pages/ki-workshop/formats";
import { KwHero } from "@/components/pages/ki-workshop/hero";
import { KwModules } from "@/components/pages/ki-workshop/modules";
import { KwResults } from "@/components/pages/ki-workshop/results";
import { KwSteps } from "@/components/pages/ki-workshop/steps";
import { KwTrainer } from "@/components/pages/ki-workshop/trainer";
import { SiteShell } from "@/components/site/site-shell";
import "@/components/pages/ki-workshop/ki-workshop.css";

// The client's own page title and description from brandedgenius.de/ki-workshop/.
export const metadata: Metadata = {
  title: "KI-Workshop für Unternehmen",
  description: "Praxisnahe KI-Workshops für Unternehmen: Entdecken Sie konkrete Einsatzmöglichkeiten, Automatisierungen und Strategien für den effizienten Einsatz von künstlicher Intelligenz.",
};

/*
  /ki-workshop: built 2026-11-16 from the client's own copy on brandedgenius.de/ki-workshop/, in sections that repeat nothing
  from the homepage or the other pages. Sections live in src/components/pages/ki-workshop/, the copy in
  src/content/pages/ki-workshop.ts. One composed idea per section: a split hero with Roman's training photo, four
  challenge tiles that turn over, a course ring that fills with the scroll, a module picker that e-mails the choice, an
  org chart, a Venn diagram of the formats, a Gantt plan with his quote, his competencies around his portrait, the
  KI-Akademie band and the questions.
*/
export default function KiWorkshopPage() {
  return (
    <SiteShell>
      <KwHero />
      <KwChallenges />
      <KwResults />
      <KwModules />
      <KwDepartments />
      <KwFormats />
      <KwSteps />
      <KwTrainer />
      <KwAcademy />
      <KwFaq />
    </SiteShell>
  );
}
