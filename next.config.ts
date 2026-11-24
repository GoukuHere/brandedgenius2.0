import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

/* The page folders under app/[lang], and the English address of each one whose name is German (i18n/config.ts). */
const DE_PAGES = ["leistungen", "use-cases", "ki-workshop", "uber-uns", "kontakt"];
// 2026-11-24: the client's WordPress pages, German only, at their old addresses (src/content/wp).
const WP_PAGES = ["blog", "wikipedia", "impressum", "datenschutzerklarung", "agb"];
const GERMAN = [...DE_PAGES, ...WP_PAGES].join("|");
const EN_SLUGS: Record<string, string> = { services: "leistungen", "ai-workshop": "ki-workshop", about: "uber-uns", contact: "kontakt" };

/*
  2026-11-24: every old address the new site does not serve itself, to its successor (src/content/wp/redirects.json,
  469 permanent redirects): WordPress's category, pagination, feed, attachment and author addresses, its two empty
  pages and its sitemaps, and the earlier Framer site's posts (to the same article where WordPress kept it) and pages
  (to the closest page by topic).
*/
const OLD_ADDRESSES: { source: string; destination: string; permanent: boolean }[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/wp/redirects.json"), "utf8")
).map(({ source, destination, permanent }: { source: string; destination: string; permanent: boolean }) => ({ source, destination, permanent }));

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 85 for the content photos: the dark scenes band at the default 75.
  images: { qualities: [75, 85] },
  partialPrefetching: true,
  // 2026-11-24 (the move from the client's WordPress site): every address ends in a slash, as his site served them,
  // so each old address is the very same address here and his rankings and links carry over without a redirect.
  trailingSlash: true,
  // Round 5 (DE/EN): the root layout sits in app/[lang], so unknown addresses get app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // 2026-11-24: the preview on vercel.app stays out of search engines (only brandedgenius.de is to be indexed; the
  // pages themselves say index, and their canonicals point at the live domain).
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<preview>.+)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // 2026-11-16: v11 became the only version (the homepage). Every earlier version address, and the old layout-concept
  // addresses, lead to it, so no link the client saved breaks. The versions themselves live on in the git tag
  // versions-archive-2026-11-16. (With the trailing slash, every source ends in one.)
  async redirects() {
    return [
      ...Array.from({ length: 11 }, (_, i) => ({ source: `/v${i + 1}/`, destination: "/", permanent: false })),
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ source: `/konzept-${n}/`, destination: "/", permanent: false })),
      // Round 5 (DE/EN): German has no prefix, so /de/... leads to the plain address; an English page under its
      // German folder name leads to its English address. One address per page and language.
      { source: "/de/", destination: "/", permanent: false },
      { source: `/de/:page(${GERMAN})/`, destination: "/:page/", permanent: false },
      { source: "/de/:cat(uncategorized|wikipedia)/:slug/", destination: "/:cat/:slug/", permanent: false },
      ...Object.entries(EN_SLUGS).map(([en, folder]) => ({ source: `/en/${folder}/`, destination: `/en/${en}/`, permanent: false })),
      ...OLD_ADDRESSES,
    ];
  },
  // Round 5 (DE/EN): the pages live in app/[lang]. The German addresses are served from /de/..., the English slugs
  // from the German folder names. Before the file system, so these always win.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/de" },
        { source: `/:page(${GERMAN})/`, destination: "/de/:page/" },
        // 2026-11-24: the client's posts at their old addresses.
        { source: "/:cat(uncategorized|wikipedia)/:slug/", destination: "/de/:cat/:slug/" },
        ...Object.entries(EN_SLUGS).map(([en, folder]) => ({ source: `/en/${en}/`, destination: `/en/${folder}/` })),
        // Any other one-segment address would be taken for a language by app/[lang] and end in a blank error page:
        // send it to an address no route matches, so app/global-not-found.tsx answers with its 404. (The languages
        // are told apart by the slash after them now: every address ends in one.)
        { source: "/:slug((?!(?:de|en)/)[^/.]+)/", destination: "/404/not-found" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
