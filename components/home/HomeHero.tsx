"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { pitchHref } from "@/lib/site-config";
import { asset } from "@/lib/base-path";
import { BandTransition } from "@/components/motion/BandTransition";
import { cn } from "@/lib/utils";
import type { ModelKey } from "./engineering/registry";
import { PhotoBackdrop, PhotoCaption, PhotoCaptionCompact, useSlideTimer, type HeroSlide } from "./PhotoBackdrop";

// three.js ships only in this chunk, and only once we decide to mount it.
const EngineeringCanvas = dynamic(() => import("./engineering/EngineeringCanvas"), { ssr: false });

/** A portfolio company with a model in the hero (built in app/(site)/page.tsx). */
export type HeroFeature = { key: ModelKey; name: string; sector: string; summary: string };

// "Explore portfolio": the model flies apart, then the page changes.
const LAUNCH_MS = 700;

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Home hero. With hero photos in the CMS ("Show in home hero" on a company): a
 * full-screen photo slideshow with the text overlaid (PhotoBackdrop). Otherwise,
 * "Exploded engineering views": a full-bleed Deep Navy panel with a
 * blueprint grid, the brand line in Inter Bold, and CAD-style line drawings of
 * hardware our portfolio companies build (motor, battery pack, electrolyser, drone).
 * Each assembles, explodes into labelled parts and hands over to the next, with a
 * synced company card. Desktop visitors can drag to rotate. On scroll, the panel
 * recedes while the next section slides over it (CSS sticky).
 *
 * A static poster (the exploded motor) shows first, and stays for reduced-motion,
 * Save-Data and no-WebGL visitors.
 */
export function HomeHero({ hero, features, slides }: { hero: string; features: HeroFeature[]; slides: HeroSlide[] }) {
  // With hero photos in the CMS, the hero is a full-screen photo slideshow; without
  // any, it shows the engineering drawings.
  const photo = slides.length > 0;
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const router = useRouter();
  const [launching, setLaunching] = useState(false);
  // The band only morphs on navigation while the panel isn't covered by the content.
  const [bandActive, setBandActive] = useState(true);
  const [mount3d, setMount3d] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const [index, setIndex] = useState(0);
  const feature = features[index];
  const playing = useSlideTimer(photo ? slides.length : 0, setIndex, index);

  // Decide whether to mount the 3D view, after first paint and when idle.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (photo || reduce || saveData || !canUseWebGL() || !features.length) return;
    const start = () => setMount3d(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 300);
    return () => clearTimeout(t);
  }, [features.length, photo]);

  // Scroll handoff: while the next section slides over the sticky panel, the panel
  // recedes and dims. GSAP is loaded on demand, off the critical path.
  useEffect(() => {
    const el = root.current;
    const p = panel.current;
    if (!el || !p) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrollTrigger = { trigger: el, start: "top top", end: "bottom bottom", scrub: true };
        gsap.to(p, {
          scale: 0.9,
          borderRadius: 36,
          ease: "none",
          scrollTrigger: {
            ...scrollTrigger,
            onUpdate: (self) => {
              const uncovered = self.progress < 0.3;
              setBandActive((prev) => (prev === uncovered ? prev : uncovered));
            },
          },
        });
        gsap.to(p.querySelector("[data-dim]"), { opacity: 0.55, ease: "none", scrollTrigger });
      });
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  // Make the portfolio page instant to arrive at.
  useEffect(() => router.prefetch("/portfolio"), [router]);

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(features.length, 1)), [features.length]);

  // "Explore portfolio": fly the model apart, then navigate; the navy band then morphs
  // into the Portfolio page's header (BandTransition). Not for reduced motion, and
  // never for new-tab / modified clicks.
  const onExplore = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => router.push("/portfolio"), photo || ready3d ? LAUNCH_MS : 250);
  };

  return (
    // The wrapper is two screens tall when motion is on (see .hero-scroll), so the
    // sticky panel holds while the next section (.hero-cover) slides up over it.
    <div ref={root} className="hero-scroll relative bg-ink-950">
      <div className="sticky top-0 h-svh">
        <BandTransition className="h-full" active={bandActive}>
          <section
            ref={panel}
            data-diving={launching || undefined}
            aria-label="Introduction"
            data-theme="dark"
            data-nav-dark
            className="relative isolate flex h-full flex-col overflow-hidden bg-ink text-white"
          >
            {photo ? (
              <PhotoBackdrop slides={slides} index={index} />
            ) : (
              <>
                {/* Blueprint paper: fine grid, heavier every fifth line, fading out to the edges */}
                <div
                  aria-hidden
                  className="blueprint absolute inset-0 -z-10 [mask-image:radial-gradient(75%_60%_at_50%_30%,black,transparent)] lg:[mask-image:radial-gradient(55%_75%_at_70%_45%,black,transparent)]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[radial-gradient(70%_40%_at_50%_26%,rgb(22_52_99/0.8),transparent_70%)] lg:bg-[radial-gradient(40%_60%_at_70%_45%,rgb(22_52_99/0.8),transparent_70%)]"
                />

                {/* The engineering stage. Phones/tablets: fills the space above the card and copy.
                Desktop: the right-hand 60% of the panel. */}
                <div className="hero-dive-fade relative mt-16 min-h-[26svh] flex-1 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[60%]">
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700",
                      ready3d ? "opacity-0" : "opacity-100"
                    )}
                  >
                    <Image
                      src={asset("/hero/engineering-poster.png")}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-contain p-[4%] lg:p-[6%]"
                    />
                  </div>
                  {mount3d && (
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-700",
                        ready3d ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <EngineeringCanvas
                        keys={features.map((f) => f.key)}
                        index={index}
                        onCycle={next}
                        launch={launching}
                        onReady={() => setReady3d(true)}
                      />
                    </div>
                  )}
                </div>

                {/* Company card, phones/tablets: what this drawing is, with the product line */}
                {feature && (
                  <div className="hero-dive-fade relative z-10 px-6 sm:px-10 lg:hidden">
                    <div className="glass rounded-2xl px-4 py-3.5 sm:px-5">
                      <div key={index} className="eng-swap" aria-live="polite">
                        <p className="eyebrow text-[0.65rem] text-teal-soft">{feature.sector}</p>
                        <p className="mt-1 font-display text-lg leading-tight font-semibold">{feature.name}</p>
                        <p className="mt-1 line-clamp-2 text-[0.82rem] leading-snug text-white/70">{feature.summary}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Ticks features={features} index={index} onSelect={setIndex} />
                        <Link
                          href="/portfolio"
                          className="inline-flex min-h-8 items-center gap-1 text-[0.8rem] font-semibold text-white/85 hover:text-teal"
                        >
                          Portfolio <ArrowUpRight className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Claim. Phones/tablets: below the card. Desktop: bottom-left. */}
            <div
              className={cn(
                "hero-dive-fade z-10 p-6 pb-8 sm:p-10 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[52%] lg:flex-col lg:justify-end lg:p-14 lg:pb-16",
                // Photos: the text overlays the photo, at the bottom on phones too.
                photo ? "absolute inset-x-0 bottom-0 pt-6" : "relative pt-6"
              )}
            >
              <div className="hero-intro hero-intro--late max-w-[44rem]">
                <p className="eyebrow text-teal-soft">India&rsquo;s first energy-transition venture fund</p>
                <h1 className="mt-4 font-display text-[2.3rem] leading-[1.02] font-bold tracking-[-0.04em] sm:mt-5 sm:text-6xl lg:text-[4.25rem]">
                  Engineering
                  <br />
                  Future of Energy.
                </h1>
                <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-white/75 sm:mt-6 sm:text-lg">{hero}</p>
                <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                  <ButtonLink href={pitchHref} variant="solid">
                    Pitch to us
                  </ButtonLink>
                  <ButtonLink href="/portfolio" variant="outline" onClick={onExplore}>
                    Explore portfolio
                  </ButtonLink>
                </div>
                {photo && <PhotoCaptionCompact slides={slides} index={index} onSelect={setIndex} playing={playing} />}
              </div>
            </div>

            {photo ? (
              <PhotoCaption slides={slides} index={index} onSelect={setIndex} playing={playing} />
            ) : (
              <>
                {/* Company card, synced to the drawing (desktop) */}
                {feature && (
                  <div className="hero-dive-fade absolute right-12 bottom-12 z-10 hidden w-80 lg:block">
                    <div className="glass rounded-2xl p-5">
                      <div key={index} className="eng-swap">
                        <p className="eyebrow flex items-center justify-between text-teal-soft">
                          {feature.sector}
                          <span className="hud text-white/40">{ready3d ? "Drag to rotate" : ""}</span>
                        </p>
                        <p className="mt-3 font-display text-xl font-semibold">{feature.name}</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">{feature.summary}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Ticks features={features} index={index} onSelect={setIndex} />
                        <Link
                          href="/portfolio"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-white/85 hover:text-teal"
                        >
                          View in portfolio <ArrowUpRight className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Dims as the panel recedes */}
            <div data-dim aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-ink opacity-0" />
          </section>
        </BandTransition>
      </div>
    </div>
  );
}

/** Which company's drawing is showing; each tick jumps to one (touch-sized hit areas). */
function Ticks({
  features,
  index,
  onSelect,
}: {
  features: HeroFeature[];
  index: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="-ml-1 flex" role="group" aria-label="Show company">
      {features.map((f, i) => (
        <button
          key={f.key}
          type="button"
          aria-label={f.name}
          aria-pressed={i === index}
          onClick={() => onSelect(i)}
          className="group grid h-8 place-items-center px-1"
        >
          <span
            className={cn(
              "block h-1 rounded-full transition-all duration-500",
              i === index ? "w-8 bg-teal" : "w-4 bg-white/25 group-hover:bg-white/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}
