import Link from "next/link";
import { getImpact, getPortfolio, isActive } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { AccentRule, SectionHeading } from "@/components/ui/SectionHeading";
import { StatTile } from "@/components/ui/StatTile";
import { ButtonLink } from "@/components/ui/Button";
import { HeroCard } from "@/components/light/HeroCard";
import { LineArt, type LineArtVariant } from "@/components/light/LineArt";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export function generateMetadata() {
  return pageMetadata("impact", {
    title: "Impact",
    description:
      "How Transition VC's portfolio decarbonises industry, electrifies mobility, modernises the grid and makes carbon measurable.",
  });
}

// Placeholder art per theme — replace with photography when available.
const themeArt: { variant: LineArtVariant; className: string }[] = [
  { variant: "arcs", className: "bg-[linear-gradient(135deg,#dfe6e4,#c3d1ce)] text-stone/35" },
  { variant: "flow", className: "bg-[linear-gradient(135deg,#1f2b31,#4d6a72)] text-white/40" },
  { variant: "network", className: "bg-[linear-gradient(135deg,#e7e4dc,#d3cec2)] text-stone/40" },
  { variant: "dots", className: "bg-[linear-gradient(135deg,#2a3a3d,#6f8a88)] text-white/45" },
];

export default async function ImpactPage() {
  const [impact, portfolio] = await Promise.all([getImpact(), getPortfolio()]);
  const active = portfolio.filter(isActive);

  return (
    <div data-theme="light" className="pb-24">
      <HeroCard className="bg-[#4d6a72]">
        <LineArt variant="shell" className="absolute inset-0 -z-10 text-white/35 lg:left-[35%] lg:w-[65%]" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#4d6a72_0%,rgb(77_106_114/0.85)_45%,rgb(77_106_114/0.1)_100%)]"
        />
        <div className="container-site flex flex-1 flex-col justify-end pt-28 pb-12 sm:pb-16">
          <p className="eyebrow text-teal-soft">{impact.eyebrow}</p>
          <h1 className="display mt-5 max-w-3xl text-[2.6rem] sm:text-6xl lg:text-7xl">{impact.headline}</h1>
          <AccentRule className="mt-8" />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{impact.intro}</p>
        </div>
      </HeroCard>

      {/* Portfolio wordmarks */}
      <section className="container-site border-b border-stone/10 py-14" aria-labelledby="impact-backing">
        <p id="impact-backing" className="eyebrow text-center text-stone/50">
          Backing India&rsquo;s energy builders
        </p>
        <ul className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-4">
          {active.map((c) => (
            <li key={c.slug} className="font-serif text-sm tracking-[0.1em] text-stone/55 uppercase">
              {c.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Stats */}
      <section className="container-site py-16 sm:py-20" aria-label="Impact at a glance">
        <Reveal stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impact.stats.map((s) => (
            <div key={s.label} data-reveal>
              <StatTile tone="light" value={s.value} label={s.label} className="h-full" />
            </div>
          ))}
        </Reveal>
      </section>

      {/* Themes */}
      <section className="container-site">
        <SectionHeading
          tone="light"
          eyebrow="Impact themes"
          title="Where our capital goes to work"
          intro="Four themes run through our portfolio — each one a hard, physical bottleneck in India's energy transition."
        />
        <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
          {impact.themes.map((theme, i) => {
            const art = themeArt[i % themeArt.length];
            return (
              <Reveal
                key={theme.title}
                as="article"
                className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
              >
                <div
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-3xl",
                    art.className,
                    i % 2 === 1 && "md:order-2"
                  )}
                >
                  <LineArt variant={art.variant} />
                </div>
                <div>
                  <p className="hud text-teal-deep">0{i + 1}</p>
                  <h3 className="display mt-3 text-3xl sm:text-4xl">{theme.title}</h3>
                  <p className="mt-5 max-w-lg leading-relaxed text-stone/70">{theme.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Portfolio companies">
                    {theme.companies.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/portfolio?company=${c.slug}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-stone/15 px-4 text-sm text-stone/80 transition-colors hover:border-teal-deep hover:text-teal-deep"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-site mt-24">
        <Reveal className="grid gap-8 rounded-3xl bg-stone p-8 text-white sm:p-12 md:grid-cols-[1.5fr_auto] md:items-end">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Building technology that moves the needle?</h2>
            <p className="mt-5 max-w-xl text-white/70">
              We back engineering-led founders from Pre-Seed to Series A. Share your deck — we read every one.
            </p>
          </div>
          <ButtonLink href="/contact?type=startup">Pitch to us</ButtonLink>
        </Reveal>
      </section>
    </div>
  );
}
