import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import { CrystalConcept } from "@/components/concepts/crystal/crystal";
import "@/components/concepts/crystal/crystal.css";

// Mona Sans (SIL Open Font License) with its width axis, self-hosted by next/font at build time.
const display = Mona_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-mona", display: "swap" });

// Version v8 for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v8: Kristall | Branded Genius",
  robots: { index: false, follow: false },
};

export default function VersionAcht() {
  return <CrystalConcept fontClass={display.variable} />;
}
