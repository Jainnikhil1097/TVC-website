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
// Also writes fallback.svg: a static line-art globe centred on India, used as the
// instant poster and as the no-WebGL / reduced-motion fallback.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains, geoBounds, geoCentroid, geoOrthographic, geoPath, geoGraticule10 } from "d3-geo";
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
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
<defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#1a2330"/><stop offset="1" stop-color="#0a0e14"/></radialGradient></defs>
<circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2 - 2}" fill="url(#g)" stroke="#0ed5c2" stroke-opacity=".35" stroke-width="1.5"/>
<path d="${d(geoGraticule10())}" fill="none" stroke="#fff" stroke-opacity=".06" stroke-width=".8"/>
<path d="${d(land110)}" fill="#fff" fill-opacity=".07" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>
<path d="${d(indiaSvg)}" fill="#0ed5c2" fill-opacity=".22" stroke="#0ed5c2" stroke-opacity=".8" stroke-width="1"/>
</svg>`;
writeFileSync(new URL("fallback.svg", outDir), svg);
console.log(`fallback.svg: ${(svg.length / 1024).toFixed(1)} KB`);
