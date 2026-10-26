import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // drei's <Html> renders each device screen in its own React root; StrictMode's development-only
  // double effects tear that root down mid-mount and leave the screen blank. Production is unaffected.
  reactStrictMode: false,
  // no dev badge over the page in reviews
  devIndicators: false,
  partialPrefetching: true,
  // ~8KB gzipped of CSS per page: inlining it removes the render-blocking stylesheet requests
  // for first-time visitors (most arrive from ads), which is where mobile LCP was going.
  experimental: { inlineCss: true },
  images: { formats: ["image/avif", "image/webp"] },
  // The live demos are plain built sites in public/demos/<slug>/. Next serves files,
  // not folder index pages, so point the folder URLs at their index.html.
  async rewrites() {
    return [
      { source: "/demos/:slug", destination: "/demos/:slug/index.html" },
      { source: "/demos/:slug/", destination: "/demos/:slug/index.html" },
    ];
  },
};

export default nextConfig;
