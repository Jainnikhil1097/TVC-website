// Shared by scripts/seed.ts (fresh databases) and scripts/import-team.ts (updating an
// existing CMS). Brings the Team collection in line with scripts/seed-data/team.ts:
//   - creates or updates each person by name (title, team, LinkedIn, order),
//   - fills in bios where the CMS has none (or still has the bio the seed replaces),
//   - uploads founders' logo rows from seed-data/team-logos/ (versioned like photos),
//   - uploads their photo from seed-data/team-photos/<slug>.webp as <slug>-<hash>.webp
//     (a new name whenever the photo changes, so caches never show an old crop), and
//     attaches it, deleting the version it replaces,
//   - hides (never deletes) anyone in the CMS who isn't in the list.
// Bios and points already in the CMS are left alone. Safe to run repeatedly.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Payload } from "payload";
import { teamGroups } from "./seed-data/team";
import { personSlug } from "./seed-data/slug";

const photoDir = path.join(process.cwd(), "scripts", "seed-data", "team-photos");
const logoDir = path.join(process.cwd(), "scripts", "seed-data", "team-logos");

/** Uploads seed-data/team-logos/<file> once, as <name>-<content hash>.<ext>; returns its media id. */
async function logoRowMedia(payload: Payload, file: string, alt: string) {
  const source = path.join(logoDir, file);
  if (!existsSync(source)) return undefined;
  const ext = path.extname(file);
  const hash = createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 8);
  const versioned = `${path.basename(file, ext)}-${hash}${ext}`;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0 });
  if (docs[0]) return docs[0].id;
  const dir = mkdtempSync(path.join(os.tmpdir(), "tvc-team-logos-"));
  const filePath = path.join(dir, versioned);
  copyFileSync(source, filePath);
  try {
    return (await payload.create({ collection: "media", context, data: { alt }, filePath })).id;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Media this folder produced: "<slug>-row-<n>-<hash>.png". */
const fromLogoFolder = (filename?: string | null) => /-row-\d+-[0-9a-f]{8}\.(png|webp|jpe?g)$/i.test(filename ?? "");
const context = { disableRevalidate: true };

/**
 * The media id for a person's portrait. Uploads are named <slug>-<content hash>.webp, so
 * a re-cropped photo gets a new file name and URL: no browser, image cache or CDN can
 * keep showing the old crop. Keeps the photo attached to the person if it's already this
 * exact version; otherwise uploads the new one, and the old one is deleted once the person
 * points at it (see below).
 */
async function mediaFor(
  payload: Payload,
  file: string,
  alt: string,
  current: number | { id: number; filename?: string | null } | null | undefined
): Promise<{ id?: number; replaced?: number }> {
  const source = path.join(photoDir, `${file}.webp`);
  if (!existsSync(source)) return {};
  const hash = createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 8);
  const versioned = `${file}-${hash}.webp`;
  const upload = async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "tvc-team-"));
    const filePath = path.join(dir, versioned);
    copyFileSync(source, filePath);
    try {
      return (await payload.create({ collection: "media", context, data: { alt }, filePath })).id;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  if (current) {
    const doc =
      typeof current === "number" ? await payload.findByID({ collection: "media", id: current, depth: 0 }).catch(() => null) : current;
    if (doc?.filename === versioned) return { id: doc.id };
    return { id: await upload(), replaced: doc?.id };
  }
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0 });
  return { id: docs[0]?.id ?? (await upload()) };
}

export async function importTeam(payload: Payload, log: (msg: string) => void) {
  const listed = new Set<string>();
  let created = 0;
  let updated = 0;
  let photos = 0;

  for (const group of teamGroups) {
    for (const [i, p] of group.people.entries()) {
      listed.add(p.name);
      const { docs: found } = await payload.find({
        collection: "team",
        where: { name: { equals: p.name } },
        limit: 1,
        depth: 0,
        draft: true,
      });
      const { id: photo, replaced } = await mediaFor(payload, personSlug(p.name), `Portrait of ${p.name}`, found[0]?.photo as number | undefined);
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
      // Bios only fill an empty field, or replace the exact bio the seed supersedes, so
      // CMS edits always win.
      const existing = found[0];
      const extras: Record<string, unknown> = {
        ...(p.bio && (!existing?.bio || existing.bio === p.previousBio) ? { bio: p.bio } : {}),
        ...(p.highlights?.length && !existing?.highlights?.length ? { highlights: p.highlights.map((text) => ({ text })) } : {}),
      };
      // Logo rows: set when the person has none, or when every current row came from this
      // folder (an earlier version). Rows an editor uploaded are left alone.
      const retiredRows: number[] = [];
      if (p.logoRows?.length) {
        const current = existing?.logoRows ?? [];
        const currentIds = current.map((r) => (typeof r.image === "number" ? r.image : r.image?.id)).filter((id): id is number => Boolean(id));
        const currentMedia = currentIds.length
          ? (await payload.find({ collection: "media", where: { id: { in: currentIds } }, limit: 20, depth: 0 })).docs
          : [];
        if (currentMedia.every((m) => fromLogoFolder(m.filename))) {
          const rows: { heading: string; image: number }[] = [];
          for (const r of p.logoRows) {
            const image = await logoRowMedia(payload, r.file, `${p.name}: ${r.heading ?? "previous firms"} (logos)`);
            if (image) rows.push({ heading: r.heading ?? "", image });
          }
          const same = rows.length === current.length && rows.every((r, k) => r.image === currentIds[k] && r.heading === (current[k]?.heading ?? ""));
          if (!same) {
            extras.logoRows = rows;
            retiredRows.push(...currentIds.filter((id) => !rows.some((r) => r.image === id)));
          }
        }
      }
      if (existing) {
        await payload.update({ collection: "team", id: existing.id, context, data: { ...data, ...extras } });
        updated++;
        // The old portrait (and old logo rows) are no longer used once the person points at the new ones.
        if (replaced && replaced !== photo) await payload.delete({ collection: "media", id: replaced, context }).catch(() => {});
        for (const id of retiredRows) await payload.delete({ collection: "media", id, context }).catch(() => {});
      } else {
        await payload.create({ collection: "team", context, data: { ...data, ...extras } });
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
