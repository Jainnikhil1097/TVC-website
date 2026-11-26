import { getGiftCity, getSite } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { AccentRule } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { HeroCard } from "@/components/light/HeroCard";
import { PauseOffscreen } from "@/components/motion/PauseOffscreen";
import { spectrumCss } from "@/components/home/flow-geometry";
import { LineArt, type LineArtVariant } from "@/components/light/LineArt";
import { cn } from "@/lib/utils";
import { IfscaDisclosures } from "@/components/gift-city/IfscaDisclosures";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("giftCity", {
    title: "GIFT City Fund",
    description:
      "Transition VC's GIFT City (IFSC) platform: a regulated route for international and NRI investors into India's energy transition.",
  });
}

// Bento layout: wide cards carry placeholder art (replace with photography when available).
const bento: { span: boolean; art?: { variant: LineArtVariant; className: string } }[] = [
  { span: true, art: { variant: "skyline", className: "bg-[linear-gradient(180deg,#1c1c1c,#6b6b6b)] text-white/40" } },
  { span: false },
  { span: false },
  { span: true, art: { variant: "network", className: "bg-[linear-gradient(135deg,#ebebeb,#d4d4d4)] text-ink/40" } },
];

export default async function GiftCityPage() {
  const [giftCity, site] = await Promise.all([getGiftCity(), getSite()]);

  return (
    <div data-theme="light" className="pb-24">
      <HeroCard className="bg-[linear-gradient(180deg,#000000_0%,#0b0e13_100%)]">
        <LineArt variant="skyline" animated className="hero-depth absolute inset-x-0 bottom-0 -z-10 h-[72%] text-white/35" />
        {/* Amber → aqua tint, matching the home wave (see PageHero). */}
        <div
          aria-hidden
          className="hero-depth pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[72%] mix-blend-color"
          style={{ backgroundImage: spectrumCss() }}
        />
        <PauseOffscreen />
        <div className="container-site flex flex-1 flex-col justify-end pt-28 pb-10 lg:pb-16">
          <div className="hero-intro">
            <p className="eyebrow text-teal">{giftCity.eyebrow}</p>
            <h1 className="display mt-5 max-w-4xl text-[2.3rem] leading-[0.98] tracking-[0.04em] uppercase sm:text-6xl lg:max-w-[58%] lg:text-[3.75rem] lg:leading-[1.2]">
              {giftCity.headline}
            </h1>
          </div>
        </div>
      </HeroCard>

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
              Our Investor Relations team can walk you through the structure, eligibility and documentation.
            </p>
          </div>
          <ButtonLink href={giftCity.cta.href} variant="solid">Investor enquiries</ButtonLink>
        </Reveal>
        </div>
      </section>

      {giftCity.disclosures && <IfscaDisclosures d={giftCity.disclosures} />}
    </div>
  );
}
