import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { founderPillars } from '../scripts/seed-data/founder-pillars'

// "Why founders choose us" becomes the team's 8 points (Aditi, 20 Nov 2026) with their
// bullet points, shown as a spiral with pop-ups. Replaces the pillars only while they're
// still the earlier set (matched by heading), so an editor's own pillars are kept.
// Runs after 20261124_093917_pillar_points, which adds the points field.

const EARLIER = [
  'Engineering-first',
  'Early, catalytic capital',
  'Built for India',
  'Talent & technical hiring',
  'Grants & non-dilutive funding',
  'Brand, PR & business development',
  'Events & ecosystem access',
  'Portfolio synergies, founder-first',
  'Energy is all we do',
  'Beyond subsidies',
]

export async function applyFounderPillars(payload: Payload, req?: PayloadRequest) {
  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, req })
  const current = home.pillars ?? []
  if (current.length && !current.every((p) => EARLIER.includes(p.title))) return false
  await payload.updateGlobal({
    slug: 'home-page',
    req,
    context: { disableRevalidate: true },
    data: { pillars: founderPillars.map((p) => ({ title: p.title, icon: p.icon, points: p.points.map((text) => ({ text })) })) },
  })
  return true
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyFounderPillars(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; earlier wording can be restored from the Home page's version history.
}
