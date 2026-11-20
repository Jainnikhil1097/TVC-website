// Turns the photographer's originals into the web-sized portraits the site uses.
//
//   npm run team:photos -- "~/Downloads/TVC Photos"
//
// For each person in scripts/seed-data/team.ts it looks for a source file named after
// their first name (e.g. "Raiyaan.JPG"; aliases below), crops it to a waist-up 4:5
// portrait and saves scripts/seed-data/team-photos/<slug>.webp (1200 × 1500, ~100 KB).
//
// Framing: every portrait is cropped to the same standard — face centred, top of the
// head about 8% from the top, head-to-chin about 30% of the frame. Each person's crop
// is in team-photos/crops.json as { "<slug>": { "top": 0.05, "width": 0.62, "centre":
// 0.5 } }: fractions of the source image (top edge, crop width, horizontal centre). A
// crop may reach past the photo's edge; the plain studio backdrop is extended to fill.
//
// Pass --sheet to also write a contact sheet to /tmp/team-photos-sheet.jpg for checking.
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { teamGroups } from "./seed-data/team.ts";
import { personSlug } from "./seed-data/slug.ts";

const args = process.argv.slice(2);
const sheet = args.includes("--sheet");
const source = args.find((a) => !a.startsWith("--"))?.replace(/^~(?=\/)/, os.homedir());
if (!source || !existsSync(source)) {
  console.error('Usage: npm run team:photos -- "<folder with the original photos>" [--sheet]');
  process.exit(1);
}

const outDir = path.join(process.cwd(), "scripts", "seed-data", "team-photos");
mkdirSync(outDir, { recursive: true });

/** Source file names that don't match the person's first name. */
const ALIASES = { "Ashrita Ashwin": "Arshita", "Mohammed Shoeb Ali": "Shoeb" };

const DEFAULT_CROP = { top: 0.05, width: 0.62, centre: 0.5 };
const cropsFile = path.join(outDir, "crops.json");
const crops = existsSync(cropsFile) ? JSON.parse(readFileSync(cropsFile, "utf8")) : {};

const files = readdirSync(source).filter((f) => /\.(jpe?g|png|heic|webp)$/i.test(f));
const findSource = (stem) => files.find((f) => path.parse(f).name.toLowerCase() === stem.toLowerCase());

const people = teamGroups.flatMap((g) => g.people);
const made = [];
const missing = [];

for (const person of people) {
  const stem = ALIASES[person.name] ?? person.name.split(" ")[0];
  const file = findSource(stem);
  const slug = personSlug(person.name);
  if (!file) {
    missing.push(person.name);
    continue;
  }
  const input = sharp(path.join(source, file)).rotate(); // apply camera orientation
  const { data: raw, info } = await input.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const c = { ...DEFAULT_CROP, ...crops[slug] };
  const cropW = Math.round(w * c.width);
  const cropH = Math.round(cropW * 1.25);
  const left = Math.round(w * c.centre - cropW / 2);
  const top = Math.round(h * c.top);
  // A crop may reach past the photo's edge (to centre someone or give their head room);
  // the studio backdrop is plain, so extend it with its own colour, sampled near the
  // top corners.
  const pad = { left: Math.max(0, -left), top: Math.max(0, -top), right: Math.max(0, left + cropW - w), bottom: Math.max(0, top + cropH - h) };
  const sample = (x, y) => [0, 1, 2].map((k) => raw[(y * w + x) * 3 + k]);
  const corners = [sample(8, 8), sample(w - 9, 8)];
  const background = { r: (corners[0][0] + corners[1][0]) >> 1, g: (corners[0][1] + corners[1][1]) >> 1, b: (corners[0][2] + corners[1][2]) >> 1 };
  const padded = Object.values(pad).some((v) => v > 0)
    ? sharp(await sharp(raw, { raw: info }).extend({ ...pad, background }).png().toBuffer())
    : sharp(raw, { raw: info });
  await padded
    .extract({ left: left + pad.left, top: top + pad.top, width: cropW, height: cropH })
    .resize(1200, 1500, { fit: "cover", position: "top" })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, `${slug}.webp`));
  made.push(slug);
}

console.log(`Saved ${made.length} photos to ${path.relative(process.cwd(), outDir)}/`);
if (missing.length) console.log(`No photo found for: ${missing.join(", ")}`);

if (sheet) {
  const tiles = made;
  const size = { w: 240, h: 300 };
  const cols = 7;
  const rows = Math.ceil(tiles.length / cols);
  const composites = await Promise.all(
    tiles.map(async (slug, i) => ({
      input: await sharp(path.join(outDir, `${slug}.webp`)).resize(size.w, size.h).toBuffer(),
      left: (i % cols) * (size.w + 8),
      top: Math.floor(i / cols) * (size.h + 8),
    }))
  );
  await sharp({
    create: { width: cols * (size.w + 8), height: rows * (size.h + 8), channels: 3, background: "#0b1626" },
  })
    .composite(composites)
    .jpeg({ quality: 80 })
    .toFile("/tmp/team-photos-sheet.jpg");
  console.log("Contact sheet: /tmp/team-photos-sheet.jpg (order: " + tiles.join(", ") + ")");
}
