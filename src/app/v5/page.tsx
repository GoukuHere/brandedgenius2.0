import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { CobaltConcept } from "@/components/concepts/cobalt/cobalt";
import "@/components/concepts/concepts.css";

// Instrument Sans (Instrument, SIL Open Font License), with its width axis for the condensed headlines; self-hosted
// by next/font at build time.
const sans = Instrument_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-inst", display: "swap" });

// Version v5 (layout concept 4) for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v5: Kobalt | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptVier() {
  return <CobaltConcept fontClass={sans.variable} />;
}
