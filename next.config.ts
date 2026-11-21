import type { NextConfig } from "next";

/* The page folders under app/[lang], and the English address of each one whose name is German (i18n/config.ts). */
const DE_PAGES = ["leistungen", "use-cases", "ki-workshop", "uber-uns", "kontakt"];
const EN_SLUGS: Record<string, string> = { services: "leistungen", "ai-workshop": "ki-workshop", about: "uber-uns", contact: "kontakt" };

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 85 for the content photos: the dark scenes band at the default 75.
  images: { qualities: [75, 85] },
  partialPrefetching: true,
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
  // 2026-11-16: v11 became the only version (the homepage). Every earlier version address, and the old layout-concept
  // addresses, lead to it, so no link the client saved breaks. The versions themselves live on in the git tag
  // versions-archive-2026-11-16.
  async redirects() {
    return [
      ...Array.from({ length: 11 }, (_, i) => ({ source: `/v${i + 1}`, destination: "/", permanent: false })),
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ source: `/konzept-${n}`, destination: "/", permanent: false })),
      // Round 5 (DE/EN): German has no prefix, so /de/... leads to the plain address; an English page under its
      // German folder name leads to its English address. One address per page and language.
      { source: "/de", destination: "/", permanent: false },
      { source: `/de/:page(${DE_PAGES.join("|")})`, destination: "/:page", permanent: false },
      ...Object.entries(EN_SLUGS).map(([en, folder]) => ({ source: `/en/${folder}`, destination: `/en/${en}`, permanent: false })),
    ];
  },
  // Round 5 (DE/EN): the pages live in app/[lang]. The German addresses are served from /de/..., the English slugs
  // from the German folder names. Before the file system, so these always win.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/de" },
        { source: `/:page(${DE_PAGES.join("|")})`, destination: "/de/:page" },
        ...Object.entries(EN_SLUGS).map(([en, folder]) => ({ source: `/en/${en}`, destination: `/en/${folder}` })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
