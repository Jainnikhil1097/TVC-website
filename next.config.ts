import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

// `npm run build:pages` sets STATIC_EXPORT=1 to save the site as plain HTML files
// for the GitHub Pages preview (see scripts/build-pages.mjs). The normal build is
// unaffected.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin tracing to this project (a stray lockfile in a parent folder confuses detection).
  outputFileTracingRoot: process.cwd(),
  // Careers was removed; send old links somewhere useful instead of a 404.
  async redirects() {
    return [{ source: "/careers", destination: "/contact", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // CMS uploads are served from Vercel Blob in production.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // One 404 page for the whole app, since the site and the admin have separate root layouts.
    globalNotFound: true,
    // Tree-shake icon and 3D helper barrels so pages only ship what they import.
    optimizePackageImports: ["lucide-react", "@react-three/drei"],
  },
};

const config = withPayload(nextConfig, { devBundleServerPackages: false });

if (staticExport) {
  config.output = "export";
  config.basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;
  // Folders with index.html (/about/), which GitHub Pages serves directly.
  config.trailingSlash = true;
  // No server to resize images; they're used as uploaded.
  config.images = { ...config.images, unoptimized: true };
  // Redirects and headers need a server, so they're dropped from the static files.
  delete config.redirects;
  delete config.headers;
}

export default config;
