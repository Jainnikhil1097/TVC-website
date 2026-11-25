import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAboutPage, getSite, getTeamGroups } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TeamSection } from "@/components/about/TeamSection";
import { ChequeSize } from "@/components/about/ChequeSize";
import { PhotoMarquee } from "@/components/media/PhotoMarquee";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("about", {
    title: "About",
    description:
      "Meet the team behind Transition VC — India's first energy-transition venture fund, backing engineering-led startups from Pre-Seed to Series A.",
  });
}

export default async function AboutPage() {
  const [site, page, teamGroups] = await Promise.all([getSite(), getAboutPage(), getTeamGroups()]);

  const { stage, cheque, chequeUsd } = site.investmentCriteria;
  const facts = [
    { label: "Stage", value: stage },
    { label: "Cheque size", value: cheque, usd: chequeUsd },
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
              {"usd" in f ? (
                <ChequeSize label={f.label} inr={f.value} usd={f.usd ?? ""} />
              ) : (
                <>
                  <dt className="text-sm text-ink-300">{f.label}</dt>
                  <dd className="mt-1 font-display text-xl text-white">{f.value}</dd>
                </>
              )}
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Approach: the quote alone, in two or three lines */}
      <section className="py-20 sm:py-28">
        <Reveal className="container-site">
          <p className="eyebrow text-teal-ink">{page.approachEyebrow}</p>
          <blockquote className="display mt-6 max-w-5xl text-3xl leading-tight text-balance text-ink sm:text-4xl lg:text-[2.75rem]">
            &ldquo;{site.approach}&rdquo;
          </blockquote>
        </Reveal>
      </section>

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

      {/* Group photos, drifting slowly across the full width */}
      {page.groupPhotos.length > 0 && (
        <section aria-label="Group photos" className="py-16 sm:py-20">
          <Reveal>
            <PhotoMarquee photos={page.groupPhotos} height="h-72 sm:h-[26rem] lg:h-[30rem]" secondsPerPhoto={16} sizes="(min-width: 1024px) 720px, 90vw" />
          </Reveal>
        </section>
      )}

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
