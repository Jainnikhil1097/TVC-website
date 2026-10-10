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
  Role,
  Video,
} from "./types";
import type { PageKey } from "./taxonomy";
import { siteIdentity } from "./site-config";
import { getSubstackEssays, getYouTubeVideos } from "./feeds";

// Typed read access to CMS content for server components. Every getter maps CMS
// documents onto the site's own types (lib/types.ts). React's cache() dedupes
// calls within one render; Next's ISR + the CMS revalidation hook handle freshness.

const payload = cache(() => getPayload({ config }));

const published: Where = { _status: { equals: "published" } };
const visible: Where = { showOnSite: { not_equals: false } };

// ─── Mapping helpers ─────────────────────────────────────────────────────────

function image(media: number | Media | null | undefined, size?: "card" | "portrait" | "thumbnail"): Image | undefined {
  if (!media || typeof media === "number") return undefined;
  const sized = size ? media.sizes?.[size] : undefined;
  const url = sized?.url || media.url;
  if (!url) return undefined;
  return {
    url,
    alt: media.alt,
    width: (sized?.url ? sized.width : media.width) ?? undefined,
    height: (sized?.url ? sized.height : media.height) ?? undefined,
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
    website: doc.website,
    status: doc.status,
    exitYear: orUndefined(doc.exitYear),
    exitNote: orUndefined(doc.exitNote),
    featured: Boolean(doc.featured),
    logo: image(doc.logo, "card"),
    founders: doc.founders?.map((f) => ({
      name: f.name,
      title: orUndefined(f.title),
      linkedin: orUndefined(f.linkedin),
      photo: image(f.photo, "thumbnail")?.url,
    })),
    whyWeInvested: orUndefined(doc.whyWeInvested),
    essayUrl: orUndefined(doc.essayUrl),
    videoUrl: orUndefined(doc.videoUrl),
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
    investmentCriteria: { stage: doc.stage ?? "", cheque: doc.cheque ?? "" },
    contact: {
      email: doc.email ?? "",
      address: (doc.address ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
      mapUrl: doc.mapUrl ?? "",
    },
    investorLoginUrl: doc.investorLoginUrl ?? "",
    socials,
    substackUrl: doc.substackUrl ?? "https://transitionventurecapital.substack.com",
    youtubeUrl: doc.youtubeUrl ?? "",
    youtubeChannelId: doc.youtubeChannelId ?? "",
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

export const getInvestmentSectors = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "home-sectors" });
  return (doc.sectors ?? []).map((s, i) => ({
    id: s.id ?? String(i),
    name: s.name,
    line: s.line,
    portfolioSector: orUndefined(s.portfolioSector) as PortfolioSectorId | undefined,
  }));
});

export type InvestmentSector = Awaited<ReturnType<typeof getInvestmentSectors>>[number];

export const getImpact = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "impact-page", depth: 1 });
  return {
    eyebrow: doc.eyebrow ?? "",
    headline: doc.headline ?? "",
    intro: doc.intro ?? "",
    stats: (doc.stats ?? []).map((s) => ({ value: s.value, label: s.label })),
    themes: (doc.themes ?? []).map((t) => ({
      title: t.title,
      body: t.body,
      companies: (t.companies ?? [])
        .filter((c): c is CmsCompany => typeof c !== "number" && c._status === "published" && c.showOnSite !== false)
        .map((c) => ({ slug: c.slug ?? String(c.id), name: c.name })),
    })),
  };
});

export const getGiftCity = cache(async () => {
  const doc = await (await payload()).findGlobal({ slug: "gift-city-page" });
  return {
    eyebrow: doc.eyebrow ?? "",
    headline: doc.headline ?? "",
    intro: doc.intro ?? "",
    highlights: (doc.highlights ?? []).map((h) => ({ title: h.title, body: h.body })),
    cta: { label: doc.ctaLabel || "Investor enquiries", href: doc.ctaHref || "/contact?type=investor" },
  };
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
  });
  const groups = [
    { id: "founding", label: "Founding Team" },
    { id: "executive", label: "Executive Team" },
    { id: "advisors", label: "Sector Experts & Advisors" },
  ] as const;
  return groups
    .map((g) => ({ ...g, people: docs.filter((d) => d.group === g.id).map(toPerson) }))
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
  const { docs } = await (await payload()).find({ collection: "news", sort: "-date", limit: 100 });
  return docs.map((n) => ({ date: n.date, title: n.title, source: n.source, url: n.url }));
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

export const getJobs = cache(async (): Promise<Role[]> => {
  const { docs } = await (await payload()).find({
    collection: "jobs",
    where: { open: { not_equals: false } },
    sort: "order",
    limit: 200,
    depth: 1,
  });
  return docs.map((j) => {
    const company = j.company && typeof j.company !== "number" ? j.company : undefined;
    return {
      title: j.title,
      company: company?.name,
      companySlug: company?.slug ?? undefined,
      function: j.function ?? "",
      experience: j.experience ?? "",
      location: j.location ?? "",
      applyUrl: orUndefined(j.applyUrl),
    };
  });
});

// ─── Feeds (Substack / YouTube), linked to portfolio companies ──────────────

export const getEssays = cache(async (): Promise<Essay[]> => {
  const [site, companies] = await Promise.all([getSite(), getPortfolio()]);
  const essays = await getSubstackEssays(site.substackUrl);
  return essays.map((e) => ({ ...e, company: companies.find((c) => sameUrl(c.essayUrl, e.url))?.slug }));
});

export const getVideos = cache(async (): Promise<Video[]> => {
  const site = await getSite();
  return getYouTubeVideos(site.youtubeChannelId);
});

// ─── Derived helpers ─────────────────────────────────────────────────────────

export function companyName(companies: Company[], slug: string) {
  return companies.find((c) => c.slug === slug)?.name;
}

export const isActive = (c: Company) => c.status === "active";
