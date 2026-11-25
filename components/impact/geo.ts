// Shared geography for the Impact page's footprint (map, globe and the summary card).
// data/impact-geo.json is built by scripts/build-impact-geo.mjs: world land with no
// country borders, plus the outlines that can be highlighted, India always official.
import type { GeoPermissibleObjects } from "d3-geo";
import geo from "@/data/impact-geo.json";

export type Presence = "hq" | "manufacturing" | "deployments";

export type FootprintCountry = {
  name: string;
  lat: number;
  lon: number;
  presence: Presence[];
  companies: string[];
  value: string;
  valueLabel: string;
  detail: string;
  source: string;
};

export const presenceLabels: Record<Presence, string> = {
  hq: "HQ & offices",
  manufacturing: "Manufacturing & R&D",
  deployments: "Deployments & pilots",
};

/** What a country's presence is called in its detail panel. */
export const presenceHeadline = (p: Presence[]) =>
  p.length > 1 ? "Headquarters, facilities and deployments" : p[0] === "hq" ? "Headquarters and offices" : p[0] === "manufacturing" ? "Manufacturing and R&D" : "Operating deployment";

type Geometry = { type: "MultiPolygon"; coordinates: number[][][][] };

export const land = { type: "Feature", properties: {}, geometry: geo.land as Geometry } as unknown as GeoPermissibleObjects;

/** Outline for a country listed in the CMS, if we have one (tiny countries are marker-only). */
export function outline(name: string): GeoPermissibleObjects | undefined {
  const g = (geo.countries as Record<string, Geometry | undefined>)[name];
  return g ? ({ type: "Feature", properties: {}, geometry: g } as unknown as GeoPermissibleObjects) : undefined;
}
