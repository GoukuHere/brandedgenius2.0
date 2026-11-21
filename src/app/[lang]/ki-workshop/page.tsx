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
import { getCopy } from "@/i18n/server";
import "@/components/pages/ki-workshop/ki-workshop.css";

// The page title and description in the page's language (round 5: the German is the client's own, now in the copy module).
export async function generateMetadata(): Promise<Metadata> {
  const { KW_META } = (await getCopy()).kiWorkshop;
  return { title: KW_META.title, description: KW_META.description };
}

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
