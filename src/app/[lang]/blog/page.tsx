import { ListRoute, listMetadata } from "@/components/pages/wp/routes";

// brandedgenius.de/blog/: the client's blog articles, newest first (from his WordPress site, 2026-11-24).
export const generateMetadata = () => listMetadata("blog");

export default function BlogPage() {
  return <ListRoute list="blog" />;
}
