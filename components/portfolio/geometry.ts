// Deterministic geometry for the portfolio "site plan" map.
// Everything is computed from zone index + company index (no randomness),
// so server and client render identical markup. Pure: built from whatever
// companies the CMS returns (see buildLayout).
import type { Company, PortfolioSectorId, Stage } from "@/lib/types";
import { portfolioSectors } from "@/lib/taxonomy";

/** Ground-plane size of one sector plot, the road between plots, and plots per row. */
export const PLOT = 240;
export const GAP = 56;
export const COLS = 4;
/** Half-width of a company's tower footprint. */
export const TOWER = 15;

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

export type Pt = { x: number; y: number };

/** Isometric projection of ground coords (u, v) at height h. */
export const iso = (u: number, v: number, h = 0): Pt => ({ x: (u - v) * COS, y: (u + v) * SIN - h });

/** SVG matrix that maps ground-plane coords onto the screen (for text painted on the ground). */
export const GROUND_MATRIX = `matrix(${COS} ${SIN} ${-COS} ${SIN} 0 0)`;

/** Tower height encodes stage — the map doubles as a data visualisation. */
export const stageHeight: Record<Stage, number> = {
  "Pre-Seed": 34,
  Seed: 60,
  TBD: 48,
  "Pre-Series A": 88,
  "Series A": 118,
};

export const stageLegend: Stage[] = ["Pre-Seed", "Seed", "Pre-Series A", "Series A"];

export type Zone = {
  id: PortfolioSectorId;
  name: string;
  u: number;
  v: number;
};

/** The boards beside the main site plan, one per fund other than Fund I. */
export type DistrictId = "pre-fund" | "fund-2";

export type District = {
  id: DistrictId;
  name: string;
  /** Ground rectangle: u/v origin, width along u, depth along v. */
  u: number;
  v: number;
  w: number;
  d: number;
  /** Lots the board is divided into (Fund II is laid out as plots still to be built). */
  lots: number;
};

export type Pin = {
  company: Company;
  /** Sector plot or fund board the tower stands on. */
  zone: PortfolioSectorId | DistrictId;
  u: number;
  v: number;
  h: number;
  /** Leader-line length, set so callouts land on staggered tiers (see labelTier). */
  leader: number;
};

const zones: Zone[] = portfolioSectors.map((s, i) => ({
  id: s.id,
  name: s.name,
  u: (i % COLS) * (PLOT + GAP),
  v: Math.floor(i / COLS) * (PLOT + GAP),
}));

/** Slot offsets along the plot's viewing diagonal, so towers spread left-to-right on screen. */
function slots(n: number): { u: number; v: number }[] {
  const base = n >= 4 ? 54 : n === 3 ? 62 : 48;
  // Plots with many companies squeeze spacing so towers stay inside the plot.
  const spacing = n > 1 ? Math.min(base, 180 / (n - 1)) : base;
  const cu = PLOT / 2;
  const cv = PLOT / 2 - 10;
  return Array.from({ length: n }, (_, i) => {
    const t = (i - (n - 1) / 2) * spacing;
    return { u: cu + t, v: cv - t };
  });
}

/**
 * Which of the stacked label tiers a company's callout sits on. Four-company
 * plots get one tier each; front-row three-company plots run their tiers in
 * reverse so they interleave with the plot behind them. Tuned so no two
 * callouts overlap from 900px to 1400px of map width (up to 4 per sector;
 * beyond that tiers repeat).
 */
function labelTier(i: number, n: number, frontRow: boolean) {
  if (n >= 4) return i % 4;
  return frontRow && n === 3 ? 2 - i : i % 3;
}

const groundW = COLS * PLOT + (COLS - 1) * GAP;
const groundH = Math.ceil(zones.length / COLS) * PLOT + (Math.ceil(zones.length / COLS) - 1) * GAP;

/**
 * "Like we are building the city": Fund I is the main site; the Pre-Fund companies sit
 * on their own plot across the road on the front-right, and Fund II is a long board
 * of lots along the front-left, still under construction until its companies arrive.
 */
export const districts: District[] = [
  { id: "pre-fund", name: "Pre Fund", u: groundW + GAP, v: PLOT + GAP, w: PLOT, d: PLOT, lots: 1 },
  { id: "fund-2", name: "Fund II", u: 0, v: groundH + GAP, w: groundW, d: 180, lots: COLS },
];
const districtFor = (c: Company) => districts.find((d) => d.id === c.fund);

/** Approximate label width in viewBox units, reserved to the right of each leader tip. */
const LABEL_ROOM = 230;

export type ViewBox = { x: number; y: number; w: number; h: number };

export type MapLayout = {
  zones: Zone[];
  districts: (District & { companies: number })[];
  /** Painter's order: back-to-front so nearer towers overlap farther ones. */
  pinsByDepth: Pin[];
  ground: { w: number; h: number };
  viewBox: ViewBox;
};

/**
 * Lay out the given companies on the 8 sector plots. Companies are deliberately not
 * numbered anywhere: every portfolio company is presented as an equal.
 */
export function buildLayout(companies: Company[]): MapLayout {
  const onDistrict = (c: Company) => Boolean(districtFor(c));
  // Fund I companies stand on their sector's plot; the others on their fund's board
  // (placed like a plot, in the board's first lot).
  const areas: { id: Pin["zone"]; u: number; v: number; front: boolean; members: Company[] }[] = [
    ...zones.map((z) => ({ id: z.id, u: z.u, v: z.v, front: z.v > 0, members: companies.filter((c) => !onDistrict(c) && c.sector === z.id) })),
    ...districts.map((d) => ({ id: d.id, u: d.u, v: d.v, front: true, members: companies.filter((c) => c.fund === d.id) })),
  ];
  const pins: Pin[] = areas.flatMap((zone) => {
    const inZone = zone.members;
    if (!inZone.length) return [];
    const offsets = slots(inZone.length);
    // Label tips sit on fixed tiers above the zone's tallest tower, so labels
    // stagger cleanly whatever each tower's height.
    const tallest = Math.max(...inZone.map((c) => stageHeight[c.stage]));
    return inZone.map((company, i) => {
      const h = stageHeight[company.stage];
      return {
        company,
        zone: zone.id,
        u: zone.u + offsets[i].u,
        v: zone.v + offsets[i].v,
        h,
        leader: tallest - h + 34 + labelTier(i, inZone.length, zone.front) * 52,
      };
    });
  });

  // Fit the viewBox around the ground plus tower/label headroom.
  const pts: Pt[] = [iso(0, 0), iso(groundW, 0), iso(groundW, groundH), iso(0, groundH)];
  for (const d of districts) pts.push(iso(d.u, d.v), iso(d.u + d.w, d.v), iso(d.u + d.w, d.v + d.d), iso(d.u, d.v + d.d), iso(d.u + d.w * 0.3, d.v + d.d * 0.5, 150));
  for (const p of pins) {
    const tip = iso(p.u, p.v, p.h + p.leader + 44);
    // Labels extend to the right of their leader tip.
    pts.push(tip, { x: tip.x + LABEL_ROOM, y: tip.y });
  }
  const margin = 36;
  const minX = Math.min(...pts.map((p) => p.x)) - margin;
  const maxX = Math.max(...pts.map((p) => p.x)) + margin;
  const minY = Math.min(...pts.map((p) => p.y)) - margin;
  const maxY = Math.max(...pts.map((p) => p.y)) + margin;

  return {
    zones,
    districts: districts.map((d) => ({ ...d, companies: companies.filter((c) => c.fund === d.id).length })),
    pinsByDepth: [...pins].sort((a, b) => a.u + a.v - (b.u + b.v)),
    ground: { w: groundW, h: groundH },
    viewBox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
  };
}

export const toPercent = (p: Pt, viewBox: ViewBox) => ({
  left: `${((p.x - viewBox.x) / viewBox.w) * 100}%`,
  top: `${((p.y - viewBox.y) / viewBox.h) * 100}%`,
});

export const poly = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
