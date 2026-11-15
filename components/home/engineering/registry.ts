/*
 * Which hardware the home hero draws, in order, and which portfolio company (CMS
 * slug, first match wins) each one represents. Kept free of three.js so the page and
 * hero can use it without loading the 3D code. Geometry lives in ./models.ts.
 */
export const HERO_MODELS = [
  { key: "motor", slugs: ["matel-motion"] },
  { key: "battery", slugs: ["emo-energy"] },
  { key: "electrolyser", slugs: ["hydgen"] },
  { key: "drone", slugs: ["suind", "zerodrag"] },
] as const;

export type ModelKey = (typeof HERO_MODELS)[number]["key"];
