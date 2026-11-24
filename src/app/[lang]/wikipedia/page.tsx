import { ListRoute, listMetadata } from "@/components/pages/wp/routes";

// brandedgenius.de/wikipedia/: the client's KI-Glossar, A to Z (from his WordPress site, 2026-11-24).
export const generateMetadata = () => listMetadata("wikipedia");

export default function WikipediaPage() {
  return <ListRoute list="wikipedia" />;
}
