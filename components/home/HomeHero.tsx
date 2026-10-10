"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AccentRule } from "@/components/ui/SectionHeading";
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
 * Home hero. Desktop/tablet: a pinned three-beat scroll scene (hero → about →
 * zoom into India) driven by one ScrollTrigger timeline. Phones get a shorter,
 * unpinned layout. The line-art poster shows instantly and remains the fallback
 * when WebGL, motion or data budget aren't available.
 */
type HomeHeroProps = { hero: string; about: string; approach: string; thesis: string };

export function HomeHero({ hero, about, approach, thesis }: HomeHeroProps) {
  const root = useRef<HTMLElement>(null);
  const state = useRef<GlobeState>({ progress: 0, sideOffset: 1.05 });
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
        state.current.sideOffset = window.innerWidth >= 1024 ? 1.05 : 0.8;
        const q = gsap.utils.selector(el);
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => {
              state.current.progress = self.progress;
            },
          },
        });
        tl.to(q("[data-beat='hero']"), { autoAlpha: 0, y: -60, duration: 0.3 }, 0.05)
          .to(q("[data-poster]"), { opacity: 0, duration: 0.2 }, 0.05)
          .fromTo(q("[data-beat='about']"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.25 }, 0.3)
          .to(q("[data-beat='about']"), { opacity: 0, x: -40, duration: 0.2 }, 0.62)
          .fromTo(q("[data-beat='india']"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.8)
          .to({}, { duration: 0.1 }, 1);
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
        className="starfield relative h-svh min-h-[640px] overflow-hidden bg-ink-900"
      >
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
          <Image src="/globe/fallback.svg" alt="" width={800} height={800} priority unoptimized className="h-auto w-full" />
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
            <AccentRule center className="mt-8" />
            <p className="mt-7 max-w-xl text-[0.95rem] leading-relaxed text-ink-200 sm:text-base">{hero}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/portfolio">Explore portfolio</ButtonLink>
              <ButtonLink href="/contact?type=startup" variant="outline">
                Pitch to us
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

        {/* Beat 2 — about (desktop/tablet only; phones get the static section below) */}
        <div
          data-beat="about"
          className="pointer-events-none absolute inset-0 z-10 hidden items-center opacity-0 md:flex"
        >
          <div className="container-site">
            <div className="pointer-events-auto max-w-md lg:max-w-lg">
              <p className="eyebrow text-teal">About Transition VC</p>
              <h2 className="display mt-5 text-4xl lg:text-6xl">Early, catalytic capital</h2>
              <AccentRule className="mt-7" />
              <p className="mt-7 leading-relaxed text-ink-200">{about}</p>
              <Link
                href="/about"
                className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold tracking-[0.08em] text-white uppercase hover:text-teal"
              >
                Meet the team <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Beat 3 — India close-up */}
        <div
          data-beat="india"
          className="pointer-events-none absolute inset-0 z-10 hidden items-end pb-16 opacity-0 md:flex"
        >
          <div className="container-site flex justify-end">
            <div className="max-w-md text-right">
              <AccentRule className="ml-auto" />
              <p className="mt-6 font-serif text-xl leading-relaxed font-light text-white lg:text-2xl">
                &ldquo;{approach}&rdquo;
              </p>
              <p className="mt-5 text-sm leading-relaxed text-ink-300">{thesis}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
