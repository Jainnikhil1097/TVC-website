// Makes "on dark" versions of the annotated product images for the home page's black
// portfolio section: the product itself (lifted out by Vision, real colours) on a
// transparent background, with the image's labels, leader lines and arrows turned light
// so they read on black. Usage: node scripts/make-dark-product-images.mjs <src dir> <cut-out dir> <out dir> [slug…]
import sharp from "sharp";
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
const [src, cuts, out, ...only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// Areas kept exactly as they are (fractions of the image), for parts Vision doesn't see as
// an object: Helionis's spec card, Fitsol's dashboard screenshots.
const KEEP = {
  "helionis-labs": [{ x: 0.688, y: 0.048, w: 0.235, h: 0.745 }],
  // Fitsol's two dashboard screenshots.
  fitsol: [
    { x: 0.068, y: 0.078, w: 0.441, h: 0.437 },
    { x: 0.526, y: 0.513, w: 0.413, h: 0.446 },
  ],
};
const files = readdirSync(src).filter((f) => f.endsWith("-product.jpg") && (!only.length || only.some((s) => f.startsWith(s))));
for (const f of files) {
  const cut = path.join(cuts, f.replace(/\.jpg$/, ".png"));
  const keepOnly = !existsSync(cut) && KEEP[f.replace(/-product\.jpg$/, "")];
  if (!existsSync(cut) && !keepOnly) { console.log("skip (no cut-out)", f); continue; }
  const { data: o, info } = await sharp(path.join(src, f)).flatten({ background: "#fff" }).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // Product coverage from the Vision cut-out, or none (only the KEEP areas) without one.
  const c = keepOnly
    ? Buffer.alloc(W * H * 4)
    : (await sharp(cut).resize(W, H).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;
  const outBuf = Buffer.alloc(W * H * 4);
  const slug = f.replace(/-product\.jpg$/, "");
  for (const k of KEEP[slug] ?? []) {
    const x0 = Math.round(k.x * W), y0 = Math.round(k.y * H), x1 = Math.round((k.x + k.w) * W), y1 = Math.round((k.y + k.h) * H);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const j = (y * W + x) * 4; c[j] = o[(y * W + x) * 3]; c[j + 1] = o[(y * W + x) * 3 + 1]; c[j + 2] = o[(y * W + x) * 3 + 2]; c[j + 3] = 255; }
  }
  for (let i = 0, j = 0; i < W * H * 3; i += 3, j += 4) {
    const pa = c[j + 3] / 255; // product (Vision) coverage
    const r = o[i], g = o[i + 1], b = o[i + 2];
    // Ink: how far from white the original pixel is (labels and lines are dark).
    const ink = Math.max(255 - r, 255 - g, 255 - b) / 255;
    // Keep real ink (text, leader lines, arrows), drop faint grid lines and soft shadows.
    const la = Math.min(1, Math.max(0, (ink - 0.32) / 0.38)) * (1 - pa);
    const blue = b > r + 35 && b > g + 10;
    const [lr, lg, lb] = blue ? [127, 211, 230] : [236, 240, 243];
    // Product over label layer (straight alpha "over").
    const a = pa + la * (1 - pa);
    const mix = (pc, lc) => (a ? Math.round((pc * pa + lc * la * (1 - pa)) / a) : 0);
    outBuf[j] = mix(c[j], lr); outBuf[j + 1] = mix(c[j + 1], lg); outBuf[j + 2] = mix(c[j + 2], lb); outBuf[j + 3] = Math.round(a * 255);
  }
  const dest = path.join(out, f.replace(/\.jpg$/, "-dark.webp"));
  await sharp(outBuf, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 88, alphaQuality: 95 }).toFile(dest);
  console.log("made", path.basename(dest));
}
