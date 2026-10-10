import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import type { Company, Essay, EventItem, Metric, NewsItem } from "@/lib/types";
import { portfolioSectorName } from "@/lib/taxonomy";
import { ButtonLink } from "@/components/ui/Button";
import { AccentRule, SectionHeading } from "@/components/ui/SectionHeading";
import { StatTile } from "@/components/ui/StatTile";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils";

/**
 * Phones don't get the pinned scene, so the About + approach beats render here.
 * Also shown on larger screens whenever the scene can't run (no JS or reduced
 * motion — i.e. <html> lacks the `js-motion` class).
 */
export function MobileAbout({ about, approach }: { about: string; approach: string }) {
  return (
    <section id="about" className="border-b border-white/8 py-16 md:hidden [html:not(.js-motion)_&]:md:block">
      <div className="container-site">
        <p className="eyebrow text-teal">About Transition VC</p>
        <h2 className="display mt-5 text-4xl">Early, catalytic capital</h2>
        <AccentRule className="mt-6" />
        <p className="mt-6 leading-relaxed text-ink-200">{about}</p>
        <blockquote className="mt-10 border-l border-teal/60 pl-5 font-serif text-lg leading-relaxed font-light">
          &ldquo;{approach}&rdquo;
        </blockquote>
        <Link
          href="/about"
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold tracking-[0.08em] uppercase hover:text-teal"
        >
          Meet the team <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

type MetricsProps = { items: Metric[]; asOf?: string; disclaimer: string };

export function MetricsSection({ items, asOf, disclaimer }: MetricsProps) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="metrics-title" className="py-20 sm:py-28">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Track record"
            title={<span id="metrics-title">Fund I, by the numbers</span>}
            intro="Oversubscribed and closed, with capital working across India's energy-transition stack."
          />
        </Reveal>
        <Reveal stagger={0.08} className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.label} data-reveal>
              <StatTile value={m.value} label={m.label} note={m.note} className="h-full" />
            </div>
          ))}
        </Reveal>
        <p className="mt-6 text-xs text-ink-400">
          {asOf && <>Figures as of {formatDate(asOf.slice(0, 10))}. </>}
          {disclaimer}
        </p>
      </div>
    </section>
  );
}

/** Active companies only; featured ones first, then display order. */
export function PortfolioMarquee({ companies }: { companies: Company[] }) {
  const active = companies.filter((c) => c.status === "active");
  if (!active.length) return null;
  const ordered = [...active.filter((c) => c.featured), ...active.filter((c) => !c.featured)];
  const row = [...ordered, ...ordered];
  return (
    <section aria-labelledby="portfolio-title" className="overflow-hidden border-y border-white/8 bg-ink-950 py-16 sm:py-20">
      <div className="container-site flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-teal">Our portfolio</p>
          <h2 id="portfolio-title" className="display mt-4 text-3xl sm:text-4xl">
            Builders we back
          </h2>
        </div>
        <ButtonLink href="/portfolio" variant="outline">
          View all {active.length} companies
        </ButtonLink>
      </div>
      <div
        className="relative mt-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        aria-hidden
      >
        <ul className="animate-marquee flex w-max gap-4 hover:[animation-play-state:paused]">
          {row.map((c, i) => (
            <li
              key={`${c.slug}-${i}`}
              className="flex h-24 w-56 shrink-0 flex-col justify-center rounded-2xl border border-white/8 bg-white/[0.02] px-6"
            >
              {c.logo ? (
                <span className="relative block h-9 w-full">
                  {/* Logos are shown in white on the dark strip for a uniform look. */}
                  <Image
                    src={c.logo.url}
                    alt=""
                    fill
                    sizes="180px"
                    className="object-contain object-left opacity-85 brightness-0 invert"
                  />
                </span>
              ) : (
                <span className="font-serif text-lg text-white/90">{c.name}</span>
              )}
              <span className="hud mt-1.5 text-ink-400">{portfolioSectorName(c.sector)}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Accessible, non-animated list for screen readers */}
      <ul className="sr-only">
        {ordered.map((c) => (
          <li key={c.slug}>{c.name}</li>
        ))}
      </ul>
    </section>
  );
}

export function ApproachSection({ thesis, stage, cheque }: { thesis: string; stage: string; cheque: string }) {
  return (
    <section aria-labelledby="approach-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Our investment approach"
            title={<span id="approach-title">We underwrite the engineering</span>}
            intro={thesis}
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/contact?type=startup">Pitch to us</ButtonLink>
            <ButtonLink href="/about" variant="outline">
              How we invest
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal stagger={0.1} className="grid gap-3 sm:grid-cols-2">
          <div data-reveal className="rounded-2xl border border-white/8 bg-white/[0.03] p-7">
            <p className="hud text-teal">Stage</p>
            <p className="display mt-4 text-3xl">{stage}</p>
          </div>
          <div data-reveal className="rounded-2xl border border-white/8 bg-white/[0.03] p-7">
            <p className="hud text-teal">Cheque size</p>
            <p className="display mt-4 text-3xl">{cheque}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type TeaserProps = {
  essays: Essay[];
  news: NewsItem[];
  nextEvent?: EventItem;
  substackUrl: string;
};

export function PerspectivesTeaser({ essays, news, nextEvent, substackUrl }: TeaserProps) {
  const latest = essays.slice(0, 3);
  const headlines = news.slice(0, 4);
  return (
    <section aria-labelledby="perspectives-title" className="border-t border-white/8 py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Perspectives"
            title={<span id="perspectives-title">From our Substack</span>}
            intro="Perspectives on India's energy transition, straight from our newsletter."
          />
          <ButtonLink href="/perspectives" variant="outline" className="shrink-0">
            All perspectives
          </ButtonLink>
        </div>

        {latest.length > 0 ? (
          <Reveal stagger={0.08} className="mt-12 grid gap-4 md:grid-cols-3">
            {latest.map((e) => (
              <a
                key={e.url}
                data-reveal
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-7 transition-colors hover:border-teal/40"
              >
                <span className="hud text-teal">Substack{e.date && ` · ${formatDate(e.date.slice(0, 10))}`}</span>
                <h3 className="mt-5 font-serif text-xl leading-snug font-light">{e.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-300">{e.teaser}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-xs font-semibold tracking-[0.08em] text-white/80 uppercase group-hover:text-teal">
                  Read <ArrowUpRight className="size-3.5" />
                </span>
              </a>
            ))}
          </Reveal>
        ) : (
          <a
            href={substackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-12 flex items-center justify-between gap-6 rounded-2xl border border-white/8 bg-white/[0.02] p-7 transition-colors hover:border-teal/40"
          >
            <span>
              <span className="hud text-teal">Substack</span>
              <span className="mt-3 block font-serif text-xl font-light">Read our latest essays on Substack</span>
            </span>
            <ArrowUpRight className="size-5 shrink-0 text-white/70 group-hover:text-teal" />
          </a>
        )}

        {nextEvent && (
          <a
            href={nextEvent.link || "/perspectives"}
            {...(nextEvent.link ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group mt-4 flex flex-col gap-3 rounded-2xl border border-teal/25 bg-teal/[0.04] p-6 transition-colors hover:border-teal/50 sm:flex-row sm:items-center sm:gap-8"
          >
            <span className="hud inline-flex items-center gap-2 text-teal">
              <CalendarDays className="size-3.5" aria-hidden /> Next event · {formatDate(nextEvent.startDate.slice(0, 10))}
            </span>
            <span className="flex-1 font-serif text-lg font-light">{nextEvent.title}</span>
            {nextEvent.location && <span className="hud text-ink-300">{nextEvent.location}</span>}
          </a>
        )}

        {headlines.length > 0 && (
          <div className="mt-14">
            <p className="eyebrow text-ink-400">In the news</p>
            <ul className="mt-5 divide-y divide-white/8 border-y border-white/8">
              {headlines.map((n) => (
                <li key={n.url}>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:gap-8"
                  >
                    <span className="hud w-28 shrink-0 text-ink-400">{formatDate(n.date.slice(0, 10))}</span>
                    <span className="flex-1 text-[0.95rem] text-white/90 group-hover:text-teal">{n.title}</span>
                    <span className="hud text-ink-400">{n.source}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
