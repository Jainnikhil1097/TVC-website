// Guards against publishing a de facto map of India. The official boundary (as
// shown by the Survey of India) includes all of Jammu & Kashmir and Ladakh —
// Gilgit-Baltistan, PoK and Aksai Chin — and Arunachal Pradesh. De facto datasets
// (e.g. default Natural Earth / world-atlas) cut these off.
import { geoBounds, geoContains } from "d3-geo";

const MUST_INCLUDE = [
  { name: "Gilgit (Gilgit-Baltistan)", at: [74.31, 35.92] },
  { name: "Muzaffarabad (PoK)", at: [73.47, 34.37] },
  { name: "Aksai Chin", at: [79.5, 35.2] },
  { name: "Siachen Glacier", at: [77.1, 35.4] },
  { name: "Leh (Ladakh)", at: [77.58, 34.16] },
  { name: "Srinagar", at: [74.8, 34.08] },
  { name: "Tawang (Arunachal Pradesh)", at: [91.86, 27.59] },
  { name: "Itanagar (Arunachal Pradesh)", at: [93.62, 27.08] },
];

export function assertOfficialIndia(feature) {
  const missing = MUST_INCLUDE.filter((p) => !geoContains(feature, p.at)).map((p) => p.name);
  const [, [, north]] = geoBounds(feature);
  if (missing.length || north < 36.8) {
    throw new Error(
      `This India outline does not follow the official boundary.\n` +
        `  Missing: ${missing.join(", ") || "—"}\n  Northern extent: ${north.toFixed(2)}°N (official ≈ 37.1°N)\n` +
        `Use Natural Earth's ne_10m_admin_0_countries_ind (India point of view) or a Survey of India outline.`
    );
  }
  return true;
}
