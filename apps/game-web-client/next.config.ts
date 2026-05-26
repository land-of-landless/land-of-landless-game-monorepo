import type { NextConfig } from "next";
import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Using `git rev-parse HEAD` might not the most efficient
// way of determining a revision. You may prefer to use
// the hashes of every extra file you precache.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "web-workers/sw.ts",
  swDest: "public/sw.js",
  maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // Set the limit to 50 MB
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

/** @type {import("next").NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Disables generation of source maps for client bundles in production.
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer }) => {
    // Add a rule to handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a|flac)$/i, // Target common audio formats
      type: "asset/resource", // Use Webpack 5's built-in asset module
      generator: {
        // Output files to the 'static/media' folder with a content hash in the name
        filename: "static/media/[name].[hash][ext]",
      },
    });

    return config;
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(withSerwist(nextConfig));
