// Extracts India's official boundary from Natural Earth's "India point of view"
// countries file and saves a compact copy to data/india-official.geojson.
//
//   node scripts/extract-india.mjs path/to/ne_10m_admin_0_countries_ind.geojson
//
// Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries_ind.geojson
// (Natural Earth, public domain). Maps published in India must show the official
// boundary, so the output is checked against places that only the official map
// includes — the script refuses to write a de facto outline.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { assertOfficialIndia } from "./india-check.mjs";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/extract-india.mjs <ne_10m_admin_0_countries_ind.geojson>");
  process.exit(1);
}

const collection = JSON.parse(readFileSync(input, "utf8"));
const isIndia = (p = {}) => p.ADM0_A3 === "IND" || p.ISO_A3 === "IND" || p.SOV_A3 === "IND" || p.NAME === "India";
const india = collection.features?.find((f) => isIndia(f.properties));
if (!india) throw new Error("No India feature found in the file.");

// Round to ~1 km and drop repeated points: plenty for a globe, and keeps the file small.
const round = (n) => Math.round(n * 100) / 100;
const ring = (coords) =>
  coords
    .map(([x, y]) => [round(x), round(y)])
    .filter((p, i, arr) => i === 0 || p[0] !== arr[i - 1][0] || p[1] !== arr[i - 1][1]);
const polygons = india.geometry.type === "Polygon" ? [india.geometry.coordinates] : india.geometry.coordinates;
const geometry = {
  type: "MultiPolygon",
  coordinates: polygons.map((poly) => poly.map(ring)).filter((poly) => poly[0].length >= 4),
};

const output = {
  type: "Feature",
  properties: {
    name: "India",
    source: "Natural Earth ne_10m_admin_0_countries_ind (India point of view), public domain",
  },
  geometry,
};

assertOfficialIndia(output);

mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
const outPath = new URL("../data/india-official.geojson", import.meta.url);
writeFileSync(outPath, JSON.stringify(output));
console.log(`Wrote data/india-official.geojson (${(JSON.stringify(output).length / 1024).toFixed(0)} KB, ${geometry.coordinates.length} polygons)`);
