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
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
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
              teaser: "Our latest essays on drones, cooling, carbon markets, the grid and more.",
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
              title: "No upcoming events",
              teaser: linkedIn
                ? "Follow us on LinkedIn for announcements of founder meet-ups, talks and roundtables."
                : "Subscribe to our newsletter for announcements of founder meet-ups, talks and roundtables.",
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
              eyebrow: "Reports",
              title: "No reports published yet",
              teaser: "Our in-depth sector research is in our Substack essays.",
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
              title: "Founder conversations and sector deep-dives",
              teaser: "Fireside chats and founder stories on our YouTube channel.",
              href: site.youtubeUrl || site.substackUrl,
              action: "Visit channel",
            },
          ],
        },
  ];

  return (
    <>
      {/* Dark hero, then the formats carousel on its own light band */}
      <PageHero
        art="flow"
        eyebrow="Perspectives"
        title="Ideas behind the investments"
        intro={<>Perspectives on India&rsquo;s energy transition, straight from our newsletter.</>}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={site.substackUrl} variant="solid">
            Subscribe on Substack
          </ButtonLink>
          {site.youtubeUrl && (
            <ButtonLink href={site.youtubeUrl} variant="outline">
              Watch on YouTube
            </ButtonLink>
          )}
        </div>
      </PageHero>

      {/* Clipped so the card row (which bleeds to the screen edge on phones) never causes sideways scrolling. */}
      <section aria-label="Latest from Transition VC" className="overflow-x-clip border-b border-line bg-surface py-14 sm:py-20">
        <div className="container-site">
          <PerspectivesExplorer tabs={tabs} />
        </div>
      </section>

      {/* Full index — scannable and crawlable */}
      <section className="py-20 sm:py-28" aria-labelledby="index-heading">
        <div className="container-site">
          <SectionHeading eyebrow="Index" title={<span id="index-heading">Everything we&rsquo;ve published</span>} />

          <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
            <Reveal>
              <h3 className="eyebrow text-muted">From our Substack</h3>
              {essays.length ? (
                <ul className="mt-4 border-t border-line">
                  {essays.map((e) => (
                    <li key={e.url} className="border-b border-line">
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-16 items-baseline gap-5 py-4"
                      >
                        <span className="flex-1">
                          <span className="block font-serif font-light text-ink transition-colors group-hover:text-teal-ink sm:text-lg">
                            {e.title}
                          </span>
                          {(e.date || nameOf(e.company)) && (
                            <span className="mt-1 block text-sm text-muted">
                              {[e.date && day(e.date), nameOf(e.company)].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight
                          className="size-4 shrink-0 self-center text-muted transition-colors group-hover:text-teal-ink"
                          aria-hidden
                        />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 border-t border-line pt-5 text-muted">
                  Read every essay on{" "}
                  <a
                    href={site.substackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:text-teal-ink hover:decoration-teal-ink"
                  >
                    our Substack
                  </a>
                  .
                </p>
              )}

              {reports.length > 0 && (
                <>
                  <h3 className="eyebrow mt-14 text-muted">Reports &amp; publications</h3>
                  <ul className="mt-4 border-t border-line">
                    {reports.map((r) => (
                      <li key={`${r.title}-${r.date}`} className="border-b border-line">
                        <a
                          href={r.href ?? site.substackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-16 items-baseline justify-between gap-5 py-4"
                        >
                          <span>
                            <span className="block font-serif font-light text-ink transition-colors group-hover:text-teal-ink sm:text-lg">
                              {r.title}
                            </span>
                            <span className="mt-1 block text-sm text-muted">
                              {day(r.date)}
                              {r.isPdf && " · PDF"}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="size-4 shrink-0 self-center text-muted transition-colors group-hover:text-teal-ink"
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
              <h3 className="eyebrow text-muted">In the news</h3>
              <ul className="mt-4 border-t border-line">
                {news.map((n) => (
                  <li key={n.url} className="border-b border-line">
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="group block py-5">
                      <span className="block text-sm text-muted">
                        {n.source} · <time dateTime={n.date}>{day(n.date)}</time>
                      </span>
                      <span className="mt-1.5 block text-[0.95rem] leading-snug font-medium text-ink transition-colors group-hover:text-teal-ink">
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
