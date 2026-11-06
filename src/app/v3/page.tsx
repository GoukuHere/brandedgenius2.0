import type { Metadata } from "next";
import { ThreadConcept } from "@/components/concepts/thread/thread";
import "@/components/concepts/concepts.css";

// Version v3 (layout concept 2) for the client's review (2026-11-07). Reached from the version switcher on every page; kept out of search engines.
export const metadata: Metadata = {
  title: "v3: Der blaue Faden | Branded Genius",
  robots: { index: false, follow: false },
};

export default function KonzeptZwei() {
  return <ThreadConcept />;
}
