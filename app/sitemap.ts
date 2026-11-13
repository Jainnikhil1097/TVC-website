import type { MetadataRoute } from "next";
import { footerLinks, nav, siteIdentity as site } from "@/lib/site-config";

// Generated once at build time (also required for the static preview).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", ...[...nav, ...footerLinks].map((n) => n.href)];
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
