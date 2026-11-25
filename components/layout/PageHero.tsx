import type { ReactNode } from "react";
import { AccentRule } from "@/components/ui/SectionHeading";
import { LineArt, type LineArtVariant } from "@/components/light/LineArt";
import { cn } from "@/lib/utils";
import { BandTransition } from "@/components/motion/BandTransition";
import { PauseOffscreen } from "@/components/motion/PauseOffscreen";
import { spectrumCss } from "@/components/home/flow-geometry";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Line-art motif for this page (each page has its own). */
  art?: LineArtVariant;
  /** Replaces the line-art motif with another background (e.g. the Portfolio sketches). */
  background?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * Hero for every inner page — the same black band as the home page: tall, headline
 * anchored bottom-left, and a line-art motif on the right that fades into the
 * band so text stays readable. The motif is animated in the home hero's style (it
 * draws in, keeps a gentle loop, pulses run along it), tinted with the home wave's
 * amber → aqua spectrum, and drifts and dims as the header scrolls away. The headline
 * lifts in on arrival and its accent rule draws across. All CSS on server-rendered
 * SVG, paused off-screen by a tiny client helper. Marked
 * `data-nav-dark` so the nav sits transparent over it. The headline is never
 * hidden, so it's a safe LCP element. Wrapped in BandTransition so it morphs from/to
 * the previous page's band on navigation.
 */
export function PageHero({ eyebrow, title, intro, art, background, children, className }: PageHeroProps) {
  return (
    <BandTransition>
      <section
        data-theme="dark"
        data-nav-dark
        className={cn(
          "starfield relative isolate flex min-h-[34rem] flex-col overflow-hidden bg-black text-white sm:min-h-[40rem] lg:min-h-[44rem]",
          className
        )}
      >
        {background ? (
          <div aria-hidden className="absolute inset-0 -z-10">
            {background}
          </div>
        ) : (
          art && (
            <>
              <LineArt variant={art} animated className="hero-depth absolute inset-0 -z-10 text-white/40 lg:left-[35%] lg:w-[65%]" />
              {/* Recolours the drawing with the home wave's amber → aqua spectrum (hue from
                  this layer, lightness from the drawing; black stays black). */}
              <div
                aria-hidden
                className="hero-depth pointer-events-none absolute inset-0 -z-10 mix-blend-color lg:left-[35%] lg:w-[65%]"
                style={{ backgroundImage: spectrumCss() }}
              />
              <PauseOffscreen />
            </>
          )
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#000000_0%,rgb(0_0_0/0.85)_45%,rgb(0_0_0/0.1)_100%)]"
        />
        <div className="container-site flex flex-1 flex-col justify-end pt-28 pb-12 sm:pb-16">
          {/* Lifts in on arrival (.hero-intro); the accent rule then draws across. */}
          <div className="hero-intro">
            <p className="eyebrow text-teal">{eyebrow}</p>
            <h1 className="display mt-5 max-w-4xl text-[2.6rem] text-white sm:text-6xl lg:text-[3.75rem] lg:leading-[1.2]">{title}</h1>
            <div className="mt-8">
              <AccentRule tone="dark" className="page-rule" />
            </div>
            {intro && <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">{intro}</p>}
          </div>
          {children}
        </div>
      </section>
    </BandTransition>
  );
}
