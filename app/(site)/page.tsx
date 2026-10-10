import { HomeHero } from "@/components/home/HomeHero";
import { SectorCarousel } from "@/components/home/SectorCarousel";
import {
  ApproachSection,
  MetricsSection,
  MobileAbout,
  PerspectivesTeaser,
  PortfolioMarquee,
} from "@/components/home/HomeSections";
import { FundsSection } from "@/components/funds/FundsSection";
import {
  getEssays,
  getEvents,
  getFunds,
  getInvestmentSectors,
  getMetrics,
  getNews,
  getPortfolio,
  getSite,
} from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("home");
}

export default async function HomePage() {
  const [site, metrics, sectors, companies, funds, essays, news, events] = await Promise.all([
    getSite(),
    getMetrics(),
    getInvestmentSectors(),
    getPortfolio(),
    getFunds(),
    getEssays(),
    getNews(),
    getEvents(),
  ]);

  return (
    <>
      <HomeHero hero={site.hero} about={site.about} approach={site.approach} thesis={site.thesis} />
      <MobileAbout about={site.about} approach={site.approach} />
      <MetricsSection items={metrics.items} asOf={metrics.asOf} disclaimer={metrics.disclaimer} />
      <SectorCarousel sectors={sectors} />
      <PortfolioMarquee companies={companies} />
      <ApproachSection
        thesis={site.thesis}
        stage={site.investmentCriteria.stage}
        cheque={site.investmentCriteria.cheque}
      />
      <FundsSection funds={funds} />
      <PerspectivesTeaser
        essays={essays}
        news={news}
        nextEvent={events.upcoming[0]}
        substackUrl={site.substackUrl}
      />
    </>
  );
}
