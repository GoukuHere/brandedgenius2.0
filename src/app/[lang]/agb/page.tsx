import { LegalRoute, legalMetadata } from "@/components/pages/wp/routes";

// brandedgenius.de/agb/: the client's legal text, word for word from his WordPress site (2026-11-24).
export const generateMetadata = () => legalMetadata("agb");

export default function AgbPage() {
  return <LegalRoute page="agb" />;
}
