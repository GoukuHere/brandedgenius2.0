import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/*
  /robots.txt (2026-11-24): the old site's rules, kept. Every crawler may read every page, the AI assistants' crawlers
  named as before, and the sitemap is at the live domain. (The vercel.app preview is kept out of the index by its
  X-Robots-Tag header, not here: a crawler must be able to read a page to see that it is not to be indexed.)
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "anthropic-ai", "Google-Extended"], allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
