import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/cms";
import { isHiddenPreview } from "@/lib/base-path";
import { SketchLab } from "@/components/home/sketch/SketchLab";

// TEMPORARY: the real home hero with each mechanical blueprint sketch behind it, for
// choosing one. Available in development and on the GitHub Pages preview (which is
// hidden from search engines); a 404 on the real production site. Delete this route
// and components/home/sketch/SketchLab.tsx once a sketch is picked.

export const metadata: Metadata = { title: "Hero lab", robots: { index: false, follow: false } };

export default async function HeroLabPage() {
  if (process.env.NODE_ENV === "production" && !isHiddenPreview) notFound();
  const site = await getSite();
  // Static (no search params on the server), so the GitHub Pages export can include it;
  // the lab reads ?v= and ?run= in the browser.
  return <SketchLab tagline={site.tagline} intro={site.hero} />;
}
