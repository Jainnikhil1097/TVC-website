import "server-only";
import { cache } from "react";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type { Company as CmsCompany, Media } from "@/payload-types";
import type {
  Company,
  Essay,
  EventItem,
  Fund,
  Image,
  Link,
  Metric,
  NewsItem,
  Person,
  PortfolioSectorId,
  Report,
  Video,
} from "./types";
import { teamGroupOptions, type PageKey } from "./taxonomy";
import { aboutPageDefaults, perspectivesPageDefaults, portfolioPageDefaults } from "./page-copy";
import { sectorIconFor } from "./sector-icons";
import { basePath, isStaticPreview } from "./base-path";
import { siteIdentity } from "./site-config";
import { getSubstackEssays, getYouTubeVideos } from "./feeds";

// Typed read access to CMS content for server components. Every getter maps CMS
// documents onto the site's own types (lib/types.ts). React's cache() dedupes
// calls within one render; Next's ISR + the CMS revalidation hook handle freshness.

const payload = cache(() => getPayload({ config }));

const published: Where = { _status: { equals: "published" } };
const visible: Where = { showOnSite: { not_equals: false } };

// ─── Mapping helpers ─────────────────────────────────────────────────────────

/**
 * Uploads stored on local disk are served by the CMS at /api/media/file/<name>. The
 * static preview has no CMS server, so there they point at copies saved alongside
 * the pages (scripts/build-pages.mjs copies media/ into out/media/).
 */
function fileUrl(url: string) {
  return isStaticPreview ? url.replace(/^(https?:\/\/[^/]+)?\/api\/media\/file\//, `${basePath}/media/`) : url;
}

function image(media: number | Media | null | undefined, size?: "card" | "portrait" | "thumbnail"): Image | undefined {
  if (!media || typeof media === "number") return undefined;
  const sized = size ? media.sizes?.[size] : undefined;
  const url = sized?.url || media.url;
  if (!url) return undefined;
  return {
    url: fileUrl(url),
    alt: media.alt,
    width: (sized?.url ? sized.width : media.width) ?? undefined,
    height: (sized?.url ? sized.height : media.height) ?? undefined,
    focal: media.focalX != null && media.focalY != null ? { x: media.focalX, y: media.focalY } : undefined,
  };
}

const orUndefined = <T,>(v: T | null | undefined) => (v === null ? undefined : v);

/** Normalises URLs so "https://x.substack.com/p/a/?utm=1" matches "https://x.substack.com/p/a". */
export function sameUrl(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const norm = (u: string) => {
    try {
      const url = new URL(u);
      return (url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/$/, "")).toLowerCase();
    } catch {
      return u.toLowerCase();
    }
  };
  return norm(a) === norm(b);
}

function mapCompany(doc: CmsCompany): Company {
  return {
    slug: doc.slug ?? String(doc.id),
    name: doc.name,
    summary: doc.summary,
    sector: doc.sector,
    stage: doc.stage,
    yearInvested: doc.yearInvested,
    fund: doc.fund ?? "fund-1",
    website: doc.website,
    status: doc.status,
    exitYear: orUndefined(doc.exitYear),
    exitNote: orUndefined(doc.exitNote),
    featured: Boolean(doc.featured),
    homeOrder: orUndefined(doc.homeOrder),
    logo: image(doc.logo, "card"),
    coverImage: image(doc.coverImage, "card"),
    founders: doc.founders?.map((f) => ({
      name: f.name,
      title: orUndefined(f.title),
      linkedin: orUndefined(f.linkedin),
      photo: image(f.photo, "thumbnail")?.url,
    })),
    whyWeInvested: orUndefined(doc.whyWeInvested),
    essayUrl: orUndefined(doc.essayUrl),
    videoUrl: orUndefined(doc.videoUrl),
    productImage: image(doc.productImage),
    callouts: doc.callouts?.map((c) => ({ label: c.label, detail: orUndefined(c.detail), x: c.x, y: c.y })),
    proof: doc.proofValue && doc.proofLabel ? { value: doc.proofValue, label: doc.proofLabel } : undefined,
    marketGap: orUndefined(doc.marketGap),
    breakthrough: orUndefined(doc.breakthrough),
    whyTheyWin: orUndefined(doc.whyTheyWin),
  };
}

// ─── Globals ─────────────────────────────────────────────────────────────────

export const getSite = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "site", depth: 1 });
  const socials: Link[] = (doc.socials ?? []).map((s) => ({ label: s.label, href: s.url }));
  return {
    ...siteIdentity,
    tagline: doc.tagline ?? "",
    hero: doc.hero ?? "",
    about: doc.about ?? "",
    approach: doc.approach ?? "",
    thesis: doc.thesis ?? "",
    footerHeadline: doc.footerHeadline ?? "",
    newsletterBlurb: doc.newsletterBlurb ?? "",
    investmentCriteria: { stage: doc.stage ?? "", cheque: doc.cheque ?? "", chequeUsd: (doc.chequeUsd ?? "").trim() },
    contact: {
      email: doc.email ?? "",
      careersEmail: (doc.careersEmail ?? "").trim(),
      offices: (doc.offices ?? [])
        .map((o) => ({
          name: o.name,
          address: (o.address ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
          mapUrl: o.mapUrl ?? "",
        }))
        .filter((o) => o.address.length > 0),
    },
    investorLoginUrl: doc.investorLoginUrl ?? "",
    socials,
    substackUrl: doc.substackUrl ?? "https://transitionventurecapital.substack.com",
    youtubeUrl: doc.youtubeUrl ?? "",
    youtubeChannelId: doc.youtubeChannelId ?? "",
    videos: (doc.videos ?? []).map((v) => ({ title: v.title, url: v.url, date: orUndefined(v.date) })),
    policies: (doc.policies ?? [])
      .map((p) => ({ label: p.label, href: image(p.file)?.url ?? "" }))
      .filter((p) => p.href),
    defaultShareImage: image(doc.defaultShareImage, "card"),
  };
});

export type Site = Awaited<ReturnType<typeof getSite>>;

export const getMetrics = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "fund-metrics" });
  const items: Metric[] = (doc.items ?? []).map((m) => ({
    value: m.value,
    label: m.label,
    note: orUndefined(m.note),
    showOnHome: Boolean(m.showOnHome),
  }));
  return { items, asOf: orUndefined(doc.asOf), disclaimer: doc.disclaimer ?? "" };
});

export const getAnnouncement = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "announcement" });
  const now = Date.now();
  const started = !doc.startsAt || new Date(doc.startsAt).getTime() <= now;
  const notEnded = !doc.endsAt || new Date(doc.endsAt).getTime() >= now;
  if (!doc.enabled || !doc.message || !started || !notEnded) return null;
  return {
    message: doc.message,
    link: doc.linkUrl ? { label: doc.linkLabel || "Learn more", href: doc.linkUrl } : undefined,
    // Lets visitors' "dismiss" apply only to this particular message.
    id: `${doc.message}|${doc.updatedAt ?? ""}`,
  };
});

export const getPageSeo = cache(async (page: PageKey) => {
  const doc = await (await payload()).findGlobal({ slug: "page-seo", depth: 1 });
  const entry = (doc as unknown as Record<string, { title?: string | null; description?: string | null; image?: Media | number | null } | undefined>)[page];
  return {
    title: orUndefined(entry?.title),
    description: orUndefined(entry?.description),
    image: image(entry?.image, "card"),
  };
});

export const getHomePage = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "home-page" });
  return {
    positioning: doc.positioning ?? "",
    pillars: (doc.pillars ?? []).map((p) => ({
      title: p.title,
      text: p.text ?? "",
      icon: p.icon,
      points: (p.points ?? []).map((x) => x.text).filter(Boolean),
    })),
    faq: (doc.faq ?? []).map((f) => ({ question: f.question, answer: f.answer })),
  };
});

export type HomePageContent = Awaited<ReturnType<typeof getHomePage>>;

export const getInvestmentSectors = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "home-sectors" });
  return (doc.sectors ?? []).map((s, i) => ({
    id: s.id ?? String(i),
    name: s.name,
    line: s.line,
    icon: sectorIconFor(s.name, s.icon),
    portfolioSector: orUndefined(s.portfolioSector) as PortfolioSectorId | undefined,
  }));
});

export type InvestmentSector = Awaited<ReturnType<typeof getInvestmentSectors>>[number];

export const getImpact = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "impact-page", depth: 1 });
  const str = (v?: string | null) => (v ?? "").trim();
  const slugs = (list?: (number | CmsCompany)[] | null) =>
    (list ?? []).filter((c): c is CmsCompany => typeof c !== "number" && c.showOnSite !== false).map((c) => c.slug ?? String(c.id));
  const slugOf = (c?: number | CmsCompany | null) => (c && typeof c !== "number" ? c.slug ?? String(c.id) : undefined);
  const heading = (g?: { eyebrow?: string | null; headline?: string | null; intro?: string | null } | null) => ({
    eyebrow: str(g?.eyebrow),
    headline: str(g?.headline),
    intro: str(g?.intro),
  });
  const h = doc.hero;
  const o = doc.outcomes;
  const f = doc.footprint;
  const sd = doc.sdgs;
  const m = doc.measurement;
  return {
    hero: {
      eyebrow: str(h?.eyebrow),
      headline: str(h?.headline),
      statement: str(h?.statement),
      intro: str(h?.intro),
      primaryLabel: str(h?.primaryLabel) || "Explore portfolio progress",
      secondaryLabel: str(h?.secondaryLabel) || "How we measure",
      tiles: (h?.tiles ?? [])
        .map((tile) => ({ image: image(tile.image, "card"), company: slugOf(tile.company), caption: str(tile.caption) }))
        .filter((tile): tile is { image: Image; company: string | undefined; caption: string } => Boolean(tile.image)),
    },
    pathways: (doc.pathways ?? []).map((p) => ({ title: p.title, subtitle: str(p.subtitle), body: str(p.body), companies: slugs(p.companies) })),
    outcomes: {
      ...heading(o),
      status: str(o?.status),
      measures: (o?.measures ?? []).map((x) => ({ label: x.label, value: str(x.value), unit: str(x.unit), definition: str(x.definition) })),
      footnote: str(o?.footnote),
    },
    footprint: {
      ...heading(f),
      footnote: str(f?.footnote),
      countries: (f?.countries ?? []).map((x) => ({
        name: x.name,
        lat: x.lat,
        lon: x.lon,
        presence: (x.presence ?? []) as ("hq" | "manufacturing" | "deployments")[],
        companies: slugs(x.companies),
        value: str(x.value),
        valueLabel: str(x.valueLabel),
        detail: str(x.detail),
        source: str(x.source),
      })),
    },
    sdgs: {
      ...heading(sd),
      note: str(sd?.note),
      goals: (sd?.goals ?? []).map((g) => ({
        number: g.number,
        title: g.title,
        summary: str(g.summary),
        entries: (g.entries ?? []).map((e) => ({ company: slugOf(e.company), label: str(e.label), connection: e.connection, measures: str(e.measures) })),
      })),
    },
    measurement: {
      ...heading(m),
      items: (m?.items ?? []).map((i) => ({ title: i.title, body: str(i.body) })),
      reports: (m?.reports ?? []).map((r) => ({ title: r.title, status: str(r.status), href: image(r.file)?.url })),
      processTitle: str(m?.processTitle),
      process: (m?.process ?? []).map((p) => ({ step: str(p.step), text: str(p.text) })),
    },
  };
});

export type ImpactContent = Awaited<ReturnType<typeof getImpact>>;

export const getGiftCity = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "gift-city-page", depth: 1 });
  const d = doc.disclosures;
  const t = (v?: string | null) => (v ?? "").trim();
  // IFSCA disclosures (Annexure 1), unless switched off in the CMS.
  const disclosures =
    d && d.show !== false && t(d.fme?.name)
      ? {
          asOf: orUndefined(d.asOf),
          fme: {
            name: t(d.fme?.name),
            legalForm: t(d.fme?.legalForm),
            category: t(d.fme?.category),
            registrationNumber: t(d.fme?.registrationNumber),
            registrationDate: t(d.fme?.registrationDate),
          },
          contact: {
            registeredOffice: t(d.contact?.registeredOffice),
            correspondence: t(d.contact?.correspondence),
            telephone: t(d.contact?.telephone),
            email: t(d.contact?.email),
          },
          funds: (d.funds ?? []).map((f) => ({ name: f.name, registrationNumber: t(f.registrationNumber), category: t(f.category) })),
          serviceProviders: (d.serviceProviders ?? []).map((p) => ({
            role: p.role,
            name: t(p.name),
            address: t(p.address),
            telephone: t(p.telephone),
          })),
          grievance: {
            text: t(d.grievance?.text),
            policyUrl: image(d.grievance?.policy)?.url,
            complaints: (d.grievance?.complaints ?? []).map((c) => ({
              quarterEnded: c.quarterEnded,
              pendingStart: t(c.pendingStart),
              received: t(c.received),
              disposed: t(c.disposed),
              pendingEnd: t(c.pendingEnd),
            })),
            complaintsNote: t(d.grievance?.complaintsNote) || "Not applicable",
          },
          officers: (d.officers ?? []).map((o) => ({ designation: o.designation, name: o.name, email: t(o.email), telephone: t(o.telephone) })),
          actions: { action: t(d.actions?.action), status: t(d.actions?.status) },
          disclaimer: t(d.disclaimer),
        }
      : undefined;
  return {
    disclosures,
    eyebrow: doc.eyebrow ?? "",
    headline: doc.headline ?? "",
    intro: doc.intro ?? "",
    highlights: (doc.highlights ?? []).map((h) => ({ title: h.title, body: h.body })),
    cta: { label: doc.ctaLabel || "Investor enquiries", href: doc.ctaHref || "/contact?type=investor" },
  };
});

/** Empty CMS fields fall back to the default wording. */
function withDefaults<T extends Record<string, unknown>>(defaults: T, doc: Record<string, unknown>): T {
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const v = doc[key as string];
    if (typeof v === "string" && v.trim()) out[key] = v as T[keyof T];
  }
  return out;
}

export const getPortfolioPage = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "portfolio-page" });
  return withDefaults(portfolioPageDefaults, doc as unknown as Record<string, unknown>);
});

export const getAboutPage = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "about-page" });
  const { eyebrow, headline, approachEyebrow, teamEyebrow, teamHeading } = aboutPageDefaults;
  const text = { eyebrow, headline, approachEyebrow, teamEyebrow, teamHeading };
  const nextSteps = (doc.nextSteps ?? []).map((c) => ({ eyebrow: c.eyebrow, title: c.title, body: c.body, href: c.href }));
  return {
    ...withDefaults(text, doc as unknown as Record<string, unknown>),
    nextSteps: nextSteps.length ? nextSteps : aboutPageDefaults.nextSteps,
    groupPhotos: (doc.groupPhotos ?? [])
      .map((p) => ({ image: image(p.image), caption: (p.caption ?? "").trim() }))
      .filter((p): p is { image: Image; caption: string } => Boolean(p.image)),
  };
});

export const getPerspectivesPage = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "perspectives-page" });
  return withDefaults(perspectivesPageDefaults, doc as unknown as Record<string, unknown>);
});

// ─── Collections ─────────────────────────────────────────────────────────────

export const getTeamGroups = cache(async () => {
  const { docs } = await (await payload()).find({
    collection: "team",
    where: { and: [published, visible] },
    sort: "order",
    limit: 500,
    depth: 1,
  });
  const toPerson = (d: (typeof docs)[number]): Person => ({
    name: d.name,
    title: orUndefined(d.title),
    linkedin: orUndefined(d.linkedin),
    photo: image(d.photo, "portrait")?.url,
    bio: orUndefined(d.bio),
    highlights: d.highlights?.map((h) => h.text).filter(Boolean),
    logoRows: (d.logoRows ?? [])
      .map((r) => ({ heading: orUndefined(r.heading) || undefined, image: image(r.image) }))
      .filter((r): r is { heading: string | undefined; image: Image } => Boolean(r.image)),
  });
  // Teams in display order (lib/taxonomy.ts); empty teams are skipped.
  return teamGroupOptions
    .map((g) => ({ id: g.value, label: g.label, people: docs.filter((d) => d.group === g.value).map(toPerson) }))
    .filter((g) => g.people.length > 0);
});

/** All visible portfolio companies (active and exited), in display order. */
export const getPortfolio = cache(async (): Promise<Company[]> => {
  const { docs } = await (await payload()).find({
    collection: "companies",
    where: { and: [published, visible] },
    sort: "order",
    limit: 500,
    depth: 1,
  });
  return docs.map(mapCompany);
});

export const getFunds = cache(async (): Promise<Fund[]> => {
  const { docs } = await (await payload()).find({ collection: "funds", sort: "order", limit: 50 });
  return docs.map((f) => ({
    name: f.name,
    size: orUndefined(f.size),
    status: f.status,
    description: orUndefined(f.description),
    showOnHome: Boolean(f.showOnHome),
    category: f.sebiCategory,
    sebiRegistration: f.sebiRegistration,
    manager: f.manager,
  }));
});

export const getNews = cache(async (): Promise<NewsItem[]> => {
  const { docs } = await (await payload()).find({ collection: "news", sort: "-date", limit: 100, depth: 1 });
  return docs.map((n) => ({ date: n.date, title: n.title, source: n.source, url: n.url, image: image(n.image, "card") }));
});

export const getEvents = cache(async (): Promise<{ upcoming: EventItem[]; past: EventItem[] }> => {
  const { docs } = await (await payload()).find({ collection: "events", sort: "startDate", limit: 200, depth: 1 });
  const now = Date.now();
  const all: EventItem[] = docs.map((e) => ({
    title: e.title,
    startDate: e.startDate,
    endDate: orUndefined(e.endDate),
    location: orUndefined(e.location),
    description: orUndefined(e.description),
    image: image(e.image, "card"),
    link: orUndefined(e.link),
  }));
  const ends = (e: EventItem) => new Date(e.endDate ?? e.startDate).getTime();
  return {
    upcoming: all.filter((e) => ends(e) >= now),
    past: all.filter((e) => ends(e) < now).reverse(),
  };
});

export const getReports = cache(async (): Promise<Report[]> => {
  const { docs } = await (await payload()).find({ collection: "reports", sort: "-date", limit: 200, depth: 1 });
  return docs.map((r) => {
    const pdf = image(r.file)?.url;
    return {
      title: r.title,
      date: r.date,
      summary: orUndefined(r.summary),
      cover: image(r.cover, "card"),
      href: pdf ?? orUndefined(r.externalUrl),
      isPdf: Boolean(pdf),
      companies: (r.companies ?? [])
        .filter((c): c is CmsCompany => typeof c !== "number")
        .map((c) => c.slug ?? String(c.id)),
    };
  });
});

// ─── Feeds (Substack / YouTube), linked to portfolio companies ──────────────

export const getEssays = cache(async (): Promise<Essay[]> => {
  const [site, companies] = await Promise.all([getSite(), getPortfolio()]);
  const essays = await getSubstackEssays(site.substackUrl);
  return essays.map((e) => ({ ...e, company: companies.find((c) => sameUrl(c.essayUrl, e.url))?.slug }));
});

/** A YouTube link's video id (watch, youtu.be, shorts, embed or live links). */
export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/(?:shorts|embed|live)\/)([\w-]{11})/);
  return m?.[1];
}

/** The videos listed in Site settings (newest first), then the channel feed's, without repeats. */
export const getVideos = cache(async (): Promise<Video[]> => {
  const site = await getSite();
  const listed: Video[] = site.videos
    .map((v) => {
      const id = youtubeId(v.url);
      return { ...v, thumbnail: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const seen = new Set(listed.map((v) => youtubeId(v.url) ?? v.url));
  const feed = (await getYouTubeVideos(site.youtubeChannelId)).filter((v) => !seen.has(youtubeId(v.url) ?? v.url));
  return [...listed, ...feed];
});

// ─── Derived helpers ─────────────────────────────────────────────────────────

export function companyName(companies: Company[], slug: string) {
  return companies.find((c) => c.slug === slug)?.name;
}

export const isActive = (c: Company) => c.status === "active";
