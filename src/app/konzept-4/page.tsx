import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { CobaltConcept } from "@/components/concepts/cobalt/cobalt";
import "@/components/concepts/concepts.css";

// Instrument Sans (Instrument, SIL Open Font License), with its width axis for the condensed headlines; self-hosted
// by next/font at build time.
const sans = Instrument_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-inst", display: "swap" });

// Layout concept 4 for the client's review (2026-11-07). Not linked from the homepage and kept out of search engines.
export const metadata: Metadata = {
  title: "Konzept 4: Kobalt | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptVier() {
  return <CobaltConcept fontClass={sans.variable} />;
}
