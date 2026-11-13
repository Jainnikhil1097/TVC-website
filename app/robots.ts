import type { MetadataRoute } from "next";
import { siteIdentity as site } from "@/lib/site-config";
import { isStaticPreview } from "@/lib/base-path";

// Generated once at build time (also required for the static preview).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // The GitHub Pages preview stays out of search results.
  if (isStaticPreview) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
