"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { BandTransition } from "@/components/motion/BandTransition";
import { pitchHref } from "@/lib/site-config";
import { EnergyFlow } from "./EnergyFlow";

type Props = {
  /** Site settings → Messaging → Tagline. */
  tagline: string;
  /** Site settings → Messaging → Home page intro line. */
  intro: string;
  /** Background motion; defaults to the energy flow. */
  background?: ReactNode;
  /**
   * The background spans the whole hero (behind the copy) instead of fading out to
   * the side; a soft dark shade behind the copy keeps the text readable.
   */
  backgroundFull?: boolean;
};

/**
 * Splits the headline into two lines of near-equal length (by characters, at a word
 * break), so they read as a pair, e.g. "Engineering the / Future of Energy". Short
 * headlines (one or two words) stay on one line.
 */
export function headlineLines(text: string): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return [words.join(" ")];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Home hero: the same black band as the inner pages (PageHero), with the fund's
 * headline set in the site column and an abstract "energy flow" (EnergyFlow)
 * streaming in behind it. About the fund only — no companies. On scroll the panel
 * recedes while the next section (.hero-cover) slides over it (CSS sticky + GSAP
 * scrub, loaded on demand). Like PageHero, the band morphs into the next page's
 * band on navigation (BandTransition) while it's still uncovered.
 */
export function HomeHero({ tagline, intro, background, backgroundFull = false }: Props) {
  // The default energy flow runs edge to edge.
  const full = backgroundFull || !background;
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  // Only morph on navigation while the panel isn't covered by the content.
  const [bandActive, setBandActive] = useState(true);

  useEffect(() => {
    const el = root.current;
    const p = panel.current;
    if (!el || !p) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const scrollTrigger = {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          };
          gsap.to(p, {
            scale: 0.92,
            borderRadius: 36,
            ease: "none",
            scrollTrigger: {
              ...scrollTrigger,
              onUpdate: (self) => {
                const uncovered = self.progress < 0.3;
                setBandActive((prev) =>
                  prev === uncovered ? prev : uncovered,
                );
              },
            },
          });
          gsap.to(p.querySelector("[data-dim]"), {
            opacity: 0.5,
            ease: "none",
            scrollTrigger,
          });
        });
        revert = () => mm.revert();
      },
    );
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    // Two screens tall when motion is on (.hero-scroll), so the sticky panel holds
    // while the next section slides up over it.
    <div ref={root} className="hero-scroll relative bg-black">
      <div className="sticky top-0 h-svh min-h-[40rem]">
        <BandTransition className="h-full" active={bandActive}>
          <section
            ref={panel}
            aria-label="Introduction"
            data-theme="dark"
            data-nav-dark
            className="starfield relative isolate flex h-full flex-col overflow-hidden bg-black text-white"
          >
            {/* Side backgrounds fade out behind the copy (from the bottom on phones, from
              the left on desktop). Full-bleed ones — including the default energy flow —
              stay whole, with a soft dark shade behind the copy instead. */}
            <div
              aria-hidden
              className={
                full
                  ? "absolute inset-0 -z-10"
                  : "absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_75%)] lg:[mask-image:linear-gradient(to_right,transparent_12%,black_58%)]"
              }
            >
              {background ?? <EnergyFlow tone="dark" />}
            </div>
            {full && (
              <div
                aria-hidden
                className={
                  background
                    ? "pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(0_0_0/0.92)_0%,rgb(0_0_0/0.55)_45%,transparent_80%)] lg:bg-[radial-gradient(70%_80%_at_18%_60%,rgb(0_0_0/0.88),rgb(0_0_0/0.4)_55%,transparent_85%)]"
                    : // Softer for the wave: lines stay visible under the text, just quieter.
                      "pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(0_0_0/0.85)_0%,rgb(0_0_0/0.45)_40%,transparent_75%)] lg:bg-[radial-gradient(60%_70%_at_20%_58%,rgb(0_0_0/0.82),rgb(0_0_0/0.35)_55%,transparent_85%)]"
                }
              />
            )}

            <div className="container-site flex h-full w-full flex-col pt-24 pb-10 sm:pb-14 lg:pt-28">
              <div className="flex flex-1 flex-col justify-end pb-10 lg:justify-center lg:pb-0">
                {/* One measure for the block: the headline's longer line sets the width; the
                  intro wraps to it (w-0 min-w-full), and the tag sits inside it. */}
                <div className="hero-intro w-fit max-w-full">
                  {/* Brand Book tagline (Baron caps, Montserrat stand-in), Mint, as a small tag. */}
                  <p className="tagline inline-block rounded-[10px] border border-teal-soft/30 bg-black/40 px-3 py-1.5 text-[0.625rem] text-teal-soft backdrop-blur-sm sm:text-[0.8rem]">
                    India&rsquo;s first energy-transition venture fund
                  </p>
                  <h1 className="mt-6 font-display text-[2.6rem] leading-[1.08] font-bold tracking-[-0.035em] text-white sm:text-6xl lg:text-[3.75rem] lg:leading-[1.2]">
                    {headlineLines(tagline).map((line, i) => (
                      <span key={line} className="block">
                        {i > 0 && " "}
                        {line}
                      </span>
                    ))}
                  </h1>
                  <p className="mt-6 w-0 min-w-full text-base leading-relaxed text-pretty text-ink-200 sm:text-lg">
                    {intro}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href={pitchHref} variant="solid">
                      Pitch to us
                    </ButtonLink>
                    <ButtonLink href="/portfolio" variant="outline">
                      Explore portfolio
                    </ButtonLink>
                  </div>
                </div>
              </div>

            </div>

            {/* Scroll cue (as on the earlier home page): tablet and desktop only */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" })}
              aria-label="Scroll to learn more"
              className="glass absolute bottom-6 left-1/2 z-10 hidden size-12 -translate-x-1/2 place-items-center rounded-full text-white/80 transition-colors hover:text-teal md:grid"
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>

            {/* Dims as the panel recedes */}
            <div
              data-dim
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-black opacity-0"
            />
          </section>
        </BandTransition>
      </div>
    </div>
  );
}
