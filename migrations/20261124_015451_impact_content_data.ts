import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { importImpact } from '../scripts/impact-import'

// The redesigned Impact page's content (from the team's Impact handoff, Nov 2026): page copy,
// SDG explorer, footprint countries and each company's impact view. Text only; photos are
// files, so after deploying run  npm run impact:import  against the database to add them.
// Fills only what's still empty; a brand-new database gets everything from the seed.
// Runs after 20261124_015323_impact_redesign, which adds the fields.

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if ((await payload.count({ collection: 'companies', req })).totalDocs === 0) return
  await importImpact(payload, (msg) => payload.logger.info(msg), { images: false, req })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; the fields are removed by 20261124_015323_impact_redesign.
}
