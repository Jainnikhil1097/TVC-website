import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { portfolio } from '../scripts/seed-data/portfolio'

// 23 Nov 2026 (the team): everything in the portfolio today is Fund I (Fund II is still
// being finalised), plus four Pre Fund companies from before Fund I. Runs after
// 20261123_124801_team_rows_prefund, which adds the "Pre Fund" option.
//   - Perovskia Solar and Two Point O move from Fund II to Fund I.
//   - The Pre Fund companies are created if missing (published, listed after Fund I).
// A brand-new, empty database gets all of this from the seed instead.

const PRE_FUND = ['ethereal-machines', 'exponent-energy', 'billione-mobility', 'chargezone']

export async function applyFundsUpdate(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  if ((await payload.count({ collection: 'companies', req })).totalDocs === 0) return []
  const changed: string[] = []

  const { docs: fund2 } = await payload.find({ collection: 'companies', where: { fund: { equals: 'fund-2' } }, limit: 100, depth: 0, req })
  for (const c of fund2) {
    await payload.update({ collection: 'companies', id: c.id, req, context, data: { fund: 'fund-1' } })
    changed.push(`${c.name} → Fund I`)
  }

  for (const [i, slug] of PRE_FUND.entries()) {
    const c = portfolio.find((p) => p.slug === slug)
    if (!c) continue
    if ((await payload.count({ collection: 'companies', where: { slug: { equals: slug } }, req })).totalDocs > 0) continue
    await payload.create({
      collection: 'companies',
      req,
      context,
      data: {
        name: c.name,
        slug: c.slug,
        summary: c.summary,
        sector: c.sector,
        stage: c.stage,
        fund: 'pre-fund',
        yearInvested: c.yearInvested,
        website: c.website,
        status: 'active',
        featured: false,
        showOnSite: true,
        order: 900 + i,
        _status: 'published',
      },
    })
    changed.push(`${c.name} added (Pre Fund)`)
  }
  return changed
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyFundsUpdate(payload, req)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'companies', req, where: { slug: { in: PRE_FUND } }, context: { disableRevalidate: true } })
}
