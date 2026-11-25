import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { founderPillars } from '../scripts/seed-data/founder-pillars'
import { sdgGoals } from '../scripts/seed-data/impact-content'
import { investmentCriteria } from '../scripts/seed-data/site'

// Client feedback, 25 Nov 2026. Each change applies only while the content is still the
// earlier version, so an editor's own wording is never overwritten:
//   - "Why founders choose us": due diligence dropped; PR & communications and corporate
//     connections & business development split into two points (corporate connections
//     becomes point 2).
//   - Impact page, SDG 5 (Gender Equality): women in leadership, the women heading
//     departments, and women's share of the team, one line each.
//   - Site settings: the cheque size in US dollars, for the About page's INR / USD switch.
// Runs after 20261125_101456_nov25_feedback, which adds the USD field.

const AUG_PILLARS = [
  'Deep-Tech & Engineering Expertise',
  'Rigorous Technical & Commercial Due Diligence',
  'Capital & Fundraising Support and Dedicated Portfolio Management',
  'Talent & Niche Technical Hiring',
  'Grants & Non-Dilutive Funding',
  'PR, Communications & Brand Building and Corporate Connections & Business Development',
  'Events & Ecosystem Access',
  'Portfolio Synergies and Founder-First Culture',
]

const EARLIER_GENDER = ['Navi Sharma', 'Yashodhara Bakliwal', 'Marketing', 'People & Operations']
const EARLIER_GENDER_SUMMARY = 'Women lead portfolio growth, corporate partnerships, marketing, and people operations.'
const EARLIER_CHEQUE = '₹20 Cr – ₹50 Cr'

export async function applyNov25Feedback(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  const done: string[] = []

  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, req })
  const pillars = home.pillars ?? []
  if (pillars.length && pillars.every((p) => AUG_PILLARS.includes(p.title)) && pillars.some((p) => p.title === AUG_PILLARS[1])) {
    await payload.updateGlobal({
      slug: 'home-page',
      req,
      context,
      data: { pillars: founderPillars.map((p) => ({ title: p.title, icon: p.icon, points: p.points.map((text) => ({ text })) })) },
    })
    done.push('pillars')
  }

  const impact = await payload.findGlobal({ slug: 'impact-page', depth: 0, req })
  const goals = impact.sdgs?.goals ?? []
  const gender = goals.find((g) => g.number === 5)
  const labels = (gender?.entries ?? []).map((e) => e.label ?? '')
  const seed = sdgGoals.find((g) => g.number === 5)
  if (gender && seed && labels.length && labels.every((l) => EARLIER_GENDER.includes(l))) {
    const next = goals.map((g) =>
      g.number !== 5
        ? g
        : {
            ...g,
            summary: !g.summary || g.summary === EARLIER_GENDER_SUMMARY ? seed.summary : g.summary,
            entries: seed.entries.map((e) => ({ label: e.label, connection: e.connection, measures: e.measures })),
          }
    )
    await payload.updateGlobal({ slug: 'impact-page', req, context, data: { sdgs: { ...impact.sdgs, goals: next } } })
    done.push('gender equality')
  }

  const site = await payload.findGlobal({ slug: 'site', depth: 0, req })
  if (!site.chequeUsd && site.cheque === EARLIER_CHEQUE) {
    await payload.updateGlobal({ slug: 'site', req, context, data: { chequeUsd: investmentCriteria.chequeUsd } })
    done.push('cheque in USD')
  }
  return done
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyNov25Feedback(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; earlier wording can be restored from each page's version history.
}
