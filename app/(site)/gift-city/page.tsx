import { getGiftCity, getMetrics, getSite } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import type { Metric } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { AccentRule } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { HeroCard } from "@/components/light/HeroCard";
import { LineArt, type LineArtVariant } from "@/components/light/LineArt";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("giftCity", {
    title: "GIFT City Fund",
    description:
      "Transition VC's GIFT City (IFSC) platform: a regulated route for international and NRI investors into India's energy transition.",
  });
}

/** Finds a fund metric by label keyword, falling back to a position in the list. */
function pick(items: Metric[], keyword: RegExp, fallback: number) {
  return items.find((m) => keyword.test(m.label)) ?? items[fallback];
}

// Bento layout: wide cards carry placeholder art (replace with photography when available).
const bento: { span: boolean; art?: { variant: LineArtVariant; className: string } }[] = [
  { span: true, art: { variant: "skyline", className: "bg-[linear-gradient(180deg,#1f2b33,#6f8790)] text-white/40" } },
  { span: false },
  { span: false },
  { span: true, art: { variant: "network", className: "bg-[linear-gradient(135deg,#e6ebef,#cfd8df)] text-ink/40" } },
];

export default async function GiftCityPage() {
  const [giftCity, site, metrics] = await Promise.all([getGiftCity(), getSite(), getMetrics()]);

  // Headline fund figures, shown in the "logo row" position of the reference.
  const facts = [
    pick(metrics.items, /raised|fund size/i, 0),
    pick(metrics.items, /portfolio|companies/i, 2),
    { value: site.investmentCriteria.stage, label: "Stage" },
    { value: site.investmentCriteria.cheque, label: "Cheque size" },
  ].filter((f): f is Metric => Boolean(f?.value));

  return (
    <div data-theme="light" className="pb-24">
      <HeroCard className="bg-[linear-gradient(180deg,#0a1e3f_0%,#11284f_100%)]">
        <LineArt variant="skyline" className="absolute inset-x-0 bottom-0 -z-10 h-[72%] text-white/25" />
        <div className="container-site flex flex-1 flex-col justify-end pt-28 pb-10 lg:pb-16">
          <p className="eyebrow text-teal">{giftCity.eyebrow}</p>
          <h1 className="display mt-5 max-w-4xl text-[2.3rem] leading-[0.98] tracking-[0.04em] uppercase sm:text-6xl lg:max-w-[58%] lg:text-7xl">
            {giftCity.headline}
          </h1>
          <p className="mt-8 max-w-xl leading-relaxed text-white/80 lg:hidden">{giftCity.intro}</p>
        </div>
        {/* Notched intro panel (desktop), echoing the Nilsson reference. */}
        <div className="absolute right-0 bottom-0 hidden rounded-tl-[1.75rem] bg-paper p-8 pl-10 text-ink/75 lg:block lg:max-w-[22rem] xl:max-w-sm">
          <p className="text-sm leading-relaxed">{giftCity.intro}</p>
        </div>
      </HeroCard>

      {/* Key facts */}
      <section className="container-site border-b border-ink/10 py-12" aria-label="Transition VC at a glance">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {facts.map((f) => (
            <li key={f.label}>
              <p className="display text-2xl text-stone sm:text-3xl">{f.value}</p>
              <p className="eyebrow mt-2 text-ink/55">{f.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Intro */}
      <section className="container-site grid gap-10 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="eyebrow inline-flex rounded-full bg-stone px-3 py-1.5 text-white">GIFT City</span>
          <h2 className="display mt-6 text-3xl sm:text-4xl lg:text-[2.75rem]">
            Same team, same thesis — built for global investors
          </h2>
          <AccentRule className="mt-6" />
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 leading-relaxed text-ink/75">
          <p>{giftCity.intro}</p>
          <p>{site.thesis}</p>
          <div className="pt-3">
            <ButtonLink href={giftCity.cta.href} variant="primary">
              {giftCity.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* Highlights bento */}
      <section className="container-site" aria-label="Fund highlights">
        <Reveal stagger={0.08} className="grid gap-4 lg:grid-cols-3">
          {giftCity.highlights.map((h, i) => {
            const cell = bento[i % bento.length];
            return (
              <article
                key={h.title}
                data-reveal
                className={cn(
                  "overflow-hidden rounded-3xl bg-white",
                  cell.span && "lg:col-span-2",
                  cell.art && "grid sm:grid-cols-2"
                )}
              >
                {cell.art && (
                  <div className={cn("relative min-h-48 sm:min-h-full", cell.art.className, i % 2 === 1 && "sm:order-2")}>
                    <LineArt variant={cell.art.variant} className="absolute inset-0" />
                  </div>
                )}
                <div className="flex flex-col p-7 sm:p-9">
                  <h3 className="display mt-3 text-2xl sm:text-3xl">{h.title}</h3>
                  <p className="mt-4 leading-relaxed text-ink/70">{h.body}</p>
                </div>
              </article>
            );
          })}
        </Reveal>
      </section>

      {/* Contact route */}
      <section className="container-site mt-16 sm:mt-24">
        <div data-theme="dark" className="rounded-3xl">
        <Reveal className="grid gap-8 rounded-3xl bg-ink p-8 text-white sm:p-12 md:grid-cols-[1.5fr_auto] md:items-end">
          <div>
            <p className="eyebrow text-teal">Investor relations</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl">Speak to our GIFT City team</h2>
            <p className="mt-5 max-w-xl text-white/70">
              Our investor relations team and Manager – Compliance (GIFT City) can walk you through the structure,
              eligibility and documentation.
            </p>
          </div>
          <ButtonLink href={giftCity.cta.href} variant="solid">Investor enquiries</ButtonLink>
        </Reveal>
        </div>
      </section>
    </div>
  );
}
