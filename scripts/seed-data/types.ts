// Shapes of the original hand-written content, used only by scripts/seed.ts.
export type Link = { label: string; href: string };
export type Metric = { value: string; label: string; note?: string };
export type Person = {
  name: string; title?: string; linkedin?: string; bio?: string; highlights?: string[];
  /** The bio this one replaces: the import only swaps a bio that is still this text (never an editor's). */
  previousBio?: string;
  /** Founders' logo strips, in order: files in seed-data/team-logos/, optional heading above each. */
  logoRows?: { heading?: string; file: string }[];
};
export type PortfolioSectorId =
  | "drone" | "industrial" | "platforms" | "utility-grid" | "renewables" | "hydrogen" | "mobility" | "data-centers";
export type Stage = "Pre-Seed" | "Seed" | "Pre-Series A" | "Series A" | "TBD";
export type Company = {
  slug: string; name: string; summary: string; sector: PortfolioSectorId; stage: Stage;
  yearInvested: number; website: string; founders?: Person[]; essay?: string;
  /** Defaults to Fund I. */
  fund?: "pre-fund" | "fund-1" | "fund-2";
};
export type Fund = { name: string; category: string; sebiRegistration: string; manager: string };
export type Essay = { slug: string; title: string; teaser: string; url?: string; company?: string };
export type NewsItem = { date: string; title: string; source: string; url: string };
export type Role = { title: string; function: string; experience: string; location: string; applyUrl?: string };
