// Shared by scripts/seed.ts (fresh databases) and scripts/import-team.ts (updating an
// existing CMS). Brings the Team collection in line with scripts/seed-data/team.ts:
//   - creates or updates each person by name (title, section, LinkedIn, order),
//   - uploads their photo from seed-data/team-photos/<slug>.webp once, and attaches it,
//   - hides (never deletes) anyone in the CMS who isn't in the list.
// Bios and anything else edited in the CMS are left alone. Safe to run repeatedly.
import { existsSync } from "node:fs";
import path from "node:path";
import type { Payload } from "payload";
import { teamGroups } from "./seed-data/team";
import { personSlug } from "./seed-data/slug";

const photoDir = path.join(process.cwd(), "scripts", "seed-data", "team-photos");
const context = { disableRevalidate: true };

/** Finds a previously uploaded photo by file name, or uploads it. */
async function mediaFor(payload: Payload, file: string, alt: string): Promise<number | undefined> {
  const filePath = path.join(photoDir, `${file}.webp`);
  if (!existsSync(filePath)) return undefined;
  const { docs } = await payload.find({
    collection: "media",
    where: { filename: { equals: `${file}.webp` } },
    limit: 1,
    depth: 0,
  });
  if (docs[0]) return docs[0].id;
  const doc = await payload.create({ collection: "media", context, data: { alt }, filePath });
  return doc.id;
}

export async function importTeam(payload: Payload, log: (msg: string) => void) {
  const listed = new Set<string>();
  let created = 0;
  let updated = 0;
  let photos = 0;

  for (const group of teamGroups) {
    for (const [i, p] of group.people.entries()) {
      listed.add(p.name);
      const photo = await mediaFor(payload, personSlug(p.name), `Portrait of ${p.name}`);
      if (photo) photos++;
      const data = {
        name: p.name,
        title: p.title ?? "",
        group: group.id,
        linkedin: p.linkedin,
        order: (i + 1) * 10,
        showOnSite: true,
        _status: "published" as const,
        ...(photo ? { photo } : {}),
      };
      const { docs } = await payload.find({
        collection: "team",
        where: { name: { equals: p.name } },
        limit: 1,
        depth: 0,
        draft: true,
      });
      if (docs[0]) {
        await payload.update({ collection: "team", id: docs[0].id, context, data });
        updated++;
      } else {
        await payload.create({ collection: "team", context, data });
        created++;
      }
    }
  }

  // Hide people who are no longer on the list (e.g. someone who has left).
  const { docs: everyone } = await payload.find({ collection: "team", limit: 1000, depth: 0, draft: true });
  const hidden: string[] = [];
  for (const d of everyone) {
    if (listed.has(d.name) || d.showOnSite === false) continue;
    await payload.update({ collection: "team", id: d.id, context, data: { showOnSite: false } });
    hidden.push(d.name);
  }

  log(`team: ${created} added, ${updated} updated, ${photos} with photos`);
  if (hidden.length) log(`team: hidden (not in the list): ${hidden.join(", ")}`);
}
