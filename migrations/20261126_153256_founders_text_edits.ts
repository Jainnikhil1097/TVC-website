import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { portfolio } from '../scripts/seed-data/portfolio'
import edits from './data/20261126-text-edits.json'

// 26 Nov 2026 (the team):
//   - Founders for every Fund I company, from the team's company list, filled in where a
//     company has none yet.
//   - Copy without em dashes ("it reads as AI-written"), and the About text no longer
//     repeats the headline. Each text changes only while it's still the earlier wording
//     (data/20261126-text-edits.json maps earlier → new), so editors' changes are kept.

const TEXT = edits as Record<string, string>
const swap = (v?: string | null) => (v && TEXT[v] !== undefined ? TEXT[v] : v)
const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b)

export async function applyFoundersAndText(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  const done: string[] = []

  const { docs } = await payload.find({ collection: 'companies', limit: 500, depth: 0, req })
  for (const c of docs) {
    const seed = portfolio.find((p) => p.slug === c.slug)
    const data: Record<string, unknown> = {}
    if (!(c.founders ?? []).length && seed?.founders?.length) {
      data.founders = seed.founders.map((f) => ({ name: f.name, title: f.title }))
    }
    for (const field of ['summary', 'marketGap', 'breakthrough', 'whyTheyWin', 'marketOpportunity'] as const) {
      const next = swap(c[field])
      if (next !== c[field]) data[field] = next
    }
    const traction = (c.traction ?? []).map((t) => ({ ...t, point: swap(t.point) ?? t.point }))
    if (changed(traction, c.traction ?? [])) data.traction = traction
    const callouts = (c.callouts ?? []).map((k) => ({ ...k, label: swap(k.label) ?? k.label, detail: swap(k.detail) }))
    if (changed(callouts, c.callouts ?? [])) data.callouts = callouts
    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'companies', id: c.id, req, context, data })
    done.push(`${c.name}: ${Object.keys(data).join(', ')}`)
  }

  const site = await payload.findGlobal({ slug: 'site', depth: 0, req })
  if (swap(site.about) !== site.about) {
    await payload.updateGlobal({ slug: 'site', req, context, data: { about: swap(site.about) ?? '' } })
    done.push('site: about')
  }

  const sectors = await payload.findGlobal({ slug: 'home-sectors', depth: 0, req })
  const lines = (sectors.sectors ?? []).map((s) => ({ ...s, line: swap(s.line) ?? s.line }))
  if (changed(lines, sectors.sectors ?? [])) {
    await payload.updateGlobal({ slug: 'home-sectors', req, context, data: { sectors: lines } })
    done.push('home sectors')
  }

  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, req })
  const faq = (home.faq ?? []).map((f) => ({ ...f, answer: swap(f.answer) ?? f.answer }))
  if (changed(faq, home.faq ?? [])) {
    await payload.updateGlobal({ slug: 'home-page', req, context, data: { faq } })
    done.push('founder FAQ')
  }

  const about = await payload.findGlobal({ slug: 'about-page', depth: 0, req })
  const nextSteps = (about.nextSteps ?? []).map((c) => ({ ...c, body: swap(c.body) ?? c.body }))
  if (changed(nextSteps, about.nextSteps ?? [])) {
    await payload.updateGlobal({ slug: 'about-page', req, context, data: { nextSteps } })
    done.push('about: closing cards')
  }

  const gift = await payload.findGlobal({ slug: 'gift-city-page', depth: 0, req })
  if (swap(gift.intro) !== gift.intro) {
    await payload.updateGlobal({ slug: 'gift-city-page', req, context, data: { intro: swap(gift.intro) ?? '' } })
    done.push('gift city: intro')
  }
  return done
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyFoundersAndText(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; earlier wording can be restored from each document's version history.
}
