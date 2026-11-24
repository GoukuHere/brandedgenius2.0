import { PostRoute, postMetadata, postParams } from "@/components/pages/wp/routes";

type Props = { params: Promise<{ slug: string }> };

// brandedgenius.de/uncategorized/<slug>/: one of the client's 49 blog articles, at its old address (2026-11-24).
export function generateStaticParams({ params }: { params: { lang: string } }) {
  return postParams("uncategorized", params.lang);
}

export const generateMetadata = ({ params }: Props) => postMetadata("uncategorized", params);

export default function BlogPostPage({ params }: Props) {
  return <PostRoute cat="uncategorized" params={params} />;
}
