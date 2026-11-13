import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getFunds, getGiftCity, getMetrics, getSite } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { FundsSection } from "@/components/funds/FundsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatTile } from "@/components/ui/StatTile";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("funds", {
    title: "Funds",
    description:
      "Transition VC's SEBI-registered funds, Fund I track record, and our GIFT City platform for international investors.",
  });
}

export default async function FundsPage() {
  const [funds, metrics, gift, site] = await Promise.all([getFunds(), getMetrics(), getGiftCity(), getSite()]);

  return (
    <>
      <PageHero
        art="arcs"
        eyebrow="Funds"
        title="Our funds"
        intro="SEBI-registered vehicles backing engineering-led energy-transition companies in India, from Pre-Seed to Series A."
      />

      {/* All funds */}
      <section aria-labelledby="funds-list" className="py-20 sm:py-24">
        <div className="container-site">
          <h2 id="funds-list" className="sr-only">
            All funds
          </h2>
          <FundsSection funds={funds} showAll bare />
        </div>
      </section>

      {/* Track record */}
      {metrics.items.length > 0 && (
        <section aria-labelledby="track-record" className="border-t border-line py-20 sm:py-24">
          <div className="container-site">
            <Reveal>
              <SectionHeading eyebrow="Track record" title={<span id="track-record">Fund I, by the numbers</span>} />
            </Reveal>
            <Reveal stagger={0.06} className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {metrics.items.map((m) => (
                <div key={m.label} data-reveal>
                  <StatTile value={m.value} label={m.label} note={m.note} className="h-full" />
                </div>
              ))}
            </Reveal>
            <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted">
              {metrics.asOf && <>Figures as of {formatDate(metrics.asOf.slice(0, 10))}. </>}
              {metrics.disclaimer}
            </p>
          </div>
        </section>
      )}

      {/* GIFT City */}
      {gift.headline && (
        <section aria-labelledby="gift-city" className="border-t border-line py-20 sm:py-24">
          <div className="container-site grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <Reveal>
              <SectionHeading eyebrow={gift.eyebrow || "GIFT City"} title={<span id="gift-city">{gift.headline}</span>} intro={gift.intro} />
            </Reveal>
            <Reveal className="lg:justify-self-end">
              <ButtonLink href="/gift-city" variant="secondary">
                About our GIFT City platform <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </Reveal>
          </div>
        </section>
      )}

      {/* Investor CTA */}
      <section className="pb-20 sm:pb-24">
        <div className="container-site">
          <Reveal className="flex flex-col gap-8 rounded-3xl border border-line bg-surface p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display text-3xl text-ink sm:text-4xl">Interested in investing with us?</h2>
              <p className="mt-4 max-w-xl text-muted">
                Our investor relations team will take you through our funds and how to participate.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact?type=investor">Investor enquiries</ButtonLink>
              {site.investorLoginUrl && (
                <ButtonLink href={site.investorLoginUrl} variant="secondary" external>
                  Investor login <ArrowUpRight className="size-4" aria-hidden />
                </ButtonLink>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
