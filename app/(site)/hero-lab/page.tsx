import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/cms";
import { SketchLab } from "@/components/home/sketch/SketchLab";

// TEMPORARY: the real home hero with each mechanical blueprint sketch behind it, for
// choosing one. Development only (404 in production builds). Delete this route and
// components/home/sketch/SketchLab.tsx once a sketch is picked.

export const metadata: Metadata = { title: "Hero lab", robots: { index: false, follow: false } };

export default async function HeroLabPage({ searchParams }: { searchParams: Promise<{ v?: string; run?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  const site = await getSite();
  const v = Number(params.v);
  return (
    <SketchLab
      tagline={site.tagline}
      intro={site.hero}
      initial={Number.isInteger(v) && v >= 1 ? v - 1 : 0}
      initialRunOnly={params.run === "1"}
    />
  );
}
