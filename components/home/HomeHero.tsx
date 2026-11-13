"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AccentRule } from "@/components/ui/SectionHeading";
import { pitchHref } from "@/lib/site-config";
import { asset } from "@/lib/base-path";
import type { GlobeState } from "./GlobeCanvas";

// three.js ships only in this chunk, and only once we decide to mount it.
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Home hero — the site's one dark, animated moment. On desktop/tablet a short
 * pinned scroll lets the globe rise and zoom into India while the headline fades,
 * then the page continues into light sections. Phones get the same move via a
 * CSS-sticky panel (no JS pinning), framed so all of India stays in view. The line-art
 * poster shows instantly and remains the fallback when WebGL, motion or data
 * budget aren't available.
 */
export function HomeHero({ hero }: { hero: string }) {
  const root = useRef<HTMLElement>(null);
  // sideOffset 0: the globe stays centred as it rises and zooms (no side-by-side beat).
  const state = useRef<GlobeState>({ progress: 0, sideOffset: 0 });
  const [mountGlobe, setMountGlobe] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  // Decide whether to mount the WebGL globe, after first paint and when idle.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData || !canUseWebGL()) return;
    const start = () => setMountGlobe(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
  }, []);

  // Pinned scroll scene. GSAP is imported on demand so it never sits on the
  // critical path (or leaks into other pages' shared chunks).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(el);
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=110%",
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => {
              state.current.progress = self.progress;
            },
          },
        });
        // The static poster isn't faded here: it hides itself once the 3D globe is
        // ready, and must stay visible on devices where the globe can't load.
        tl.to(q("[data-beat='hero']"), { autoAlpha: 0, y: -60, duration: 0.35 }, 0.05).to({}, { duration: 0.1 }, 1);
        return () => {
          state.current.progress = 0;
        };
      });

      // Phones: the same rise-and-zoom, driven by scrolling through the taller hero
      // while its sticky panel keeps the globe on screen — no JS pinning, so touch
      // scrolling stays native and smooth.
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        // Don't recalculate on every address-bar show/hide while scrolling.
        ScrollTrigger.config({ ignoreMobileResize: true });
        const q = gsap.utils.selector(el);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            // The extra height of the section = the time the sticky panel stays on screen.
            end: "bottom bottom",
            scrub: 0.4,
            onUpdate: (self) => {
              state.current.progress = self.progress;
            },
          },
        });
        tl.to(q("[data-beat='hero']"), { autoAlpha: 0, y: -40, duration: 0.3, ease: "power1.in" }, 0).to(
          {},
          { duration: 0.7 },
          0.3
        );
        return () => {
          state.current.progress = 0;
        };
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    // React owns this wrapper; GSAP's pin-spacer is inserted *inside* it, so on
    // navigation React removes the wrapper cleanly instead of hunting for a
    // <section> that GSAP has moved (which throws "removeChild … not a child").
    <div>
      <section
        ref={root}
        aria-label="Introduction"
        data-theme="dark"
        data-nav-dark
        // Phones: a taller scroll area whose inner panel stays stuck to the screen
        // (CSS sticky), so the globe is in view for the whole rise-and-zoom.
        // Desktop/tablet: one screen tall; GSAP pins it instead. Without motion
        // (reduced motion / no JS) it's one screen everywhere — no empty scrolling.
        className="relative h-[200svh] bg-ink md:h-svh [html:not(.js-motion)_&]:h-svh"
      >
        <div className="starfield sticky top-0 h-svh min-h-[560px] overflow-hidden md:min-h-[640px]">
          {/* Soft teal horizon glow behind the globe */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(55%_60%_at_50%_100%,rgb(14_213_194/0.12),transparent_70%)]"
          />

          {/* Poster / fallback globe, rising from the bottom edge */}
          <div
            data-poster
            aria-hidden
            className={`pointer-events-none absolute left-1/2 top-[64%] w-[min(135vw,1100px)] -translate-x-1/2 transition-opacity duration-1000 md:top-[58%] md:w-[min(95vw,1150px)] ${
              globeReady ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image src={asset("/globe/fallback.svg")} alt="" width={800} height={800} priority unoptimized className="h-auto w-full" />
          </div>

          {/* WebGL globe */}
          {mountGlobe && (
            <div
              aria-hidden
              className={`absolute inset-0 transition-opacity duration-1000 ${globeReady ? "opacity-100" : "opacity-0"}`}
            >
              <GlobeCanvas state={state} onReady={() => setGlobeReady(true)} />
            </div>
          )}

          {/* Beat 1 — hero */}
          <div data-beat="hero" className="relative z-10 flex h-full flex-col items-center pt-28 text-center sm:pt-36">
            <div className="hero-intro container-site flex flex-col items-center">
              <p className="eyebrow text-teal">India&rsquo;s first energy-transition venture fund</p>
              <h1 className="display mt-6 max-w-5xl text-[2.5rem] uppercase sm:text-6xl lg:text-[5.5rem]">
                Engineering India&rsquo;s future of energy
              </h1>
              <AccentRule center tone="dark" className="mt-8" />
              <p className="mt-7 max-w-xl text-[0.95rem] leading-relaxed text-ink-200 sm:text-base">{hero}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <ButtonLink href={pitchHref} variant="solid">
                  Pitch to us
                </ButtonLink>
                <ButtonLink href="/portfolio" variant="outline">
                  Explore portfolio
                </ButtonLink>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" })}
              aria-label="Scroll to learn more"
              className="absolute bottom-6 left-1/2 hidden size-12 -translate-x-1/2 place-items-center rounded-full glass text-white/80 hover:text-teal md:grid"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
