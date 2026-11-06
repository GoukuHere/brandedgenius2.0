import type { Metadata } from "next";
import { ChaptersConcept } from "@/components/concepts/chapters/chapters";
import "@/components/concepts/concepts.css";

// Version v2 (layout concept 1) for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v2: Kapitel | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptEins() {
  return <ChaptersConcept />;
}
