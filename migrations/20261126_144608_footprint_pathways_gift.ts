import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

// Feedback 26 Nov 2026 (the team). Each change applies only while the content is still
// the earlier version, so an editor's own changes are kept:
//   - Impact footprint: Netherlands, Switzerland and Australia (no company attached yet)
//     are removed; GreenTech's Sri Lanka operations were discontinued and it now operates
//     in Vietnam, so that country becomes Vietnam.
//   - Impact pathways: EarthEn moves to "Use less energy"; EMO Energy is no longer listed
//     under "Enable cleaner energy".
//   - GIFT City highlights: the "[Placeholder]" tags are removed, and Governance names
//     the independent trustee.

const DROP_IF_EMPTY = ['Netherlands', 'Switzerland', 'Australia']
const VIETNAM = {
  name: 'Vietnam',
  lat: 14.06,
  lon: 108.28,
  value: '',
  valueLabel: '',
  detail: 'Wind-turbine maintenance and SCADA operations.',
  source: 'The team, Nov 2026.',
}
const OLD_GOVERNANCE = 'Dedicated GIFT City compliance function and independent administration. [Placeholder]'
const NEW_GOVERNANCE = 'A dedicated GIFT City compliance function and an independent trustee, Orbis Trusteeship Services.'

type Rel = number | { id: number; slug?: string | null } | null | undefined
const idOf = (c: Rel) => (c && typeof c === 'object' ? c.id : c) as number | undefined

export async function applyFootprintPathwaysGift(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  const done: string[] = []

  const { docs: companies } = await payload.find({ collection: 'companies', limit: 500, depth: 0, req })
  const id = (slug: string) => companies.find((c) => c.slug === slug)?.id

  const impact = await payload.findGlobal({ slug: 'impact-page', depth: 0, req })

  // Footprint countries.
  const countries = impact.footprint?.countries ?? []
  const nextCountries = countries
    .filter((c) => !(DROP_IF_EMPTY.includes(c.name) && !(c.companies ?? []).length))
    .map((c) => (c.name === 'Sri Lanka' ? { ...c, ...VIETNAM } : c))
  const footprintChanged =
    nextCountries.length !== countries.length || nextCountries.some((c, i) => c.name !== countries[i]?.name)

  // Pathways: by title, only while they still list the earlier companies.
  const pathways = impact.pathways ?? []
  const earthen = id('earthen')
  const emo = id('emo-energy')
  let pathwaysChanged = false
  const nextPathways = pathways.map((p) => {
    const list = ((p.companies ?? []) as Rel[]).map(idOf).filter((x): x is number => typeof x === 'number')
    if (p.title === 'Use less energy' && earthen && !list.includes(earthen)) {
      pathwaysChanged = true
      return { ...p, companies: [...list, earthen] }
    }
    if (p.title === 'Enable cleaner energy' && list.some((x) => x === emo || x === earthen)) {
      pathwaysChanged = true
      return { ...p, companies: list.filter((x) => x !== emo && x !== earthen) }
    }
    return { ...p, companies: list }
  })

  if (footprintChanged || pathwaysChanged) {
    await payload.updateGlobal({
      slug: 'impact-page',
      req,
      context,
      data: {
        ...(pathwaysChanged ? { pathways: nextPathways } : {}),
        ...(footprintChanged ? { footprint: { ...impact.footprint, countries: nextCountries } } : {}),
      },
    })
    if (footprintChanged) done.push('footprint countries')
    if (pathwaysChanged) done.push('pathways')
  }

  // GIFT City highlights.
  const gift = await payload.findGlobal({ slug: 'gift-city-page', depth: 0, req })
  const highlights = gift.highlights ?? []
  if (highlights.some((h) => (h.body ?? '').includes('[Placeholder]'))) {
    await payload.updateGlobal({
      slug: 'gift-city-page',
      req,
      context,
      data: {
        highlights: highlights.map((h) => ({
          ...h,
          body: h.body === OLD_GOVERNANCE ? NEW_GOVERNANCE : (h.body ?? '').replace(/\s*\[Placeholder\]\s*$/, ''),
        })),
      },
    })
    done.push('gift city highlights')
  }
  return done
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyFootprintPathwaysGift(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; earlier versions can be restored from each page's version history.
}
