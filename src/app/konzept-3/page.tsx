import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { PaperConcept } from "@/components/concepts/paper/paper";
import "@/components/concepts/concepts.css";

// Newsreader (Production Type, SIL Open Font License), upright only, self-hosted by next/font at build time.
const serif = Newsreader({ subsets: ["latin"], style: ["normal"], axes: ["opsz"], variable: "--font-news", display: "swap" });

// Layout concept 3 for the client's review (2026-11-07). Not linked from the homepage and kept out of search engines.
export const metadata: Metadata = {
  title: "Konzept 3: Papier | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptDrei() {
  return <PaperConcept fontClass={serif.variable} />;
}
