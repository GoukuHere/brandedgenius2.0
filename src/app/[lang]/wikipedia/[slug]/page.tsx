import { PostRoute, postMetadata, postParams } from "@/components/pages/wp/routes";

type Props = { params: Promise<{ slug: string }> };

// brandedgenius.de/wikipedia/<slug>/: one of the client's 92 glossary entries, at its old address (2026-11-24).
export function generateStaticParams({ params }: { params: { lang: string } }) {
  return postParams("wikipedia", params.lang);
}

export const generateMetadata = ({ params }: Props) => postMetadata("wikipedia", params);

export default function GlossaryEntryPage({ params }: Props) {
  return <PostRoute cat="wikipedia" params={params} />;
}
