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
const { roles } = await import("./seed-data/careers");
const { investmentSectors } = await import("./seed-data/sectors");
const { impact } = await import("./seed-data/impact");
const { giftCity } = await import("./seed-data/gift-city");

const reset = process.argv.includes("--reset");
const payload = await getPayload({ config });
const context = { disableRevalidate: true };
const log = (msg: string) => console.log(`[seed] ${msg}`);

type Slug = "companies" | "team" | "news" | "jobs" | "funds";

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

// ─── News, jobs, funds ───────────────────────────────────────────────────────
if (await isEmpty("news")) {
  for (const item of news) await payload.create({ collection: "news", context, data: item });
  log(`news: ${news.length} added`);
}

if (await isEmpty("jobs")) {
  for (const [i, r] of roles.entries()) {
    await payload.create({
      collection: "jobs",
      context,
      data: { ...r, open: true, order: (i + 1) * 10 },
    });
  }
  log(`jobs: ${roles.length} added`);
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

// ─── Globals (always written; they're single documents) ─────────────────────
await payload.updateGlobal({
  slug: "site",
  context,
  data: {
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
  },
});

await payload.updateGlobal({
  slug: "fund-metrics",
  context,
  data: {
    items: metrics.map((m) => ({ value: m.value, label: m.label, note: m.note })),
    asOf: "2026-03-31",
  },
});

await payload.updateGlobal({
  slug: "home-sectors",
  context,
  data: {
    sectors: investmentSectors.map((s) => ({ name: s.name, line: s.line, portfolioSector: s.portfolioSector })),
  },
});

await payload.updateGlobal({
  slug: "impact-page",
  context,
  data: {
    eyebrow: impact.eyebrow,
    headline: impact.headline,
    intro: impact.intro,
    stats: impact.stats,
    themes: impact.themes.map((t) => ({
      title: t.title,
      body: t.body,
      companies: t.companies.map((slug) => companyIds.get(slug)).filter((id): id is number => id !== undefined),
    })),
  },
});

await payload.updateGlobal({
  slug: "gift-city-page",
  context,
  data: {
    eyebrow: giftCity.eyebrow,
    headline: giftCity.headline,
    intro: giftCity.intro,
    highlights: giftCity.highlights,
    ctaLabel: giftCity.cta.label,
    ctaHref: giftCity.cta.href,
  },
});

await payload.updateGlobal({ slug: "announcement", context, data: { enabled: false } });

log("globals: site, fund-metrics, home-sectors, impact-page, gift-city-page, announcement written");
log("done");
process.exit(0);
