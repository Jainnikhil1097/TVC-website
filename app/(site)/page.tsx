import { HomeHero } from "@/components/home/HomeHero";
import { PositioningBand } from "@/components/home/PositioningBand";
import { FounderPillars } from "@/components/home/FounderPillars";
import { SectorGrid } from "@/components/home/SectorGrid";
import { PortfolioShowcase } from "@/components/home/PortfolioShowcase";
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
  // Proof band: every company with a headline number, in portfolio order (up to 6).
  const proofs = active.filter((c) => c.proof).slice(0, 6);
  // Datasheet cards: the next few companies that aren't in the spotlight.
  const others = active.filter((c) => !showcase.includes(c)).slice(0, 6);
  const notes = Object.fromEntries(
    showcase.map((c) => [c.slug, essays.find((e) => sameUrl(e.url, c.essayUrl))?.url ?? c.essayUrl])
  );
  const headlineFigures = metrics.items.filter((m) => m.showOnHome);
  return (
    <>
      <HomeHero tagline={site.tagline} intro={site.hero} />
      {/* Everything after the hero is one opaque layer that slides up over the sticky
          hero panel (.hero-cover). */}
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
        <PortfolioShowcase
          spotlight={showcase}
          proofs={proofs}
          others={others}
          notes={notes}
          totalActive={active.length}
        />
        <FundsSection funds={funds} />
        <PerspectivesTeaser essays={essays} news={news} nextEvent={events.upcoming[0]} substackUrl={site.substackUrl} />
        <FounderFaq faq={home.faq} email={site.contact.email} />
      </div>
    </>
  );
}
