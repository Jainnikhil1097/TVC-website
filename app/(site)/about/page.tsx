import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getFunds, getInvestmentSectors, getMetrics, getSite, getTeamGroups } from "@/lib/cms";
import { pitchHref } from "@/lib/site-config";
import { pageMetadata } from "@/lib/seo";
import { FundsSection } from "@/components/funds/FundsSection";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TeamSpotlight } from "@/components/about/TeamSpotlight";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("about", {
    title: "About",
    description:
      "Meet the team behind Transition VC — India's first energy-transition venture fund, backing engineering-led startups from Pre-Seed to Series A.",
  });
}

export default async function AboutPage() {
  const [site, metrics, investmentSectors, teamGroups, funds] = await Promise.all([
    getSite(),
    getMetrics(),
    getInvestmentSectors(),
    getTeamGroups(),
    getFunds(),
  ]);

  const fundFigure = metrics.items.find((m) => /^fund i\b/i.test(m.label)) ?? metrics.items[0];
  const facts = [
    { label: "Stage", value: site.investmentCriteria.stage },
    { label: "Cheque size", value: site.investmentCriteria.cheque },
    ...(fundFigure ? [{ label: fundFigure.label, value: fundFigure.value }] : []),
  ].filter((f) => f.value);

  return (
    <>
      <PageHero art="network" eyebrow="About us" title="India's first energy-transition venture fund" intro={site.about}>
        <dl className="mt-12 grid max-w-3xl grid-cols-1 border-y border-white/15 sm:grid-cols-3">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={i > 0 ? "border-t border-white/15 py-5 sm:border-t-0 sm:border-l sm:pl-6" : "py-5 sm:pr-6"}
            >
              <dt className="text-sm text-ink-300">{f.label}</dt>
              <dd className="mt-1 font-serif text-xl font-light text-white">{f.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Approach */}
      <section className="py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-teal-ink">Our approach</p>
            <blockquote className="display mt-6 text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              &ldquo;{site.approach}&rdquo;
            </blockquote>
          </Reveal>
          <Reveal className="lg:pt-12">
            <p className="text-base leading-relaxed text-muted sm:text-lg">{site.thesis}</p>
            <h3 className="mt-10 text-sm font-semibold text-ink">Sectors we invest in</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {investmentSectors.map((s) => (
                <li key={s.id} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink">
                  {s.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <FundsSection funds={funds} />

      {/* Team */}
      <section className="border-t border-line bg-surface py-20 sm:py-28" aria-labelledby="team-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="The team"
            title={<span id="team-heading">The people behind the fund</span>}
            intro="Investors, operators and engineers who underwrite the technology as closely as the business."
          />
          <div className="mt-14 space-y-8 sm:space-y-10">
            {teamGroups.map((group) => (
              <Reveal key={group.id}>
                <TeamSpotlight
                  label={group.label}
                  people={group.people}
                  fallbackTitle={group.id === "advisors" ? "Sector Expert & Advisor" : ""}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="container-site grid gap-4 md:grid-cols-3">
          {[
            { href: pitchHref, eyebrow: "Founders", title: "Pitch to us", body: "Building in energy? Share your deck — we read every one." },
            { href: "/impact", eyebrow: "Impact", title: "Our impact", body: "How our portfolio is decarbonising industry, mobility and the grid." },
            { href: "/contact", eyebrow: "Contact", title: "Get in touch", body: "Investors, partners and press — we'd like to hear from you." },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex min-h-44 flex-col justify-between rounded-2xl border border-line bg-white p-7 transition-colors hover:border-teal-ink sm:p-8"
            >
              <p className="eyebrow text-teal-ink">{c.eyebrow}</p>
              <div>
                <h2 className="display flex items-center justify-between gap-4 text-2xl text-ink sm:text-3xl">
                  {c.title}
                  <ArrowRight
                    className="size-5 shrink-0 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-teal-ink"
                    aria-hidden
                  />
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
