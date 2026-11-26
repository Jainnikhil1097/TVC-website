import Image from "next/image";
import { ArrowUpRight, Plus } from "lucide-react";
import { getImpact, getPortfolio, getTeamGroups } from "@/lib/cms";
import { teamColours } from "@/lib/taxonomy";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { FootprintExplorer } from "@/components/impact/FootprintExplorer";
import { SdgExplorer } from "@/components/impact/SdgExplorer";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("impact", {
    title: "Impact",
    description:
      "How Transition VC's portfolio uses less energy, enables cleaner energy and uses resources better: Fund I outcomes, global footprint, SDG alignment and how we measure.",
  });
}

/** Small heading, headline and intro, as every Impact section opens. */
function Heading({ eyebrow, headline, intro, id }: { eyebrow: string; headline: string; intro?: string; id: string }) {
  return (
    <Reveal className="max-w-4xl">
      <p className="eyebrow text-teal-ink">{eyebrow}</p>
      <h2 id={id} className="display mt-4 text-3xl text-ink sm:text-4xl lg:text-[2.75rem]">
        {headline}
      </h2>
      {intro && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{intro}</p>}
    </Reveal>
  );
}

const sectionY = "py-20 sm:py-28";

export default async function ImpactPage() {
  const [impact, portfolio, team] = await Promise.all([getImpact(), getPortfolio(), getTeamGroups()]);
  // Team members by name, so the people named under SDG 5 show with their photo and title.
  const people = Object.fromEntries(team.flatMap((g) => g.people.map((p) => [p.name, { title: p.title, photo: p.photo, colour: teamColours[g.id] }])));
  const names: Record<string, string> = Object.fromEntries(portfolio.map((c) => [c.slug, c.name]));
  const { hero, outcomes, footprint, sdgs, measurement } = impact;
  const list = (slugs: string[]) => slugs.map((s) => names[s]).filter(Boolean).join(" · ");

  return (
    <div data-theme="light">
      <PageHero art="decouple" eyebrow={hero.eyebrow || "Impact"} title={hero.headline || "Impact"} intro={hero.statement}>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {hero.intro && <p className="max-w-xl text-base leading-relaxed text-ink-300">{hero.intro}</p>}
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#progress" variant="solid">
              {hero.primaryLabel}
            </ButtonLink>
            <ButtonLink href="#measurement" variant="outline">
              {hero.secondaryLabel}
            </ButtonLink>
          </div>
        </div>
      </PageHero>

      {/* 1. Photos and the three pathways */}
      <section aria-label="Impact pathways" className="container-site pt-10 pb-20 sm:pb-28">
        {hero.tiles.length > 0 && (
          <Reveal stagger={0.08} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
            {hero.tiles.map((t) => (
              <figure key={t.image.url} data-reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface md:aspect-auto md:h-80">
                <Image src={t.image.url} alt={t.image.alt || t.caption} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                {t.caption && (
                  <figcaption className="hud absolute inset-x-3 bottom-3 rounded-md bg-white/95 px-3 py-2 text-ink">{t.caption}</figcaption>
                )}
              </figure>
            ))}
          </Reveal>
        )}
        <Reveal as="ul" stagger={0.08} className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
          {impact.pathways.map((p, i) => (
            <li key={p.title} data-reveal className={i > 0 ? "md:pl-8" : "md:pr-8"}>
              <p className="font-display text-2xl font-bold text-ink">{p.title}</p>
              {p.subtitle && <p className="mt-2 text-muted">{p.subtitle}</p>}
            </li>
          ))}
        </Reveal>
      </section>

      {/* 2. Fund I outcomes */}
      <section aria-labelledby="progress-title" id="progress" className={`scroll-mt-20 bg-surface ${sectionY}`}>
        <div className="container-site">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Heading id="progress-title" eyebrow={outcomes.eyebrow} headline={outcomes.headline} intro={outcomes.intro} />
            {outcomes.status && <p className="hud max-w-xs text-muted lg:text-right">{outcomes.status}</p>}
          </div>
          <Reveal as="ul" stagger={0.06} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.measures.map((m) => (
              <li key={m.label} data-reveal className="flex flex-col rounded-2xl border border-line bg-white p-6">
                <p className="hud text-muted">{m.label}</p>
                <p className={m.value ? "display mt-6 text-4xl text-ink" : "display mt-6 text-2xl text-ink"}>{m.value || "In preparation"}</p>
                {m.unit && <p className="mt-1 text-teal-ink">{m.unit}</p>}
                {m.definition && <p className="mt-6 text-sm leading-relaxed text-muted">{m.definition}</p>}
              </li>
            ))}
          </Reveal>
          {outcomes.footnote && <p className="mt-6 text-sm text-muted">{outcomes.footnote}</p>}
        </div>
      </section>

      {/* 2b. Global footprint */}
      <section aria-labelledby="footprint-title" id="footprint" className={`scroll-mt-20 ${sectionY}`}>
        <div className="container-site">
          <Heading id="footprint-title" eyebrow={footprint.eyebrow} headline={footprint.headline} intro={footprint.intro} />
          <div className="mt-10">
            <FootprintExplorer countries={footprint.countries} companyNames={names} footnote={footprint.footnote} />
          </div>
        </div>
      </section>

      {/* 3. Pathways and SDGs */}
      <section aria-labelledby="sdgs-title" className={`border-t border-line ${sectionY}`}>
        <div className="container-site">
          <Heading id="sdgs-title" eyebrow={sdgs.eyebrow} headline={sdgs.headline} intro={sdgs.intro} />
          <Reveal as="ul" stagger={0.08} className="mt-12 grid gap-8 md:grid-cols-3">
            {impact.pathways.map((p, i) => (
              <li key={p.title} data-reveal className="flex flex-col border-t border-line pt-6">
                <p className="hud text-teal-ink">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display mt-3 text-2xl text-ink">{p.title}</h3>
                {p.body && <p className="mt-3 leading-relaxed text-ink/80">{p.body}</p>}
                {p.companies.length > 0 && <p className="mt-auto pt-6 text-sm text-muted">{list(p.companies)}</p>}
              </li>
            ))}
          </Reveal>
          <div className="mt-14">
            <SdgExplorer goals={sdgs.goals} companyNames={names} note={sdgs.note} people={people} />
          </div>
        </div>
      </section>

      {/* 4. Measurement and accountability */}
      <section aria-labelledby="measurement-title" id="measurement" className={`scroll-mt-20 ${sectionY}`}>
        <div className="container-site">
          <Heading id="measurement-title" eyebrow={measurement.eyebrow} headline={measurement.headline} intro={measurement.intro} />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            <ul className="divide-y divide-line border-y border-line">
              {measurement.items.map((item, i) => (
                <li key={item.title}>
                  <details className="group" open={i === 0}>
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-bold text-ink marker:hidden hover:text-teal-ink [&::-webkit-details-marker]:hidden">
                      {item.title}
                      <Plus className="size-5 shrink-0 text-teal-ink transition-transform duration-300 group-open:rotate-45" aria-hidden />
                    </summary>
                    <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.body}</p>
                  </details>
                </li>
              ))}
            </ul>
            <div className="self-start rounded-3xl bg-surface p-6 sm:p-8">
              <p className="eyebrow text-teal-ink">Reports &amp; policies</p>
              <ul className="mt-4 divide-y divide-line">
                {measurement.reports.map((r) => (
                  <li key={r.title} className="py-5">
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-lg font-bold text-ink hover:text-teal-ink">
                        {r.title} <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    ) : (
                      <p className="text-lg font-bold text-ink">{r.title}</p>
                    )}
                    {!r.href && r.status && <p className="mt-1 text-sm text-muted">{r.status}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {measurement.process.length > 0 && (
            <div className="mt-16">
              <p className="display text-2xl text-ink sm:text-3xl">{measurement.processTitle}</p>
              <Reveal as="ul" stagger={0.06} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {measurement.process.map((p) => (
                  <li key={p.step} data-reveal className="border-t border-line pt-5">
                    <p className="eyebrow text-teal-ink">{p.step}</p>
                    <p className="mt-3 leading-relaxed text-ink/80">{p.text}</p>
                  </li>
                ))}
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
