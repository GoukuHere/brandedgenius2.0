import type { Metadata } from "next";
import { Hubot_Sans } from "next/font/google";
import { ObsidianConcept } from "@/components/concepts/obsidian/obsidian";
import "@/components/concepts/obsidian/obsidian.css";

// Hubot Sans (SIL Open Font License) with its width axis, self-hosted by next/font at build time.
const display = Hubot_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-hubot", display: "swap" });

// Version v9 for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v9: Obsidian | Branded Genius",
  robots: { index: false, follow: false },
};

export default function VersionNeun() {
  return <ObsidianConcept fontClass={display.variable} />;
}
