import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { PortfolioExplorer } from "@/components/portfolio/PortfolioExplorer";
import type { CompanyEssay } from "@/components/portfolio/status";
import { getEssays, getPortfolio, getSite, isActive, sameUrl } from "@/lib/cms";
import { portfolioSectors } from "@/lib/taxonomy";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const generateMetadata = () =>
  pageMetadata("portfolio", {
    title: "Portfolio",
    description:
      "The engineering-led startups Transition VC backs across drones, industrial decarbonisation, hydrogen, mobility, grid and data centres.",
  });

export default async function PortfolioPage() {
  const [companies, essays, site] = await Promise.all([getPortfolio(), getEssays(), getSite()]);

  // Match each company to its Substack essay here, on the server, so the client
  // components only receive what they display.
  const essayFor: Record<string, CompanyEssay> = {};
  for (const c of companies) {
    if (!c.essayUrl) continue;
    const essay = essays.find((e) => sameUrl(e.url, c.essayUrl));
    essayFor[c.slug] = essay ? { url: essay.url, title: essay.title, teaser: essay.teaser } : { url: c.essayUrl };
  }

  const stats = [
    { value: String(companies.filter(isActive).length), label: "Active companies" },
    { value: String(portfolioSectors.length), label: "Sectors" },
    { value: site.investmentCriteria.stage.replace(" to ", "–"), label: "Stages" },
  ];

  return (
    <>
      <PageHero
        art="blueprint"
        eyebrow="Portfolio"
        title="The companies engineering India's energy future"
        intro="Engineering-led companies we back across India's energy transition. Building in energy? We'd like to hear from you."
      >
        <div className="mt-10 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <ButtonLink href="/contact?type=startup" variant="solid">
            Pitch to us
          </ButtonLink>
          <dl className="grid grid-cols-3 gap-6 sm:gap-10">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="eyebrow mt-2 text-ink-300">{s.label}</dt>
                <dd className="display text-2xl text-white sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHero>

      <section aria-label="Portfolio companies" className="pt-12 pb-24 sm:pt-16 sm:pb-32">
        <Reveal className="container-site">
          <PortfolioExplorer companies={companies} essays={essayFor} />
        </Reveal>
      </section>
    </>
  );
}
