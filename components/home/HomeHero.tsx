"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
};

/**
 * Home hero: the same Deep Navy band as the inner pages (PageHero), with the fund's
 * headline set in the site column and an abstract "energy flow" (EnergyFlow)
 * streaming in behind it. About the fund only — no companies. On scroll the panel
 * recedes while the next section (.hero-cover) slides over it (CSS sticky + GSAP
 * scrub, loaded on demand). Like PageHero, the band morphs into the next page's
 * band on navigation (BandTransition) while it's still uncovered.
 */
export function HomeHero({ tagline, intro, background }: Props) {
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
    <div ref={root} className="hero-scroll relative bg-ink-950">
      <div className="sticky top-0 h-svh min-h-[40rem]">
        <BandTransition className="h-full" active={bandActive}>
          <section
            ref={panel}
            aria-label="Introduction"
            data-theme="dark"
            data-nav-dark
            className="starfield relative isolate flex h-full flex-col overflow-hidden bg-ink text-white"
          >
            {/* The flow fills the panel and fades out behind the copy: from the bottom on
              phones (copy below), from the left on desktop (copy on the left). */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_75%)] lg:[mask-image:linear-gradient(to_right,transparent_12%,black_58%)]"
            >
              {background ?? <EnergyFlow tone="dark" />}
            </div>

            <div className="container-site flex h-full w-full flex-col pt-24 pb-10 sm:pb-14 lg:pt-28">
              <div className="flex flex-1 flex-col justify-end pb-10 lg:justify-center lg:pb-0">
                <div className="hero-intro max-w-[42rem]">
                  <p className="eyebrow text-teal">
                    India&rsquo;s first energy-transition venture fund
                  </p>
                  <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-bold tracking-[-0.04em] text-balance text-white sm:text-6xl lg:text-[5rem]">
                    {tagline}
                  </h1>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-200 sm:mt-7 sm:text-lg">
                    {intro}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3 sm:mt-9">
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

            {/* Dims as the panel recedes */}
            <div
              data-dim
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-ink opacity-0"
            />
          </section>
        </BandTransition>
      </div>
    </div>
  );
}
