import "server-only";
import type { Metadata } from "next";
import { getPageSeo, getSite } from "./cms";
import { pageKeys, type PageKey } from "./taxonomy";

type Defaults = { title?: string; description?: string };

/**
 * Page metadata from the CMS "Search & sharing (SEO)" settings, falling back to
 * the page's built-in defaults and then the site-wide description/share image.
 */
export async function pageMetadata(page: PageKey, defaults: Defaults = {}): Promise<Metadata> {
  const [seo, site] = await Promise.all([getPageSeo(page), getSite()]);
  const path = pageKeys.find((p) => p.key === page)?.path ?? "/";
  const title = seo.title || defaults.title;
  const description = seo.description || defaults.description || site.description;
  const image = seo.image ?? site.defaultShareImage;
  const images = image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] : undefined;

  return {
    // The home page uses the full site title; other pages get "<title> | Transition VC".
    title: page === "home" ? { absolute: title || site.title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: title || site.title, description, url: path, images },
    twitter: { card: "summary_large_image", title: title || site.title, description, images: images?.map((i) => i.url) },
  };
}
