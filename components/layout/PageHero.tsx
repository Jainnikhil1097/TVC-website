import type { ReactNode } from "react";
import { AccentRule } from "@/components/ui/SectionHeading";
import { LineArt, type LineArtVariant } from "@/components/light/LineArt";
import { cn } from "@/lib/utils";
import { BandTransition } from "@/components/motion/BandTransition";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Line-art motif for this page (each page has its own). */
  art: LineArtVariant;
  children?: ReactNode;
  className?: string;
};

/**
 * Hero for every inner page — the same ink band as the home page: tall, headline
 * anchored bottom-left, and a line-art motif on the right that fades into the
 * band so text stays readable. Server-rendered SVG, no JavaScript. Marked
 * `data-nav-dark` so the nav sits transparent over it. The headline is never
 * hidden, so it's a safe LCP element. Wrapped in BandTransition so it morphs from/to
 * the previous page's band on navigation.
 */
export function PageHero({ eyebrow, title, intro, art, children, className }: PageHeroProps) {
  return (
    <BandTransition>
      <section
        data-theme="dark"
        data-nav-dark
        className={cn(
          "starfield relative isolate flex min-h-[34rem] flex-col overflow-hidden bg-ink text-white sm:min-h-[40rem] lg:min-h-[44rem]",
          className
        )}
      >
        <LineArt variant={art} className="absolute inset-0 -z-10 text-white/30 lg:left-[35%] lg:w-[65%]" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0a1e3f_0%,rgb(10_30_63/0.85)_45%,rgb(10_30_63/0.1)_100%)]"
        />
        <div className="container-site flex flex-1 flex-col justify-end pt-28 pb-12 sm:pb-16">
          <p className="eyebrow text-teal">{eyebrow}</p>
          <h1 className="display mt-5 max-w-4xl text-[2.6rem] text-white sm:text-6xl lg:text-7xl">{title}</h1>
          <AccentRule tone="dark" className="mt-8" />
          {intro && <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">{intro}</p>}
          {children}
        </div>
      </section>
    </BandTransition>
  );
}
