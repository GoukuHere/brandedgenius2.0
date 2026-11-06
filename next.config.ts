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
  // The versions are v1 (the homepage) to v7. The layout concepts first lived at /konzept-1 to /konzept-6; those
  // addresses (and /v1) keep working.
  async redirects() {
    return [
      { source: "/v1", destination: "/", permanent: false },
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ source: `/konzept-${n}`, destination: `/v${n + 1}`, permanent: false })),
    ];
  },
};

export default nextConfig;
