// Shared by scripts/seed.ts (fresh databases) and scripts/import-company-logos.ts
// (updating an existing CMS). For each file in scripts/seed-data/company-logos/ named
// after a company's slug (e.g. matel-motion.png or emo-energy.svg):
//   - uploads it once, as <slug>-logo-<content hash>.<ext> (so a changed file gets a new
//     address and no cache can show the old one), and
//   - sets it as the company's logo if the company has none, or if its current logo came
//     from this folder (an earlier version). A logo uploaded by an editor in the CMS is
//     never replaced. Replaced logo files are removed from the media library.
// Companies without a file are left alone. Safe to run repeatedly.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Payload } from "payload";

const logoDir = path.join(process.cwd(), "scripts", "seed-data", "company-logos");
const context = { disableRevalidate: true };
const EXTENSIONS = [".svg", ".png", ".webp"];

/** Media file names this folder has produced for a slug: "<slug>.png", "<slug>-1.png", "<slug>-logo-1a2b3c4d.png". */
const fromThisFolder = (slug: string, filename?: string | null) =>
  // Slugs are only a–z, 0–9 and hyphens, so they need no escaping in the pattern.
  Boolean(filename) && new RegExp(`^${slug}(-logo-[0-9a-f]{8})?(-\\d+)?\\.(svg|png|webp)$`, "i").test(filename ?? "");

export async function importCompanyLogos(payload: Payload, log: (msg: string) => void) {
  if (!existsSync(logoDir)) return;
  const files = readdirSync(logoDir).filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));
  let attached = 0;
  let replaced = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const slug = path.basename(file, path.extname(file));
    const { docs } = await payload.find({ collection: "companies", where: { slug: { equals: slug } }, limit: 1, depth: 1, draft: true });
    const company = docs[0];
    if (!company) {
      log(`no company with slug "${slug}" for ${file}, skipped`);
      continue;
    }
    const current = company.logo && typeof company.logo === "object" ? company.logo : null;
    const hash = createHash("sha1").update(readFileSync(path.join(logoDir, file))).digest("hex").slice(0, 8);
    const versioned = `${slug}-logo-${hash}${ext}`;
    if (current?.filename === versioned) continue; // already up to date
    if (current && !fromThisFolder(slug, current.filename)) continue; // an editor's own upload

    const { docs: existing } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0 });
    let id = existing[0]?.id;
    if (!id) {
      const dir = mkdtempSync(path.join(os.tmpdir(), "tvc-logo-"));
      const filePath = path.join(dir, versioned);
      copyFileSync(path.join(logoDir, file), filePath);
      try {
        id = (await payload.create({ collection: "media", context, data: { alt: `${company.name} logo` }, filePath })).id;
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
    await payload.update({ collection: "companies", id: company.id, context, data: { logo: id } });
    if (current) {
      replaced++;
      await payload.delete({ collection: "media", id: current.id, context }).catch(() => undefined);
    } else attached++;
  }
  log(`company logos: ${attached} attached, ${replaced} replaced`);
}
