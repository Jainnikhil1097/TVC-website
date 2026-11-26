// Shared by scripts/import-company-products.ts (npm run company:products).
// Puts the product images in seed-data/company-products/ (<slug>-product.<ext>, and
// <slug>-product-dark.<ext> for the home page's black section) on their
// companies. A company's image is set when it has none, or replaced when the current one
// came from this folder (its file name starts with <slug>-product) but is a different
// file; then its product callouts are cleared too, since they were placed for the old
// image (the new images have their labels built in). An image uploaded by an editor is
// never replaced. Safe to run more than once.
import { createHash } from "node:crypto";
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Payload } from "payload";

const dir = path.join(process.cwd(), "scripts", "seed-data", "company-products");
const context = { disableRevalidate: true };

export async function importCompanyProducts(payload: Payload, log: (msg: string) => void) {
  const files = readdirSync(dir).filter((f) => /-product(-dark)?\.(png|jpe?g|webp)$/i.test(f));
  let set = 0;
  for (const file of files) {
    // <slug>-product-dark.<ext> is the version for dark backgrounds (home page).
    const dark = /-product-dark\.[a-z]+$/i.test(file);
    const field = dark ? "productImageDark" : "productImage";
    const stem = dark ? "product-dark" : "product";
    const slug = file.replace(/-product(-dark)?\.[a-z]+$/i, "");
    const { docs } = await payload.find({ collection: "companies", where: { slug: { equals: slug } }, limit: 1, depth: 1, draft: true });
    const company = docs[0];
    if (!company) continue;

    const source = path.join(dir, file);
    const ext = path.extname(file);
    const versioned = `${slug}-${stem}-${createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 8)}${ext}`;
    const currentDoc = company[field];
    const current = typeof currentDoc === "object" ? currentDoc?.filename ?? "" : "";
    if (current && !current.startsWith(`${slug}-${stem}`)) continue; // an editor's own image
    if (!dark && current.startsWith(`${slug}-product-dark`)) continue;
    if (current === file || current === versioned) continue; // already this file

    const { docs: existing } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0 });
    let id = existing[0]?.id;
    if (!id) {
      const tmp = mkdtempSync(path.join(os.tmpdir(), "tvc-product-"));
      const filePath = path.join(tmp, versioned);
      copyFileSync(source, filePath);
      try {
        id = (await payload.create({ collection: "media", context, data: { alt: `${company.name}: product image${dark ? " (on dark)" : ""}` }, filePath })).id;
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
    // A replaced product image also loses its callouts (placed for the old image).
    await payload.update({ collection: "companies", id: company.id, context, data: dark ? { productImageDark: id } : { productImage: id, ...(current ? { callouts: [] } : {}) } });
    set++;
    log(`${company.name}${dark ? " (on dark)" : ""}: ${current ? "replaced" : "added"}`);
  }
  log(`product images: ${set} updated`);
}
