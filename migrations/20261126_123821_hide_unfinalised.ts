import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

// 26 Nov 2026 (the team): EarthEn and Perovskia Solar aren't final yet, so they're hidden
// from the site ("Show on site" off) but kept in the CMS. The site then leaves them out
// everywhere: portfolio, counts, map, Impact SDG entries and footprint. Turn "Show on site"
// back on in the CMS once each investment is final.

const SLUGS = ['earthen', 'perovskia-solar']

export async function hideUnfinalised(payload: Payload, req?: PayloadRequest) {
  const { docs } = await payload.find({ collection: 'companies', where: { slug: { in: SLUGS } }, limit: 10, depth: 0, req })
  const hidden: string[] = []
  for (const c of docs) {
    if (c.showOnSite === false) continue
    await payload.update({ collection: 'companies', id: c.id, req, context: { disableRevalidate: true }, data: { showOnSite: false } })
    hidden.push(c.name)
  }
  return hidden
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await hideUnfinalised(payload, req)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'companies', where: { slug: { in: SLUGS } }, limit: 10, depth: 0, req })
  for (const c of docs) {
    await payload.update({ collection: 'companies', id: c.id, req, context: { disableRevalidate: true }, data: { showOnSite: true } })
  }
}
