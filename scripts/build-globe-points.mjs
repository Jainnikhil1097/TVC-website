// Generates the dot-matrix globe data used by the home hero.
//
//   node scripts/build-globe-points.mjs
//
// Samples points evenly over the sphere (Fibonacci lattice), keeps those on land
// (Natural Earth via world-atlas, public domain), and samples India on a denser
// grid so it can be highlighted. India uses its OFFICIAL boundary from
// data/india-official.geojson (see scripts/extract-india.mjs) — never the de facto
// outline in world-atlas — and the build fails if that file doesn't pass the check. Output is a compact binary so it stays out of
// the JS bundle:
//
//   Uint32 globeCount, Uint32 indiaCount, then Int16 pairs (lat*100, lon*100):
//   globe points first, India points after.
//
// Also writes two static posters matching the 3D globe: poster-before.svg (shown
// instantly, before WebGL loads) and fallback.svg (the finished, "transitioned"
// state, for no-WebGL / reduced-motion / save-data visitors).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains, geoBounds, geoCentroid, geoOrthographic, geoPath } from "d3-geo";
import { assertOfficialIndia } from "./india-check.mjs";

const require = createRequire(import.meta.url);
const land = feature(
  JSON.parse(readFileSync(require.resolve("world-atlas/land-50m.json"), "utf8")),
  "land"
);
const india = JSON.parse(readFileSync(new URL("../data/india-official.geojson", import.meta.url), "utf8"));
assertOfficialIndia(india);

const SAMPLES = 42000; // over the whole sphere; ~29% land
const INDIA_STEP = 0.42; // degrees

const globe = [];
const golden = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < SAMPLES; i++) {
  const y = 1 - (i / (SAMPLES - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  let lon = ((theta * 180) / Math.PI) % 360;
  if (lon > 180) lon -= 360;
  const p = [lon, lat];
  if (geoContains(land, p) && !geoContains(india, p)) globe.push([lat, lon]);
}

const indiaPts = [];
const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(india);
for (let lat = minLat; lat <= maxLat; lat += INDIA_STEP) {
  // Keep spacing roughly even in km as latitude changes.
  const step = INDIA_STEP / Math.cos((lat * Math.PI) / 180);
  for (let lon = minLon; lon <= maxLon; lon += step) {
    if (geoContains(india, [lon, lat])) indiaPts.push([lat, lon]);
  }
}

// Islands smaller than the grid spacing (Lakshadweep, much of Andaman & Nicobar)
// would otherwise get no dot — give each such island one at its centre.
for (const polygon of india.geometry.coordinates) {
  const island = { type: "Polygon", coordinates: polygon };
  const [[w, s], [e, n]] = geoBounds(island);
  const covered = indiaPts.some(([lat, lon]) => lat >= s && lat <= n && lon >= w && lon <= e && geoContains(island, [lon, lat]));
  if (!covered) {
    const [lon, lat] = geoCentroid(island);
    indiaPts.push([lat, lon]);
  }
}

const all = [...globe, ...indiaPts];
const buf = Buffer.alloc(8 + all.length * 4);
buf.writeUInt32LE(globe.length, 0);
buf.writeUInt32LE(indiaPts.length, 4);
all.forEach(([lat, lon], i) => {
  buf.writeInt16LE(Math.round(lat * 100), 8 + i * 4);
  buf.writeInt16LE(Math.round(lon * 100), 8 + i * 4 + 2);
});

const outDir = new URL("../public/globe/", import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL("points.bin", outDir), buf);
console.log(`globe: ${globe.length} points, india: ${indiaPts.length} points, ${(buf.length / 1024).toFixed(1)} KB`);

// ─── Static fallback / poster ────────────────────────────────────────────────
const land110 = feature(
  JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8")),
  "land"
);
const SIZE = 800;
const projection = geoOrthographic()
  .rotate([-80, -20])
  .scale(SIZE / 2 - 2)
  .translate([SIZE / 2, SIZE / 2])
  .precision(0.5);
const path = geoPath(projection);
// The poster is ~800px across (1° ≈ 7px), so ~0.08° detail is sub-pixel: thin the
// detailed official outline for the SVG only (the dots above use full detail).
const thin = (ring) =>
  ring
    .map(([x, y]) => [Math.round(x / 0.08) * 0.08, Math.round(y / 0.08) * 0.08])
    .filter((pt, i, arr) => i === 0 || pt[0] !== arr[i - 1][0] || pt[1] !== arr[i - 1][1]);
const indiaSvg = {
  ...india,
  geometry: {
    type: "MultiPolygon",
    coordinates: india.geometry.coordinates
      .map((poly) => poly.map(thin))
      .filter((poly) => poly[0].length >= 4),
  },
};
const r = (n) => Math.round(n * 10) / 10;
const d = (geo) => path(geo).replace(/\d+\.\d+/g, (m) => String(r(Number(m))));

// The posters match the 3D "Transition sweep" globe (components/home/GlobeCanvas.tsx):
// same view, Brand Book colours (Mist land on a navy ocean), India idle (before) or teal with its solar
// arrays and wind turbines (after). Asset placement replays the component's seeded picks.
const VIEW_LAT = 12;
const VIEW_LON = 72;
const DEG = Math.PI / 180;
projection.rotate([-VIEW_LON, -VIEW_LAT]);
const R = SIZE / 2 - 2;
const C = SIZE / 2;
const toVec = (lat, lon) => [Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lon * DEG)];
// Rotate a world vector into the view (as the component's spin + tilt groups do), then project.
const view = ([x, y, z]) => {
  const a = -VIEW_LON * DEG;
  const x1 = x * Math.cos(a) + z * Math.sin(a);
  const z1 = -x * Math.sin(a) + z * Math.cos(a);
  const b = VIEW_LAT * DEG;
  const y2 = y * Math.cos(b) - z1 * Math.sin(b);
  const z2 = y * Math.sin(b) + z1 * Math.cos(b);
  return [x1, y2, z2];
};
const screen = ([x, y]) => [C + x * R, C - y * R];

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// The component reads India's points back from points.bin (rounded to 0.01°).
const indiaVecs = indiaPts.map(([lat, lon]) => toVec(Math.round(lat * 100) / 100, Math.round(lon * 100) / 100));
const rand = mulberry32(2047);
const taken = [];
const pick = (count, minSepDeg) => {
  const out = [];
  const minDot = Math.cos(minSepDeg * DEG);
  for (let tries = 0; tries < count * 40 && out.length < count; tries++) {
    const i = Math.floor(rand() * indiaVecs.length);
    const p = indiaVecs[i];
    const lat = Math.asin(p[1]) / DEG;
    const lon = Math.atan2(p[0], p[2]) / DEG;
    const offMainland = (lat < 20 && lon > 91) || (lat < 13 && lon < 74.5);
    if (offMainland || taken.some((q) => q[0] * p[0] + q[1] * p[1] + q[2] * p[2] > minDot)) continue;
    taken.push(p);
    out.push(p);
    rand();
    rand(); // the component draws two more numbers per asset (timing, rotor phase)
  }
  return out;
};
// Same counts and spacing as TURBINES / SOLAR in GlobeCanvas.tsx (desktop).
const turbines = pick(14, 2.6);
const solar = pick(28, 1.5);

const glyph = (p, kind) => {
  const v = view(p);
  if (v[2] < 0.15) return "";
  const lift = 1.02;
  const [bx, by] = screen([v[0] * lift, v[1] * lift]);
  if (kind === "solar") {
    return `<rect x="${r(bx - 3.2)}" y="${r(by - 2)}" width="6.4" height="4" rx=".6" fill="#1c3f73" stroke="#83f4e9" stroke-opacity=".5" stroke-width=".5"/>`;
  }
  const top = view(p.map((c) => c * 1.09));
  const [tx, ty] = screen([top[0], top[1]]);
  const blades = [0, 120, 240]
    .map((deg) => {
      const a = (deg - 90 + 20) * DEG;
      return `M${r(tx)},${r(ty)}l${r(Math.cos(a) * 9)},${r(Math.sin(a) * 9)}`;
    })
    .join("");
  return `<path d="M${r(bx)},${r(by)}L${r(tx)},${r(ty)}" stroke="#f5f7fa" stroke-width="1.6" stroke-linecap="round"/><path d="${blades}" stroke="#f5f7fa" stroke-width="1.3" stroke-linecap="round"/>`;
};

const poster = (after) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
<defs>
<radialGradient id="o" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#24497c"/><stop offset=".6" stop-color="#18355f"/><stop offset="1" stop-color="#0a1e3f"/></radialGradient>
<radialGradient id="l" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#06142b" stop-opacity=".55"/></radialGradient>
<clipPath id="c"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
</defs>
<circle cx="${C}" cy="${C}" r="${R}" fill="url(#o)"/>
<g clip-path="url(#c)">
<path d="${d(land110)}" fill="#a3b2c5" stroke="#8a9bb1" stroke-width=".6"/>
<path d="${d(indiaSvg)}" fill="${after ? "#06e8d3" : "#acbacb"}" stroke="${after ? "#83f4e9" : "#8fa0b5"}" stroke-width=".8"/>
${after ? [...solar.map((p) => glyph(p, "solar")), ...turbines.map((p) => glyph(p, "turbine"))].join("\n") : ""}
<circle cx="${C}" cy="${C}" r="${R}" fill="url(#l)"/>
</g>
<circle cx="${C}" cy="${C}" r="${R - 0.5}" fill="none" stroke="#83f4e9" stroke-opacity=".25"/>
</svg>`;

for (const [name, after] of [["poster-before.svg", false], ["fallback.svg", true]]) {
  const svg = poster(after);
  writeFileSync(new URL(name, outDir), svg);
  console.log(`${name}: ${(svg.length / 1024).toFixed(1)} KB`);
}
