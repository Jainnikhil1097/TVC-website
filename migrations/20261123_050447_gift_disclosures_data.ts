import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { giftCityDisclosures } from '../scripts/seed-data/gift-city'

// Fills the GIFT City page's IFSCA disclosures (Annexure 1, Nov 2026) on a database that
// has a GIFT City page but no disclosures yet. Never overwrites what compliance has entered.
// (A brand-new database gets them from the seed instead.)

export async function fillGiftDisclosures(payload: Payload, req?: PayloadRequest) {
  const page = await payload.findGlobal({ slug: 'gift-city-page', depth: 0, req })
  if (!page.headline || page.disclosures?.fme?.name) return false
  await payload.updateGlobal({
    slug: 'gift-city-page',
    req,
    context: { disableRevalidate: true },
    data: { disclosures: giftCityDisclosures },
  })
  return true
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await fillGiftDisclosures(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; the fields themselves are removed by 20261123_050340_gift_disclosures.
}
