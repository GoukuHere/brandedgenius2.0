import { LegalRoute, legalMetadata } from "@/components/pages/wp/routes";

// brandedgenius.de/datenschutzerklarung/: the client's legal text, word for word from his WordPress site (2026-11-24).
export const generateMetadata = () => legalMetadata("datenschutzerklarung");

export default function DatenschutzPage() {
  return <LegalRoute page="datenschutzerklarung" />;
}
