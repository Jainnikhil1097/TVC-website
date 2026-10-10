import { ArrowUpRight } from "lucide-react";
import {
  companyName,
  getEssays,
  getEvents,
  getNews,
  getPortfolio,
  getReports,
  getSite,
  getVideos,
} from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import type { EventItem } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { AccentRule, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PerspectivesExplorer } from "@/components/perspectives/PerspectivesExplorer";
import type { PerspectiveCard, PerspectiveTab } from "@/components/perspectives/types";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("perspectives", {
    title: "Perspectives",
    description:
      "Essays, investment notes and news from Transition VC — perspectives on India's energy transition, straight from our newsletter.",
  });
}

const day = (iso: string) => formatDate(iso.slice(0, 10));

function eventDates(e: EventItem) {
  const start = day(e.startDate);
  if (!e.endDate || e.endDate.slice(0, 10) === e.startDate.slice(0, 10)) return start;
  return `${start} – ${day(e.endDate)}`;
}

export default async function PerspectivesPage() {
  const [site, essays, videos, news, events, reports, portfolio] = await Promise.all([
    getSite(),
    getEssays(),
    getVideos(),
    getNews(),
    getEvents(),
    getReports(),
    getPortfolio(),
  ]);

  const nameOf = (slug?: string) => (slug ? companyName(portfolio, slug) : undefined);
  const linkedIn = site.socials.find((s) => /linkedin/i.test(s.label))?.href;

  const eventCard = (e: EventItem, past: boolean): PerspectiveCard => ({
    id: `${e.title}-${e.startDate}`,
    eyebrow: [past ? "Past event" : "Event", eventDates(e), e.location].filter(Boolean).join(" · "),
    title: e.title,
    teaser: e.description,
    href: e.link ?? linkedIn ?? site.substackUrl,
    action: e.link ? (past ? "Details" : "Register") : "Follow for updates",
    image: e.image,
  });

  const tabs: PerspectiveTab[] = [
    essays.length
      ? {
          id: "substack",
          label: "Substack",
          items: essays.map((e) => ({
            id: e.url,
            eyebrow: e.date ? `Substack · ${day(e.date)}` : "Substack · Essay",
            title: e.title,
            teaser: e.teaser,
            href: e.url,
            action: "Read essay",
            tag: nameOf(e.company),
            image: e.image ? { url: e.image, alt: "" } : undefined,
          })),
        }
      : {
          id: "substack",
          label: "Substack",
          placeholder: true,
          items: [
            {
              id: "substack-home",
              eyebrow: "Substack · Newsletter",
              title: "Essays and investment notes on India's energy transition",
              teaser: "Read our latest thinking on drones, cooling, carbon markets, the grid and more.",
              href: site.substackUrl,
              action: "Read on Substack",
            },
          ],
        },
    {
      id: "news",
      label: "News",
      items: news.map((n) => ({
        id: n.url,
        eyebrow: `${n.source} · ${day(n.date)}`,
        title: n.title,
        href: n.url,
        action: "Read coverage",
      })),
    },
    events.upcoming.length || events.past.length
      ? {
          id: "events",
          label: "Events",
          items: [...events.upcoming.map((e) => eventCard(e, false)), ...events.past.map((e) => eventCard(e, true))],
        }
      : {
          id: "events",
          label: "Events",
          placeholder: true,
          items: [
            {
              id: "events-soon",
              eyebrow: "Events",
              title: "No upcoming events right now",
              teaser: "Follow us on LinkedIn to hear about our next founder meet-ups, talks and roundtables.",
              href: linkedIn ?? site.substackUrl,
              action: linkedIn ? "Follow on LinkedIn" : "Subscribe for updates",
            },
          ],
        },
    reports.length
      ? {
          id: "reports",
          label: "Reports",
          items: reports.map((r) => ({
            id: `${r.title}-${r.date}`,
            eyebrow: `${r.isPdf ? "Report · PDF" : "Report"} · ${day(r.date)}`,
            title: r.title,
            teaser: r.summary,
            href: r.href ?? site.substackUrl,
            action: r.isPdf ? "Download PDF" : "Read",
            tag: r.companies.map(nameOf).filter(Boolean).join(", ") || undefined,
            image: r.cover,
          })),
        }
      : {
          id: "reports",
          label: "Reports",
          placeholder: true,
          items: [
            {
              id: "reports-soon",
              eyebrow: "Reports · Coming soon",
              title: "Research and sector reports are on their way",
              teaser: "Until then, our deepest work lives in the Substack essays.",
              href: site.substackUrl,
              action: "Read on Substack",
            },
          ],
        },
    videos.length
      ? {
          id: "youtube",
          label: "YouTube",
          items: videos.map((v) => ({
            id: v.url,
            eyebrow: v.date ? `YouTube · ${day(v.date)}` : "YouTube",
            title: v.title,
            href: v.url,
            action: "Watch",
            image: v.thumbnail ? { url: v.thumbnail, alt: "" } : undefined,
          })),
        }
      : {
          id: "youtube",
          label: "YouTube",
          placeholder: true,
          items: [
            {
              id: "youtube-channel",
              eyebrow: "YouTube · Channel",
              title: "Conversations with the founders and experts building India's energy future",
              teaser: "Fireside chats, founder stories and sector deep-dives on our YouTube channel.",
              href: site.youtubeUrl || site.substackUrl,
              action: "Visit channel",
            },
          ],
        },
  ];

  return (
    <>
      {/* Hero + carousel on a restrained dusk sky */}
      <section className="relative overflow-x-clip bg-[linear-gradient(180deg,#0a0e14_0%,#0c151c_38%,#12201f_68%,#1f2320_88%,#26241d_100%)] pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div
          aria-hidden
          className="starfield pointer-events-none absolute inset-x-0 top-0 h-2/3 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(70%_60%_at_50%_100%,rgb(214_170_110/0.10),transparent_70%)]"
        />
        <div className="container-site relative">
          <div className="text-center">
            <p className="eyebrow text-teal">Perspectives</p>
            <h1 className="display mx-auto mt-5 max-w-4xl text-[2.6rem] sm:text-6xl lg:text-7xl">
              Ideas behind the investments
            </h1>
            <AccentRule center className="mt-8" />
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">
              Perspectives on India&rsquo;s energy transition, straight from our newsletter.
            </p>
          </div>

          <div className="mt-12 sm:mt-14">
            <PerspectivesExplorer tabs={tabs} />
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <ButtonLink href={site.substackUrl}>Subscribe on Substack</ButtonLink>
            {site.youtubeUrl && (
              <ButtonLink href={site.youtubeUrl} variant="outline">
                Watch on YouTube
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {/* Full index — scannable and crawlable */}
      <section className="border-t border-white/8 py-20 sm:py-28" aria-labelledby="index-heading">
        <div className="container-site">
          <SectionHeading eyebrow="Index" title={<span id="index-heading">Everything we&rsquo;ve published</span>} />

          <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
            <Reveal>
              <h3 className="hud text-ink-400">From our Substack</h3>
              {essays.length ? (
                <ol className="mt-4 border-t border-white/8">
                  {essays.map((e, i) => (
                    <li key={e.url} className="border-b border-white/8">
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-16 items-baseline gap-5 py-4"
                      >
                        <span className="hud w-6 shrink-0 text-ink-400">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex-1">
                          <span className="block font-serif font-light text-white transition-colors group-hover:text-teal sm:text-lg">
                            {e.title}
                          </span>
                          {(e.date || nameOf(e.company)) && (
                            <span className="hud mt-1.5 block text-[0.6rem] text-ink-400">
                              {[e.date && day(e.date), nameOf(e.company)].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight
                          className="size-4 shrink-0 self-center text-ink-400 transition-colors group-hover:text-teal"
                          aria-hidden
                        />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 border-t border-white/8 pt-5 text-ink-300">
                  Read every essay on{" "}
                  <a
                    href={site.substackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-teal"
                  >
                    our Substack
                  </a>
                  .
                </p>
              )}

              {reports.length > 0 && (
                <>
                  <h3 className="hud mt-14 text-ink-400">Reports &amp; publications</h3>
                  <ul className="mt-4 border-t border-white/8">
                    {reports.map((r) => (
                      <li key={`${r.title}-${r.date}`} className="border-b border-white/8">
                        <a
                          href={r.href ?? site.substackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-16 items-baseline justify-between gap-5 py-4"
                        >
                          <span>
                            <span className="block font-serif font-light text-white transition-colors group-hover:text-teal sm:text-lg">
                              {r.title}
                            </span>
                            <span className="hud mt-1.5 block text-[0.6rem] text-ink-400">
                              {day(r.date)}
                              {r.isPdf && " · PDF"}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="size-4 shrink-0 self-center text-ink-400 transition-colors group-hover:text-teal"
                            aria-hidden
                          />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Reveal>

            <Reveal>
              <h3 className="hud text-ink-400">In the news</h3>
              <ul className="mt-4 border-t border-white/8">
                {news.map((n) => (
                  <li key={n.url} className="border-b border-white/8">
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="group block py-5">
                      <span className="hud block text-[0.6rem] text-ink-400">
                        {n.source} · <time dateTime={n.date}>{day(n.date)}</time>
                      </span>
                      <span className="mt-2 block text-[0.95rem] leading-snug text-white transition-colors group-hover:text-teal">
                        {n.title}
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
