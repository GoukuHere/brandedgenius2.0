import type { Metadata } from "next";
import { KontaktHero } from "@/components/pages/kontakt/hero";
import { SiteShell } from "@/components/site/site-shell";
import { getCopy, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import "@/components/pages/kontakt/kontakt.css";

// The client's own page title and description from brandedgenius.de/kontakt/, by language (round 5: KONTAKT_META).
export async function generateMetadata(): Promise<Metadata> {
  // 2026-11-24: one title per page (the German word for word as the old site served it), the canonical and the
  // language pair (lib/seo.ts).
  const { KONTAKT_META } = (await getCopy()).kontakt;
  return pageMetadata("kontakt", await getLocale(), KONTAKT_META);
}

/*
  /kontakt (2026-11-16), from the client's own copy on brandedgenius.de/kontakt/: his headline and "Direkter Draht"
  beside his real contact form. Round 5 (2026-11-18, Roman: "remove everything ... in the contact, we need only the
  contact form"): the page is this one section; the doors, the questions and the close came off.
  Round 5 (DE/EN): copy by language; the English page is /en/contact.
*/
export default function KontaktPage() {
  return (
    <SiteShell>
      <KontaktHero />
    </SiteShell>
  );
}
