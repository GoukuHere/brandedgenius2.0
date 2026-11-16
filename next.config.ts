import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 85 for the content photos: the dark scenes band at the default 75.
  images: { qualities: [75, 85] },
  partialPrefetching: true,
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
    ];
  },
};

export default nextConfig;
