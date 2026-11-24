// Shared by scripts/seed.ts (fresh databases), scripts/import-impact.ts (npm run impact:import)
// and the impact data migration. Fills the Impact page (CMS → Pages → Impact page) and each
// company's Impact tab from scripts/seed-data/impact*.ts:
//   - the page is written only while it's still empty (no hero headline yet),
//   - a company's Impact tab only while it has no measures yet,
// so editors' changes are never overwritten. With images (not from a migration), the
// photos in seed-data/impact-photos/ are uploaded once each, versioned by content.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Payload, PayloadRequest } from "payload";
import { impact } from "./seed-data/impact";
import { companyImpact, sdgGoals } from "./seed-data/impact-content";

const photoDir = path.join(process.cwd(), "scripts", "seed-data", "impact-photos");
const context = { disableRevalidate: true };

async function photo(payload: Payload, file: string | undefined, alt: string, req?: PayloadRequest) {
  if (!file) return undefined;
  const source = path.join(photoDir, file);
  if (!existsSync(source)) return undefined;
  const ext = path.extname(file);
  const hash = createHash("sha1").update(readFileSync(source)).digest("hex").slice(0, 8);
  const versioned = `impact-${path.basename(file, ext)}-${hash}${ext}`;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: versioned } }, limit: 1, depth: 0, req });
  if (docs[0]) return docs[0].id;
  const dir = mkdtempSync(path.join(os.tmpdir(), "tvc-impact-"));
  const filePath = path.join(dir, versioned);
  copyFileSync(source, filePath);
  try {
    return (await payload.create({ collection: "media", context, data: { alt }, filePath, req })).id;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function importImpact(
  payload: Payload,
  log: (msg: string) => void,
  { images = true, req }: { images?: boolean; req?: PayloadRequest } = {}
) {
  const { docs: all } = await payload.find({ collection: "companies", limit: 500, depth: 0, draft: true, req });
  const idOf = new Map(all.map((c) => [c.slug ?? "", c.id]));
  const ids = (slugs: string[]) => slugs.map((s) => idOf.get(s)).filter((id): id is number => id !== undefined);

  // Each company's view.
  let companies = 0;
  for (const [slug, v] of Object.entries(companyImpact)) {
    const c = all.find((x) => x.slug === slug);
    if (!c) continue;
    const image = images ? await photo(payload, v.image, `${c.name}: impact`, req) : undefined;
    if (c.impact?.metrics?.length) {
      // Already filled (e.g. by the migration, which can't upload files): only add a missing photo.
      if (image && !c.impact.image) {
        await payload.update({ collection: "companies", id: c.id, req, context, data: { impact: { ...c.impact, image } } as never });
      }
      continue;
    }
    await payload.update({
      collection: "companies",
      id: c.id,
      req,
      context,
      data: {
        impact: {
          show: true,
          featured: v.featured,
          order: v.order,
          sectorLabel: v.sectorLabel,
          stage: v.stage,
          period: v.period,
          tagline: v.tagline,
          ...(image ? { image } : {}),
          metrics: v.metrics,
          closerValue: v.closerValue,
          closerText: v.closerText,
          evidence: v.evidence,
          sources: v.sources,
        },
      },
    });
    companies++;
  }
  log(`impact: ${companies} company views filled`);

  // The page.
  const page = await payload.findGlobal({ slug: "impact-page", depth: 0, req });
  const tiles = [];
  for (const tile of impact.hero.tiles) {
    const image = images ? await photo(payload, tile.image, tile.caption, req) : undefined;
    if (image) tiles.push({ image, company: idOf.get(tile.company), caption: tile.caption });
  }
  if (page.hero?.headline) {
    // Already filled: only add the photo tiles if the page has none yet.
    if (tiles.length && !page.hero.tiles?.length) {
      await payload.updateGlobal({ slug: "impact-page", req, context, data: { hero: { ...page.hero, tiles } } as never });
      log("impact: photo tiles added");
    } else log("impact: page already filled — skipped");
    return;
  }
  await payload.updateGlobal({
    slug: "impact-page",
    req,
    context,
    data: {
      hero: { ...impact.hero, tiles },
      pathways: impact.pathways.map((p) => ({ ...p, companies: ids(p.companies) })),
      outcomes: impact.outcomes,
      footprint: { ...impact.footprint, countries: impact.footprint.countries.map((c) => ({ ...c, companies: ids(c.companies) })) },
      sdgs: {
        ...impact.sdgs,
        goals: sdgGoals.map((g) => ({
          ...g,
          entries: g.entries.map((e) => ({ company: e.company ? idOf.get(e.company) : undefined, label: e.label ?? "", connection: e.connection, measures: e.measures })),
        })),
      },
      carousel: impact.carousel,
      contribution: impact.contribution,
      women: impact.women,
      perspectives: impact.perspectives,
      measurement: impact.measurement,
    } as never,
  });
  log("impact: page written");
}
