// Shared by scripts/seed.ts and scripts/import-news-photos.ts (npm run news:photos).
// Gives each news item from scripts/seed-data/perspectives.ts its photo:
//   1. with download on (the npm script), a photo missing from seed-data/news-photos/ is
//      fetched once from its photoUrl (the previous website's image host) and saved there
//      as a JPEG, so the repository keeps its own copy;
//   2. each photo is uploaded once (versioned by content) and attached to the news item
//      with the same link, only while that item has no photo.
// A photo an editor has set in the CMS is never replaced.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import type { Payload } from "payload";
import { news } from "./seed-data/perspectives";

const dir = path.join(process.cwd(), "scripts", "seed-data", "news-photos");
const context = { disableRevalidate: true };

async function download(url: string, file: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, jpeg);
}

async function upload(payload: Payload, source: string, alt: string) {
  const ext = path.extname(source);
  const hash = createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 8);
  const versioned = `news-${path.basename(source, ext)}-${hash}${ext}`;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0 });
  if (docs[0]) return docs[0].id;
  const tmp = mkdtempSync(path.join(os.tmpdir(), "tvc-news-"));
  const filePath = path.join(tmp, versioned);
  writeFileSync(filePath, readFileSync(source));
  try {
    return (await payload.create({ collection: "media", context, data: { alt }, filePath })).id;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export async function importNewsPhotos(payload: Payload, log: (msg: string) => void, { fetchMissing = false } = {}) {
  let attached = 0;
  for (const item of news) {
    if (!item.photo) continue;
    const file = path.join(dir, item.photo);
    if (!existsSync(file) && fetchMissing && item.photoUrl) {
      try {
        await download(item.photoUrl, file);
        log(`downloaded ${item.photo}`);
      } catch (e) {
        log(`could not download ${item.photo}: ${(e as Error).message}`);
      }
    }
    if (!existsSync(file)) continue;
    const { docs } = await payload.find({ collection: "news", where: { url: { equals: item.url } }, limit: 1, depth: 0 });
    const doc = docs[0];
    if (!doc || doc.image) continue;
    const image = await upload(payload, file, `${item.source}: ${item.title}`);
    await payload.update({ collection: "news", id: doc.id, context, data: { image } });
    attached++;
  }
  log(`news photos attached: ${attached}`);
}
