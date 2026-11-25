// Builds data/impact-geo.json for the Impact page's footprint map and globe:
//   - world land (world-atlas land-110m), with no country borders, so no disputed
//     boundary is ever drawn,
//   - outlines for the countries that can be highlighted, with India always taken from
//     the official boundary (data/india-official.geojson; see README "India's boundary
//     on maps"), never from world-atlas,
//   - coordinates rounded to 0.1° (~10 km): plenty at this size, and small to ship.
//
//   node scripts/build-impact-geo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { assertOfficialIndia } from "./india-check.mjs";

const require = createRequire(import.meta.url);
const land = require("world-atlas/land-110m.json");
const countries = require("world-atlas/countries-110m.json");

const r = (n) => Math.round(n * 10) / 10;
/** Rounds to 0.1° and drops points closer than `step` degrees to the last kept one (keeps the ring closed). */
const ring = (coords, step) => {
  const out = [];
  for (const [x, y] of coords) {
    const p = [r(x), r(y)];
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= step) out.push(p);
  }
  const first = out[0];
  const end = out[out.length - 1];
  if (first && (first[0] !== end[0] || first[1] !== end[1])) out.push([...first]);
  return out.length >= 4 ? out : null;
};
const compact = (geometry, step) => {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const coordinates = polys.map((p) => p.map((c) => ring(c, step)).filter(Boolean)).filter((p) => p.length);
  return { type: "MultiPolygon", coordinates };
};

const india = JSON.parse(readFileSync("data/india-official.geojson", "utf8"));
assertOfficialIndia(india);

// Countries the CMS can list on the footprint map (names as world-atlas spells them).
const NAMES = {
  "United States": "United States of America",
  Netherlands: "Netherlands",
  Switzerland: "Switzerland",
  "Sri Lanka": "Sri Lanka",
  Oman: "Oman",
  Australia: "Australia",
  "United Kingdom": "United Kingdom",
  Germany: "Germany",
  "United Arab Emirates": "United Arab Emirates",
  Japan: "Japan",
  Indonesia: "Indonesia",
  Kenya: "Kenya",
  Bangladesh: "Bangladesh",
  Nepal: "Nepal",
  Vietnam: "Vietnam",
  France: "France",
  Canada: "Canada",
};
const all = feature(countries, countries.objects.countries).features;
const shapes = { India: compact(india.geometry, 0.12) };
// Thinning must never lose the official boundary's extent.
assertOfficialIndia({ type: "Feature", properties: {}, geometry: shapes.India });
for (const [label, name] of Object.entries(NAMES)) {
  const f = all.find((x) => x.properties.name === name);
  if (f) shapes[label] = compact(f.geometry, 0.25);
}

// Land without Antarctica (no portfolio presence, and it only adds a sliver along the bottom).
const world = compact(feature(land, land.objects.land).features[0].geometry, 1.0);
world.coordinates = world.coordinates.filter((poly) => Math.max(...poly[0].map(([, y]) => y)) > -60);
const out = { land: world, countries: shapes };
writeFileSync("data/impact-geo.json", JSON.stringify(out));
console.log(`data/impact-geo.json: ${(JSON.stringify(out).length / 1024).toFixed(0)} KB, ${Object.keys(shapes).length} country outlines`);
