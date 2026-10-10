import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin tracing to this project (a stray lockfile in a parent folder confuses detection).
  outputFileTracingRoot: process.cwd(),
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

export default withPayload(nextConfig, { devBundleServerPackages: false });
