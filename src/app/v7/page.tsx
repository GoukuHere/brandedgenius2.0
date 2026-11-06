import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { SystemConcept } from "@/components/concepts/system/system";
import "@/components/concepts/concepts.css";

// Sora and Geist Mono (both SIL Open Font License), self-hosted by next/font at build time.
const display = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

// Version v7 (layout concept 6) for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v7: System | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptSechs() {
  return <SystemConcept fontClass={`${display.variable} ${mono.variable}`} />;
}
