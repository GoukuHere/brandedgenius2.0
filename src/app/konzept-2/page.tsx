import type { Metadata } from "next";
import { ThreadConcept } from "@/components/concepts/thread/thread";
import "@/components/concepts/concepts.css";

// Layout concept 2 for the client's review (2026-11-07). Not linked from the homepage and kept out of search engines.
export const metadata: Metadata = {
  title: "Konzept 2: Der blaue Faden | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptZwei() {
  return <ThreadConcept />;
}
