import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

// Home page content from the 20 Nov 2026 client feedback (Aditi, TVC):
//   - "Where we invest": Buildings → Built Environment, add Semiconductors, drop
//     Sustainability, in the new order.
//   - "Why founders choose us": keep the first three points, replace the last two with
//     five new ones (talent, grants, PR & business development, events, synergies).
//   - Founder FAQ: cheque size in rupees, the new sector list, pitch answer for the
//     Contact page (where the FAQ now lives).
// Each change applies only while the content is still the original wording, so an
// editor's own changes are never overwritten. Runs after 20261120_114545_home_content,
// which adds the new icon options (Postgres can't use a new enum value in the same
// transaction that adds it).

const OLD_CHEQUE = '$0.5M – $5M'
const NEW_CHEQUE = '₹20 Cr – ₹50 Cr'

const SECTORS = [
  { name: 'Mobility', line: 'Motors, drivetrains and batteries that make electric the default for how India moves.', portfolioSector: 'mobility' },
  { name: 'Industrial', line: 'Decarbonising heat, cooling and process — the hardest emissions in Indian industry.', portfolioSector: 'industrial' },
  { name: 'Built Environment', line: 'Efficient cooling, lighting and energy management for the buildings and cities India is yet to build.' },
  { name: 'Semiconductors', line: 'Chips, wide-bandgap devices and substrates that make power conversion and sensing more efficient.' },
  { name: 'Power Electronics', line: 'Converters, chargers and control that sit between every source and every load.' },
  { name: 'Renewable Tech', line: 'Technology that makes wind and solar assets generate more, for longer.', portfolioSector: 'renewables' },
  { name: 'Energy Storage', line: 'Safer, longer-lasting storage for vehicles, the grid and critical backup.' },
  { name: 'Alt Fuels', line: 'Hydrogen and alternative fuels, produced and used where industry needs them.', portfolioSector: 'hydrogen' },
] as const

const REMOVED_PILLARS = ['Energy is all we do', 'Beyond subsidies']
const NEW_PILLARS = [
  { title: 'Talent & technical hiring', icon: 'talent', text: 'Help hiring niche engineers and senior leaders, from specialised technical roles to CXOs, to build and scale your team.' },
  { title: 'Grants & non-dilutive funding', icon: 'grants', text: 'Help finding and applying for government grants, incentives and programmes that fund R&D, manufacturing and technology.' },
  { title: 'Brand, PR & business development', icon: 'communications', text: 'Communications that build credibility, and introductions to corporates, customers and our LP network to open new markets.' },
  { title: 'Events & ecosystem access', icon: 'events', text: 'Curated LP mixers, showcases and conferences that put you in front of customers, investors and industry leaders.' },
  { title: 'Portfolio synergies, founder-first', icon: 'partnership', text: "A portfolio built to compound, not compete: companies become each other's customers and partners, with us alongside." },
] as const

const FAQ_ANSWERS: Record<string, [string, string]> = {
  sectors: [
    'Mobility, Industrial, Buildings, Renewable Tech, Alternative Fuels, Power Electronics, Energy Storage and Sustainability.',
    'Mobility, Industrial, Built Environment, Semiconductors, Power Electronics, Renewable Tech, Energy Storage and Alternative Fuels.',
  ],
  pitch: [
    'Send your deck through the Startups & Founders form on our Contact page (PDF or PowerPoint, up to 10 MB). We read every deck.',
    'Send your deck through the Startups & Founders form on this page (PDF or PowerPoint, up to 10 MB). We read every deck.',
  ],
}

const rupees = (text: string) => text.split(OLD_CHEQUE).join(NEW_CHEQUE)

/** Applies the content changes (shared with the local one-off script). */
export async function applyHomeContent(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }

  const sectors = await payload.findGlobal({ slug: 'home-sectors', req, depth: 0 })
  if ((sectors.sectors ?? []).some((s) => s.name === 'Sustainability' || s.name === 'Buildings')) {
    await payload.updateGlobal({ slug: 'home-sectors', req, context, data: { sectors: SECTORS.map((s) => ({ ...s })) } })
  }

  const home = await payload.findGlobal({ slug: 'home-page', req, depth: 0 })
  const pillars = home.pillars ?? []
  const nextPillars = pillars.some((p) => REMOVED_PILLARS.includes(p.title))
    ? [
        ...pillars.filter((p) => !REMOVED_PILLARS.includes(p.title)).map((p) => ({ title: p.title, icon: p.icon, text: rupees(p.text ?? "") })),
        ...NEW_PILLARS.map((p) => ({ ...p })),
      ]
    : pillars.map((p) => ({ title: p.title, icon: p.icon, text: rupees(p.text ?? "") }))
  const faq = (home.faq ?? []).map((f) => {
    const replaced = Object.values(FAQ_ANSWERS).find(([from]) => from === f.answer)
    return { question: f.question, answer: replaced ? replaced[1] : rupees(f.answer) }
  })
  await payload.updateGlobal({ slug: 'home-page', req, context, data: { pillars: nextPillars, faq } })
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await applyHomeContent(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only: nothing to undo structurally; editors can restore wording from the
  // Home page's version history in the CMS.
}
