import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getFunds, getInvestmentSectors, getMetrics, getSite, getTeamGroups } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { FundsSection } from "@/components/funds/FundsSection";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TeamSpotlight } from "@/components/about/TeamSpotlight";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("about", {
    title: "About Us",
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
      <PageHero eyebrow="About Us" title="India's first energy-transition venture fund" intro={site.about}>
        <dl className="mt-12 grid max-w-3xl grid-cols-1 border-y border-white/8 sm:grid-cols-3">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={i > 0 ? "border-t border-white/8 py-5 sm:border-t-0 sm:border-l sm:pl-6" : "py-5 sm:pr-6"}
            >
              <dt className="hud text-ink-400">{f.label}</dt>
              <dd className="mt-2 font-serif text-xl font-light text-white">{f.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Approach */}
      <section className="border-t border-white/8 py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-teal">Our approach</p>
            <blockquote className="display mt-6 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
              &ldquo;{site.approach}&rdquo;
            </blockquote>
          </Reveal>
          <Reveal className="lg:pt-12">
            <p className="text-base leading-relaxed text-ink-200 sm:text-lg">{site.thesis}</p>
            <h3 className="hud mt-10 text-ink-400">Sectors we invest in</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {investmentSectors.map((s) => (
                <li key={s.id} className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs text-ink-200">
                  {s.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <FundsSection funds={funds} />

      {/* Team */}
      <section className="border-t border-white/8 py-20 sm:py-28" aria-labelledby="team-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="The team"
            title={<span id="team-heading">The people behind the fund</span>}
            intro="Investors, operators and engineers who underwrite the technology as closely as the business."
          />
          <div className="mt-14 space-y-10 sm:space-y-14">
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

      {/* CTA band */}
      <section className="border-t border-white/8 py-16 sm:py-20">
        <div className="container-site grid gap-4 md:grid-cols-2">
          {[
            {
              href: "/careers",
              eyebrow: "Careers",
              title: "Join the team",
              body: "Help us back the engineers building India's energy future.",
            },
            {
              href: "/contact",
              eyebrow: "Founders",
              title: "Pitch to us",
              body: "Building in energy? We read every deck.",
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex min-h-48 flex-col justify-between rounded-3xl border border-white/8 bg-white/[0.03] p-7 transition-colors hover:border-teal/50 sm:p-9"
            >
              <p className="eyebrow text-teal">{c.eyebrow}</p>
              <div>
                <h2 className="display flex items-center justify-between gap-4 text-3xl sm:text-4xl">
                  {c.title}
                  <ArrowRight
                    className="size-6 shrink-0 text-ink-300 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-teal"
                    aria-hidden
                  />
                </h2>
                <p className="mt-3 text-sm text-ink-300">{c.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
