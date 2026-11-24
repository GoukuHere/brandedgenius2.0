import { LegalRoute, legalMetadata } from "@/components/pages/wp/routes";

// brandedgenius.de/impressum/: the client's legal text, word for word from his WordPress site (2026-11-24).
export const generateMetadata = () => legalMetadata("impressum");

export default function ImpressumPage() {
  return <LegalRoute page="impressum" />;
}
