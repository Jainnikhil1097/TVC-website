// Shared by scripts/seed.ts (fresh databases) and scripts/import-one-pagers.ts
// (updating an existing CMS). For each company in scripts/seed-data/one-pagers.ts:
//   - fills in One-pager fields that are still empty (never overwrites an editor's text),
//   - attaches scripts/seed-data/company-products/<slug>-product.png|webp|jpg as the product
//     image, if the company has none yet.
// Companies that aren't in the CMS are skipped. Safe to run repeatedly.
import { existsSync } from "node:fs";
import path from "node:path";
import type { Payload } from "payload";
import { onePagers, type OnePager } from "./seed-data/one-pagers";

const productDir = path.join(process.cwd(), "scripts", "seed-data", "company-products");
const EXTENSIONS = [".png", ".webp", ".jpg", ".jpeg"];
const context = { disableRevalidate: true };

const TEXT_FIELDS = [
  "proofValue",
  "proofLabel",
  "deployment",
  "customers",
  "marketGap",
  "breakthrough",
  "marketOpportunity",
  "whyTheyWin",
] as const satisfies readonly (keyof OnePager)[];

const blank = (v: unknown) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

/** Uploads <slug>-product.<ext> once (matched by file name) and returns its media id. */
async function productImage(payload: Payload, slug: string, companyName: string) {
  const file = EXTENSIONS.map((ext) => `${slug}-product${ext}`).find((f) => existsSync(path.join(productDir, f)));
  if (!file) return undefined;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: file } }, limit: 1, depth: 0 });
  const media =
    docs[0] ??
    (await payload.create({
      collection: "media",
      context,
      data: { alt: `${companyName}: product render` },
      filePath: path.join(productDir, file),
    }));
  return media.id;
}

export async function importOnePagers(payload: Payload, log: (msg: string) => void) {
  let filled = 0;
  for (const [slug, content] of Object.entries(onePagers)) {
    const { docs } = await payload.find({
      collection: "companies",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
    });
    const company = docs[0];
    if (!company) continue;

    const data: Record<string, unknown> = {};
    for (const field of TEXT_FIELDS) {
      if (content[field] && blank(company[field])) data[field] = content[field];
    }
    if (content.traction?.length && blank(company.traction)) data.traction = content.traction.map((point) => ({ point }));
    if (content.callouts?.length && blank(company.callouts)) data.callouts = content.callouts;
    if (blank(company.productImage)) {
      const id = await productImage(payload, slug, company.name);
      if (id) data.productImage = id;
    }

    if (Object.keys(data).length === 0) continue;
    await payload.update({ collection: "companies", id: company.id, context, data });
    filled++;
  }
  log(`one-pagers: ${filled} ${filled === 1 ? "company" : "companies"} updated`);
}
