import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Essay, EventItem, NewsItem } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils";

type TeaserProps = {
  essays: Essay[];
  news: NewsItem[];
  nextEvent?: EventItem;
  substackUrl: string;
};

/** Latest Substack essays, the next event and recent press. */
export function PerspectivesTeaser({ essays, news, nextEvent, substackUrl }: TeaserProps) {
  const latest = essays.slice(0, 3);
  const headlines = news.slice(0, 4);
  return (
    <section aria-labelledby="perspectives-title" className="border-t border-line bg-surface py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Perspectives"
            title={<span id="perspectives-title">Latest thinking</span>}
            intro="Essays on India's energy transition from our Substack, plus news and events."
          />
          <ButtonLink href="/perspectives" variant="secondary" className="shrink-0">
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
                className="group flex flex-col rounded-2xl border border-line bg-white p-7 transition-[border-color,box-shadow] hover:border-teal-ink/40 hover:shadow-[0_8px_30px_rgb(11_22_38/0.06)]"
              >
                <span className="hud text-teal-ink">Substack{e.date && ` · ${formatDate(e.date.slice(0, 10))}`}</span>
                <h3 className="mt-5 font-serif text-xl leading-snug text-ink">{e.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">{e.teaser}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-semibold text-ink group-hover:text-teal-ink">
                  Read the essay <ArrowUpRight className="size-3.5" aria-hidden />
                </span>
              </a>
            ))}
          </Reveal>
        ) : (
          <a
            href={substackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-12 flex items-center justify-between gap-6 rounded-2xl border border-line bg-white p-7 transition-colors hover:border-teal-ink/40"
          >
            <span>
              <span className="hud text-teal-ink">Substack</span>
              <span className="mt-3 block font-serif text-xl text-ink">Read our latest essays on Substack</span>
            </span>
            <ArrowUpRight className="size-5 shrink-0 text-muted group-hover:text-teal-ink" aria-hidden />
          </a>
        )}

        {nextEvent && (
          <a
            href={nextEvent.link || "/perspectives"}
            {...(nextEvent.link ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group mt-4 flex flex-col gap-3 rounded-2xl border border-teal-ink/25 bg-white p-6 transition-colors hover:border-teal-ink/50 sm:flex-row sm:items-center sm:gap-8"
          >
            <span className="hud inline-flex items-center gap-2 text-teal-ink">
              <CalendarDays className="size-3.5" aria-hidden /> Next event · {formatDate(nextEvent.startDate.slice(0, 10))}
            </span>
            <span className="flex-1 font-serif text-lg text-ink">{nextEvent.title}</span>
            {nextEvent.location && <span className="hud text-muted">{nextEvent.location}</span>}
          </a>
        )}

        {headlines.length > 0 && (
          <div className="mt-14">
            <p className="eyebrow text-muted">In the news</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {headlines.map((n) => (
                <li key={n.url}>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:gap-8"
                  >
                    <span className="w-28 shrink-0 text-sm text-muted">{formatDate(n.date.slice(0, 10))}</span>
                    <span className="flex-1 text-[0.95rem] text-ink group-hover:text-teal-ink">{n.title}</span>
                    <span className="text-sm text-muted">{n.source}</span>
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
