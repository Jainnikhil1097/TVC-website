import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAboutPage, getFunds, getSite, getTeamGroups } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { FundsSection } from "@/components/funds/FundsSection";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TeamSection } from "@/components/about/TeamSection";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("about", {
    title: "About",
    description:
      "Meet the team behind Transition VC — India's first energy-transition venture fund, backing engineering-led startups from Pre-Seed to Series A.",
  });
}

export default async function AboutPage() {
  const [site, page, teamGroups, funds] = await Promise.all([getSite(), getAboutPage(), getTeamGroups(), getFunds()]);

  const facts = [
    { label: "Stage", value: site.investmentCriteria.stage },
    { label: "Cheque size", value: site.investmentCriteria.cheque },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero art="paths" eyebrow={page.eyebrow} title={page.headline} intro={site.about}>
        <dl className="mt-12 grid max-w-2xl grid-cols-1 border-y border-white/15 sm:grid-cols-2">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={i > 0 ? "border-t border-white/15 py-5 sm:border-t-0 sm:border-l sm:pl-6" : "py-5 sm:pr-6"}
            >
              <dt className="text-sm text-ink-300">{f.label}</dt>
              <dd className="mt-1 font-display text-xl text-white">{f.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Approach */}
      <section className="py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-teal-ink">{page.approachEyebrow}</p>
            <blockquote className="display mt-6 text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              &ldquo;{site.approach}&rdquo;
            </blockquote>
          </Reveal>
          <Reveal className="lg:pt-12">
            <p className="text-base leading-relaxed text-muted sm:text-lg">{site.thesis}</p>
          </Reveal>
        </div>
      </section>

      <FundsSection funds={funds} showAll />

      {/* Team: everyone visible, team by team */}
      <section data-theme="dark" className="bg-black py-20 text-white sm:py-28" aria-labelledby="team-heading">
        <div className="container-site">
          <SectionHeading
            tone="dark"
            eyebrow={page.teamEyebrow}
            title={<span id="team-heading">{page.teamHeading}</span>}
          />
          <div className="mt-14">
            <TeamSection groups={teamGroups} />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="container-site grid gap-4 md:grid-cols-3">
          {page.nextSteps.map((c) => (
            <Link
              key={`${c.href}-${c.title}`}
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
