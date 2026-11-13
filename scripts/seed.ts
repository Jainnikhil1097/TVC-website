// One-time import of the site's original content (scripts/seed-data/*.ts) into the CMS.
//
//   npm run seed            # skips anything that already has content
//   npm run seed -- --reset # deletes existing content first (never users)
//
// Uses DATABASE_URL from .env (SQLite locally, Postgres in production).
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { site, metrics, funds, investmentCriteria } = await import("./seed-data/site");
const { portfolio } = await import("./seed-data/portfolio");
const { teamGroups } = await import("./seed-data/team");
const { news, substackUrl, youtubeUrl } = await import("./seed-data/perspectives");
const { investmentSectors } = await import("./seed-data/sectors");
const { impact } = await import("./seed-data/impact");
const { giftCity } = await import("./seed-data/gift-city");

const reset = process.argv.includes("--reset");
const payload = await getPayload({ config });
const context = { disableRevalidate: true };
const log = (msg: string) => console.log(`[seed] ${msg}`);

type Slug = "companies" | "team" | "news" | "funds";

async function isEmpty(collection: Slug) {
  if (reset) {
    await payload.delete({ collection, where: { id: { exists: true } }, context });
    return true;
  }
  const { totalDocs } = await payload.count({ collection });
  if (totalDocs > 0) log(`${collection}: already has ${totalDocs} entries — skipped`);
  return totalDocs === 0;
}

// ─── Portfolio ───────────────────────────────────────────────────────────────
// Recent investments with published investment notes, shown in the home page's
// Featured portfolio tabs (editors can change this in the CMS).
const FEATURED = ["suind", "albatross-energetics", "prithu", "workongrid"];

const companyIds = new Map<string, number>();
if (await isEmpty("companies")) {
  for (const [i, c] of portfolio.entries()) {
    const doc = await payload.create({
      collection: "companies",
      context,
      data: {
        name: c.name,
        slug: c.slug,
        summary: c.summary,
        sector: c.sector,
        stage: c.stage,
        yearInvested: c.yearInvested,
        website: c.website,
        status: "active",
        featured: FEATURED.includes(c.slug),
        founders: c.founders?.map((f) => ({ name: f.name, title: f.title })),
        order: (i + 1) * 10,
        _status: "published",
      },
    });
    companyIds.set(c.slug, doc.id);
  }
  log(`companies: ${portfolio.length} added`);
} else {
  const { docs } = await payload.find({ collection: "companies", limit: 500, draft: true });
  docs.forEach((d) => d.slug && companyIds.set(d.slug, d.id));
}

// ─── Team ────────────────────────────────────────────────────────────────────
if (await isEmpty("team")) {
  let n = 0;
  for (const group of teamGroups) {
    for (const [i, p] of group.people.entries()) {
      await payload.create({
        collection: "team",
        context,
        data: {
          name: p.name,
          title: p.title,
          group: group.id,
          linkedin: p.linkedin,
          order: (i + 1) * 10,
          _status: "published",
        },
      });
      n++;
    }
  }
  log(`team: ${n} added`);
}

// ─── News, funds ─────────────────────────────────────────────────────────────
if (await isEmpty("news")) {
  for (const item of news) await payload.create({ collection: "news", context, data: item });
  log(`news: ${news.length} added`);
}

if (await isEmpty("funds")) {
  // Size/status/description from public statements on the current site and press.
  const details: Record<string, { size?: string; status: "raising" | "investing" | "deployed" | "closed"; description?: string; showOnHome?: boolean }> = {
    "IN/AIF2/22-23/1174": {
      size: "₹723 Cr",
      status: "investing",
      description: "Oversubscribed and closed. Backing engineering-led energy-transition startups from Pre-Seed to Series A.",
      showOnHome: true,
    },
    "IN/AIF2/26-27/2146": {
      size: "₹1,500 Cr",
      status: "raising",
      description: "To back 20–23 hardware and deeptech startups building India's energy future.",
      showOnHome: true,
    },
  };
  for (const [i, f] of funds.entries()) {
    const d = details[f.sebiRegistration] ?? { status: "investing" as const };
    await payload.create({
      collection: "funds",
      context,
      data: {
        name: f.name,
        sebiCategory: f.category,
        sebiRegistration: f.sebiRegistration,
        manager: f.manager,
        order: (i + 1) * 10,
        ...d,
      },
    });
  }
  log(`funds: ${funds.length} added`);
}

// ─── Globals ─────────────────────────────────────────────────────────────────
// Single documents. Only written when still empty, so re-running the seed (for
// example against production) never overwrites what editors have changed.
type GlobalSlug =
  | "site"
  | "fund-metrics"
  | "home-sectors"
  | "home-page"
  | "impact-page"
  | "gift-city-page"
  | "announcement";

async function fillGlobal(slug: GlobalSlug, isEmpty: (doc: Record<string, unknown>) => boolean, data: Record<string, unknown>) {
  const doc = (await payload.findGlobal({ slug })) as unknown as Record<string, unknown>;
  if (!reset && !isEmpty(doc)) {
    log(`${slug}: already filled — skipped`);
    return;
  }
  await payload.updateGlobal({ slug, context, data: data as never });
  log(`${slug}: written`);
}

const emptyArray = (key: string) => (doc: Record<string, unknown>) => !(doc[key] as unknown[] | undefined)?.length;
const emptyText = (key: string) => (doc: Record<string, unknown>) => !doc[key];

await fillGlobal("site", emptyText("tagline"), {
  tagline: site.tagline,
  hero: site.hero,
  about: site.about,
  approach: site.approach,
  thesis: site.thesis,
  stage: investmentCriteria.stage,
  cheque: investmentCriteria.cheque,
  footerHeadline: site.footerHeadline,
  newsletterBlurb: site.newsletterBlurb,
  email: site.contact.email,
  address: site.contact.address.join("\n"),
  mapUrl: site.contact.mapUrl,
  investorLoginUrl: site.investorLoginUrl || undefined,
  socials: site.socials.filter((s) => s.label !== "Substack").map((s) => ({ label: s.label, url: s.href })),
  substackUrl,
  youtubeUrl,
});

// Headline figures for the home page: fund size, portfolio, write-offs, IRR.
const HEADLINE = ["Fund I raised", "Active portfolio companies", "Write-offs", "Gross IRR"];
await fillGlobal("fund-metrics", emptyArray("items"), {
  items: metrics.map((m) => ({ value: m.value, label: m.label, note: m.note, showOnHome: HEADLINE.includes(m.label) })),
  asOf: "2026-03-31",
});

await fillGlobal("home-sectors", emptyArray("sectors"), {
  sectors: investmentSectors.map((s) => ({ name: s.name, line: s.line, portfolioSector: s.portfolioSector })),
});

// Draft copy drawn from the fund's published thesis — for Transition VC to review in the CMS.
await fillGlobal("home-page", emptyText("positioning"), {
  positioning: "India's first energy-transition venture fund",
  pillars: [
    {
      title: "Engineering-first",
      icon: "engineering",
      text: "We underwrite the technology itself, and back teams solving hard physical bottlenecks.",
    },
    {
      title: "Early, catalytic capital",
      icon: "capital",
      text: `${investmentCriteria.stage} cheques of ${investmentCriteria.cheque}, when conviction matters most.`,
    },
    {
      title: "Built for India",
      icon: "india",
      text: "We back products and cost structures designed for India's energy transition.",
    },
    {
      title: "Energy is all we do",
      icon: "energy",
      text: "Mobility, industry, storage, alternate fuels and more — one focus, deep context.",
    },
    {
      title: "Beyond subsidies",
      icon: "growth",
      text: "We look for economics that work without relying on subsidies or regulatory timing.",
    },
  ],
  faq: [
    { question: "What stage do you invest at?", answer: `${investmentCriteria.stage}.` },
    { question: "How much do you invest?", answer: `Typically ${investmentCriteria.cheque} per company.` },
    {
      question: "Which sectors do you invest in?",
      answer:
        "Mobility, Industrial, Buildings, Renewable Tech, Alternative Fuels, Power Electronics, Energy Storage and Sustainability.",
    },
    {
      question: "What do you look for?",
      answer:
        "Engineering-led teams solving hard physical bottlenecks — companies that own a specific layer of the stack, with India-first cost structures and economics that don't depend on subsidies or regulatory timing.",
    },
    {
      question: "Do you lead rounds?",
      answer:
        "Yes. We have led rounds such as SUIND's seed and Albatross Energetics' Pre-Series A, and we also invest alongside other funds.",
    },
    {
      question: "How do I pitch to you?",
      answer:
        "Send your deck through the Startups & Founders form on our Contact page (PDF or PowerPoint, up to 10 MB). We read every deck.",
    },
  ],
});

await fillGlobal("impact-page", emptyText("headline"), {
  eyebrow: impact.eyebrow,
  headline: impact.headline,
  intro: impact.intro,
  stats: impact.stats,
  themes: impact.themes.map((t) => ({
    title: t.title,
    body: t.body,
    companies: t.companies.map((slug) => companyIds.get(slug)).filter((id): id is number => id !== undefined),
  })),
});

await fillGlobal("gift-city-page", emptyText("headline"), {
  eyebrow: giftCity.eyebrow,
  headline: giftCity.headline,
  intro: giftCity.intro,
  highlights: giftCity.highlights,
  ctaLabel: giftCity.cta.label,
  ctaHref: giftCity.cta.href,
});

log("done");
process.exit(0);
