import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { site } from '../scripts/seed-data/site'

// 25 Nov 2026 (the team):
//   - Contact page: "Explore careers" with the HR address, under General Enquiries
//     (filled only while the new field is empty).
//   - GIFT City disclosures: the fund is "Transition VC Gift Fund", without the "I"
//     (renamed only while it's still the earlier name).
// Runs after 20261125_114203_careers_email, which adds the careers field.

const EARLIER_FUND = 'Transition VC Gift Fund I'
const FUND = 'Transition VC Gift Fund'

export async function applyCareersAndGift(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  const done: string[] = []

  const settings = await payload.findGlobal({ slug: 'site', depth: 0, req })
  if (!settings.careersEmail && settings.email) {
    await payload.updateGlobal({ slug: 'site', req, context, data: { careersEmail: site.contact.careersEmail } })
    done.push('careers email')
  }

  const gift = await payload.findGlobal({ slug: 'gift-city-page', depth: 0, req })
  const funds = gift.disclosures?.funds ?? []
  if (funds.some((f) => f.name === EARLIER_FUND)) {
    await payload.updateGlobal({
      slug: 'gift-city-page',
      req,
      context,
      data: { disclosures: { ...gift.disclosures, funds: funds.map((f) => (f.name === EARLIER_FUND ? { ...f, name: FUND } : f)) } },
    })
    done.push('gift fund name')
  }
  return done
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyCareersAndGift(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; earlier values can be restored from each page's version history.
}
