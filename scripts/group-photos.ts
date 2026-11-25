// Shared by scripts/seed.ts and scripts/import-group-photos.ts (npm run about:photos).
// Uploads the team's group photos in seed-data/group-photos/ (once each, versioned by
// content) and sets them as About page → Group photos, which also scroll in the home
// page's "About Transition VC" band. It fills the list while it's empty, or replaces it
// while every photo in it still came from this script (an editor's own photos are kept).
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Payload } from "payload";

const dir = path.join(process.cwd(), "scripts", "seed-data", "group-photos");
const context = { disableRevalidate: true };

// The team's group photos (25 Nov 2026): the whole team first, then the smaller groups.
const PHOTOS = [
  { file: "team.jpg", alt: "The Transition VC team together in the studio", caption: "The Transition VC team" },
  { file: "team-3.jpg", alt: "Members of the Transition VC team, three seated in front of the rest", caption: "" },
  { file: "team-2.jpg", alt: "Members of the Transition VC team, three seated in front of four standing", caption: "" },
  { file: "team-4.jpg", alt: "The women of the Transition VC team together", caption: "" },
  { file: "team-1.jpg", alt: "Four members of the Transition VC team, one seated on a stool", caption: "" },
] as const;

async function upload(payload: Payload, file: string, alt: string) {
  const source = path.join(dir, file);
  if (!existsSync(source)) return undefined;
  const ext = path.extname(file);
  const hash = createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 8);
  const versioned = `group-${path.basename(file, ext)}-${hash}${ext}`;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0 });
  if (docs[0]) return docs[0].id;
  const tmp = mkdtempSync(path.join(os.tmpdir(), "tvc-group-"));
  const filePath = path.join(tmp, versioned);
  copyFileSync(source, filePath);
  try {
    return (await payload.create({ collection: "media", context, data: { alt }, filePath })).id;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export async function importGroupPhotos(payload: Payload, log: (msg: string) => void) {
  const about = await payload.findGlobal({ slug: "about-page", depth: 1 });
  const current = about.groupPhotos ?? [];
  const ours = current.every((p) => typeof p.image === "object" && p.image?.filename?.startsWith("group-"));
  if (current.length && !ours) {
    log("group photos set by an editor — skipped");
    return;
  }

  const ids = new Map<string, number>();
  for (const p of PHOTOS) {
    const id = await upload(payload, p.file, p.alt);
    if (id !== undefined) ids.set(p.file, id);
  }
  const groupPhotos = PHOTOS.filter((p) => ids.has(p.file)).map((p) => ({ image: ids.get(p.file)!, caption: p.caption || undefined }));
  const same =
    current.length === groupPhotos.length &&
    current.every((p, i) => (typeof p.image === "object" ? p.image?.id : p.image) === groupPhotos[i].image);
  if (!groupPhotos.length || same) {
    log("group photos up to date");
    return;
  }
  await payload.updateGlobal({ slug: "about-page", context, data: { groupPhotos } });
  log(`about-page: ${groupPhotos.length} group photos`);
}
