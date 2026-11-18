// Shared by scripts/seed.ts (fresh databases) and scripts/import-company-logos.ts
// (updating an existing CMS). For each file in scripts/seed-data/company-logos/ named
// after a company's slug (e.g. matel-motion.png or emo-energy.svg):
//   - uploads it to the media library once (by file name), and
//   - sets it as that company's logo, only if the company has no logo yet.
// Companies without a file are left alone. Safe to run repeatedly.
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Payload } from "payload";

const logoDir = path.join(process.cwd(), "scripts", "seed-data", "company-logos");
const context = { disableRevalidate: true };
const EXTENSIONS = [".svg", ".png", ".webp"];

export async function importCompanyLogos(payload: Payload, log: (msg: string) => void) {
  if (!existsSync(logoDir)) return;
  const files = readdirSync(logoDir).filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));
  let attached = 0;

  for (const file of files) {
    const slug = path.basename(file, path.extname(file));
    const { docs } = await payload.find({ collection: "companies", where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true });
    const company = docs[0];
    if (!company) {
      log(`no company with slug "${slug}" for ${file}, skipped`);
      continue;
    }
    if (company.logo) continue;

    // Matched by alt text: logo files share names with cover photos (<slug>.png).
    const { docs: existing } = await payload.find({ collection: "media", where: { alt: { equals: `${company.name} logo` } }, limit: 1, depth: 0 });
    const doc =
      existing[0] ??
      (await payload.create({
        collection: "media",
        context,
        data: { alt: `${company.name} logo` },
        filePath: path.join(logoDir, file),
      }));
    await payload.update({ collection: "companies", id: company.id, context, data: { logo: doc.id } });
    attached++;
  }
  log(`company logos: ${attached} attached`);
}
