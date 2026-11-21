import { HomeHero } from "@/components/home/HomeHero";
import { PositioningBand } from "@/components/home/PositioningBand";
import { FounderPillars } from "@/components/home/FounderPillars";
import { SectorGrid } from "@/components/home/SectorGrid";
import { FeaturedPortfolio } from "@/components/home/FeaturedPortfolio";
import { PerspectivesTeaser } from "@/components/home/HomeSections";
import { FundsSection } from "@/components/funds/FundsSection";
import {
  getEssays,
  getEvents,
  getFunds,
  getHomePage,
  getInvestmentSectors,
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
  const [site, home, sectors, companies, funds, essays, news, events] = await Promise.all([
    getSite(),
    getHomePage(),
    getInvestmentSectors(),
    getPortfolio(),
    getFunds(),
    getEssays(),
    getNews(),
    getEvents(),
  ]);

  const active = companies.filter(isActive);
  // Companies marked "Feature on home page", by their home page position (then portfolio
  // order); until any are, show the four most recent.
  const featured = active
    .filter((c) => c.featured)
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (a.c.homeOrder ?? Infinity) - (b.c.homeOrder ?? Infinity) || a.i - b.i)
    .map(({ c }) => c);
  const showcase = featured.length ? featured : active.slice(0, 4);
  const notes = Object.fromEntries(
    showcase.map((c) => [c.slug, essays.find((e) => sameUrl(e.url, c.essayUrl))?.url ?? c.essayUrl])
  );
  return (
    <>
      <HomeHero tagline={site.tagline} intro={site.hero} />
      {/* Everything after the hero is one opaque layer that slides up over the sticky
          hero panel (.hero-cover). */}
      <div
        data-nav-cover
        className="hero-cover relative z-10 overflow-clip rounded-t-[28px] bg-white shadow-[0_-30px_60px_-40px_rgb(0_0_0/0.45)] sm:rounded-t-[40px]"
      >
        <PositioningBand
          positioning={home.positioning || site.tagline}
          about={site.about}
        />
        <SectorGrid sectors={sectors} companies={companies} />
        <FounderPillars pillars={home.pillars} />
        <FeaturedPortfolio companies={showcase} notes={notes} totalActive={active.length} />
        <FundsSection funds={funds} />
        <PerspectivesTeaser essays={essays} news={news} nextEvent={events.upcoming[0]} substackUrl={site.substackUrl} />
      </div>
    </>
  );
}
