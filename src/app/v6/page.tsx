import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import { WarpConcept } from "@/components/concepts/warp/warp";
import "@/components/concepts/concepts.css";

// Unbounded, Geist and Geist Mono (all SIL Open Font License), self-hosted by next/font at build time.
const display = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

// Version v6 (layout concept 5) for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v6: Warp | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptFuenf() {
  return <WarpConcept fontClass={`${display.variable} ${body.variable} ${mono.variable}`} />;
}
