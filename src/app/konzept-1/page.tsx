import type { Metadata } from "next";
import { ChaptersConcept } from "@/components/concepts/chapters/chapters";
import "@/components/concepts/concepts.css";

// Layout concept 1 for the client's review (2026-11-07). Not linked from the homepage and kept out of search engines.
export const metadata: Metadata = {
  title: "Konzept 1: Kapitel | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptEins() {
  return <ChaptersConcept />;
}
