import type { Metadata } from "next";
import { UberClosing } from "@/components/pages/uber-uns/closing";
import { UberExpertise } from "@/components/pages/uber-uns/expertise";
import { UberFounder } from "@/components/pages/uber-uns/founder";
import { UberHero } from "@/components/pages/uber-uns/hero";
import { UberMission } from "@/components/pages/uber-uns/mission";
import { UberProcess } from "@/components/pages/uber-uns/process-dial";
import { UberTrust } from "@/components/pages/uber-uns/trust";
import { SiteShell } from "@/components/site/site-shell";
import { getCopy, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import "@/components/pages/uber-uns/uber-uns.css";

// The client's own page title and description from brandedgenius.de/uber-uns/, by language (round 5: UU_META).
export async function generateMetadata(): Promise<Metadata> {
  // 2026-11-24: one title per page (the German word for word as the old site served it), the canonical and the
  // language pair (lib/seo.ts).
  const { UU_META } = (await getCopy()).uberUns;
  return pageMetadata("uberUns", await getLocale(), UU_META);
}

/*
  /uber-uns: built 2026-11-16 from the client's own copy on brandedgenius.de/uber-uns/, in sections that repeat nothing
  from the homepage or the other pages. Sections live in src/components/pages/uber-uns/:
  the manifesto over the bG mark, the mission as a growth line, the founder spread, the expertise as large type with a
  floating photo, the promises around a turning seal, "So arbeiten wir" on a dial (the site's one held section), and a
  quiet close.
  Round 5 (DE/EN): copy by language; the English page is /en/about.
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
