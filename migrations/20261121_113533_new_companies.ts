import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

// Three portfolio companies added on 21 Nov 2026 from the team's company list
// ("Website Ideas and Link" PDF): EarthEn (Fund I), Perovskia Solar and Two Point O
// (Fund II; both were withheld as pipeline deals until the team confirmed them).
// Creates each one only if no company with that slug exists, published and visible,
// listed first. Logos, product images and one-pager details are files and longer text:
// run  npm run company:logos  and  npm run company:onepagers  against the database too.

type NewCompany = {
  slug: string
  name: string
  summary: string
  sector: 'utility-grid' | 'renewables' | 'platforms'
  stage: 'Seed' | 'Pre-Series A' | 'Series A'
  fund: 'fund-1' | 'fund-2'
  website: string
  founders: string[]
}

const COMPANIES: NewCompany[] = [
  {
    slug: 'earthen',
    name: 'EarthEn',
    summary: 'CO₂-based thermal batteries for long-duration energy storage and clean industrial heat.',
    sector: 'utility-grid',
    stage: 'Seed',
    fund: 'fund-1',
    website: 'https://www.earthen.energy/',
    founders: ['Manas Pathak'],
  },
  {
    slug: 'perovskia-solar',
    name: 'Perovskia Solar',
    summary:
      'Inkjet-printed, custom-shaped perovskite solar cells that let electronics and IoT devices run on indoor light instead of batteries.',
    sector: 'renewables',
    stage: 'Pre-Series A',
    fund: 'fund-2',
    website: 'https://perovskia.solar/',
    founders: ['Toby Meyer', 'Anand Verma'],
  },
  {
    slug: 'two-point-o',
    name: 'Two Point O',
    summary:
      'Opex-as-a-Service for clean-energy infrastructure: it selects, funds and owns the equipment, and leases it to businesses with a performance warranty.',
    sector: 'platforms',
    stage: 'Series A',
    fund: 'fund-2',
    website: 'https://twopointo.capital/',
    founders: ['Manya Ranjan', 'Karan Bhutani', 'Archit Mehrotra', 'Shashidhar Reddy'],
  },
]

/** Creates the companies that don't exist yet (shared with the local one-off script). */
export async function addNewCompanies(payload: Payload, req?: PayloadRequest) {
  const created: string[] = []
  // A brand-new, empty database is filled by the seed (npm run seed), which already includes
  // these companies; adding them here first would make the seed skip all the others.
  if ((await payload.count({ collection: 'companies', req })).totalDocs === 0) return created
  for (const [i, c] of COMPANIES.entries()) {
    const { totalDocs } = await payload.count({ collection: 'companies', where: { slug: { equals: c.slug } }, req })
    if (totalDocs > 0) continue
    await payload.create({
      collection: 'companies',
      req,
      context: { disableRevalidate: true },
      data: {
        name: c.name,
        slug: c.slug,
        summary: c.summary,
        sector: c.sector,
        stage: c.stage,
        fund: c.fund,
        yearInvested: 2026,
        website: c.website,
        status: 'active',
        featured: false,
        founders: c.founders.map((name) => ({ name })),
        showOnSite: true,
        // Listed first (existing companies are ordered from 10 upwards).
        order: i + 1,
        _status: 'published',
      },
    })
    created.push(c.name)
  }
  return created
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await addNewCompanies(payload, req)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'companies',
    req,
    where: { slug: { in: COMPANIES.map((c) => c.slug) } },
    context: { disableRevalidate: true },
  })
}
