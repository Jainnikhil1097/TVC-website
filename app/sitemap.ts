import type { MetadataRoute } from "next";
import { nav, siteIdentity as site } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", ...nav.map((n) => n.href)];
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
