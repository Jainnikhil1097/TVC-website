import { HomeHero, type HeroFeature } from "@/components/home/HomeHero";
import type { HeroSlide } from "@/components/home/PhotoBackdrop";
import { HERO_MODELS } from "@/components/home/engineering/registry";
import { portfolioSectorName } from "@/lib/taxonomy";
import { PositioningBand } from "@/components/home/PositioningBand";
import { FounderPillars } from "@/components/home/FounderPillars";
import { SectorGrid } from "@/components/home/SectorGrid";
import { FeaturedPortfolio } from "@/components/home/FeaturedPortfolio";
import { PerspectivesTeaser } from "@/components/home/HomeSections";
import { FounderFaq } from "@/components/home/FounderFaq";
import { FundsSection } from "@/components/funds/FundsSection";
import {
  getEssays,
  getEvents,
  getFunds,
  getHomePage,
  getInvestmentSectors,
  getMetrics,
  getNews,
  getPortfolio,
  getSite,
  isActive,
  sameUrl,
} from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("home");
}

export default async function HomePage() {
  const [site, home, metrics, sectors, companies, funds, essays, news, events] = await Promise.all([
    getSite(),
    getHomePage(),
    getMetrics(),
    getInvestmentSectors(),
    getPortfolio(),
    getFunds(),
    getEssays(),
    getNews(),
    getEvents(),
  ]);

  const active = companies.filter(isActive);
  // Companies marked "Feature on home page"; until any are, show the four most recent.
  const featured = active.filter((c) => c.featured);
  const showcase = featured.length ? featured : active.slice(0, 4);
  const notes = Object.fromEntries(
    showcase.map((c) => [c.slug, essays.find((e) => sameUrl(e.url, c.essayUrl))?.url ?? c.essayUrl])
  );
  const headlineFigures = metrics.items.filter((m) => m.showOnHome);
  // Hero photos: companies ticked "Show in home hero" with a cover image (up to 5, in
  // portfolio order). Without any, the hero shows the engineering drawings instead.
  const heroSlides: HeroSlide[] = active
    .filter((c) => c.showInHero && c.heroImage)
    .slice(0, 5)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      sector: portfolioSectorName(c.sector),
      summary: c.summary,
      image: c.heroImage!,
    }));
  // Hero: one engineering drawing per company that's live in the CMS (first matching slug).
  const heroFeatures = HERO_MODELS.flatMap((m): HeroFeature[] => {
    const c = m.slugs.map((slug) => active.find((x) => x.slug === slug)).find(Boolean);
    return c ? [{ key: m.key, name: c.name, sector: portfolioSectorName(c.sector), summary: c.summary }] : [];
  });
  return (
    <>
      <HomeHero hero={site.hero} features={heroFeatures} slides={heroSlides} />
      {/* Everything after the hero is one opaque layer that slides up over the sticky
          hero panel (.hero-cover); the nav turns light once it reaches the top. */}
      <div
        data-nav-cover
        className="hero-cover relative z-10 overflow-clip rounded-t-[28px] bg-white shadow-[0_-30px_60px_-40px_rgb(10_30_63/0.45)] sm:rounded-t-[40px]"
      >
        <PositioningBand
          positioning={home.positioning || site.tagline}
          about={site.about}
          figures={headlineFigures.length ? headlineFigures : metrics.items.slice(0, 4)}
          asOf={metrics.asOf}
          disclaimer={metrics.disclaimer}
        />
        <SectorGrid sectors={sectors} companies={companies} />
        <FounderPillars pillars={home.pillars} />
        <FeaturedPortfolio companies={showcase} notes={notes} totalActive={active.length} />
        <FundsSection funds={funds} />
        <PerspectivesTeaser essays={essays} news={news} nextEvent={events.upcoming[0]} substackUrl={site.substackUrl} />
        <FounderFaq faq={home.faq} email={site.contact.email} />
      </div>
    </>
  );
}
