// Shared by scripts/seed.ts (fresh databases) and scripts/import-company-photos.ts
// (updating an existing CMS). For each photo in scripts/seed-data/company-photos/
// named after a company's slug (e.g. matel-motion.jpg or suind.webp):
//   - uploads it to the media library once (by file name),
//   - sets it as that company's cover image (the home spotlight's fallback when
//     there's no product render).
// Companies without a photo file are left alone. Safe to run repeatedly.
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Payload } from "payload";

const photoDir = path.join(process.cwd(), "scripts", "seed-data", "company-photos");
const context = { disableRevalidate: true };
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export async function importCompanyPhotos(payload: Payload, log: (msg: string) => void) {
  if (!existsSync(photoDir)) return;
  const files = readdirSync(photoDir).filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));
  let attached = 0;

  for (const file of files) {
    const slug = path.basename(file, path.extname(file));
    const { docs: companies } = await payload.find({
      collection: "companies",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const company = companies[0];
    if (!company) {
      log(`no company with slug "${slug}" for ${file}, skipped`);
      continue;
    }

    const { docs: existing } = await payload.find({
      collection: "media",
      where: { filename: { equals: file } },
      limit: 1,
      depth: 0,
    });
    const media =
      existing[0] ??
      (await payload.create({
        collection: "media",
        context,
        data: { alt: `${company.name}: product photo` },
        filePath: path.join(photoDir, file),
      }));

    await payload.update({
      collection: "companies",
      id: company.id,
      context,
      data: { coverImage: media.id },
    });
    attached++;
  }
  log(`company photos: ${attached} attached`);
}
