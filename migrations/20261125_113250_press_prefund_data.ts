import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { portfolio } from '../scripts/seed-data/portfolio'
import { news } from '../scripts/seed-data/perspectives'

// 25 Nov 2026 (the team):
//   - The Pre Fund companies get the team's own descriptions and corrected websites, in
//     place of the drafts; each field changes only while it's still the draft.
//   - The press coverage from the previous website's "In the media" list is added (any
//     item whose link isn't in News yet). Photos can't be uploaded from a migration:
//     run npm run news:photos afterwards.
// Runs after 20261125_113237_news_photos, which adds the news photo field.

const DRAFTS: Record<string, { summary: string; website: string }> = {
  'ethereal-machines': {
    summary: 'Five-axis CNC machines and advanced manufacturing systems, designed and built in India.',
    website: 'https://etherealmachines.com/',
  },
  'exponent-energy': {
    summary: 'Battery packs and charging stations built to charge electric commercial vehicles rapidly.',
    website: 'https://www.exponent.energy/',
  },
  'billione-mobility': {
    summary: 'Electric commercial-vehicle fleets for logistics, with charging and fleet services.',
    website: 'https://www.billionemobility.com/',
  },
  chargezone: {
    summary: 'A network of fast-charging stations for electric vehicles, serving fleets, cities and highways.',
    website: 'https://chargezone.co/',
  },
}

export async function applyPressAndPreFund(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  // A brand-new, empty database gets all of this from the seed instead.
  if ((await payload.count({ collection: 'companies', req })).totalDocs === 0) return []
  const changed: string[] = []

  for (const [slug, draft] of Object.entries(DRAFTS)) {
    const seed = portfolio.find((p) => p.slug === slug)
    const { docs } = await payload.find({ collection: 'companies', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })
    const c = docs[0]
    if (!seed || !c) continue
    const data: { summary?: string; website?: string } = {}
    if (c.summary === draft.summary && seed.summary !== draft.summary) data.summary = seed.summary
    if (c.website === draft.website && seed.website && seed.website !== draft.website) data.website = seed.website
    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'companies', id: c.id, req, context, data })
    changed.push(`${c.name}: ${Object.keys(data).join(', ')}`)
  }

  for (const { date, title, source, url } of news) {
    if ((await payload.count({ collection: 'news', where: { url: { equals: url } }, req })).totalDocs > 0) continue
    await payload.create({ collection: 'news', req, context, data: { date, title, source, url } })
    changed.push(`news: ${title}`)
  }
  return changed
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyPressAndPreFund(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; news items can be deleted in the CMS, and the earlier company wording
  // restored from each company's version history.
}
