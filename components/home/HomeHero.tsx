"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { pitchHref } from "@/lib/site-config";
import { asset } from "@/lib/base-path";
import { BandTransition } from "@/components/motion/BandTransition";
import type { GlobeState } from "./GlobeCanvas";

// three.js ships only in this chunk, and only once we decide to mount it.
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

export type HeroSlide = {
  sector: string;
  line: string;
  company?: { name: string; summary: string; logoUrl?: string };
};

const CYCLE_MS = 2800;
// "Explore portfolio" dive: the globe turns to India and zooms in before navigating.
const DIVE_S = 0.8;

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Home hero — "Transition sweep". A full-bleed Deep Navy panel.
 * A small tiled world turned toward India appears first; a scanning band then
 * crosses India, raising its tiles and growing solar arrays and wind turbines.
 * The headline's last word cycles through the investment sectors, with a synced
 * portfolio card. On scroll, the panel recedes (shrinking, with rounding corners, over a
 * deeper navy) while the next section slides over it (CSS sticky, so touch scrolling
 * stays native).
 *
 * The poster shows the pre-sweep world instantly; without WebGL (or with reduced
 * motion / save-data) it swaps to the finished "transitioned" poster instead.
 */
export function HomeHero({ hero, slides }: { hero: string; slides: HeroSlide[] }) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const state = useRef<GlobeState>({ covered: 0, diveAt: 0, diveS: DIVE_S });
  const gsapRef = useRef<(typeof import("gsap"))["gsap"] | null>(null);
  const router = useRouter();
  const [diving, setDiving] = useState(false);
  // The band only morphs on navigation while the panel isn't covered by the content.
  const [bandActive, setBandActive] = useState(true);
  const [mountGlobe, setMountGlobe] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [staticPoster, setStaticPoster] = useState(false);
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  // Decide whether to mount the WebGL globe, after first paint and when idle.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData || !canUseWebGL()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability check after mount
      setStaticPoster(true);
      return;
    }
    const start = () => setMountGlobe(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 300);
    return () => clearTimeout(t);
  }, []);

  // Cycle the sector pill (not for reduced motion; paused while the tab is hidden).
  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const startTimer = () => {
      clearInterval(id);
      id = setInterval(() => setIndex((i) => (i + 1) % slides.length), CYCLE_MS);
    };
    // Hold the first word until the intro has played.
    const first = setTimeout(startTimer, 1600);
    const onVis = () => (document.visibilityState === "visible" ? startTimer() : clearInterval(id));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [slides.length]);

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
      gsapRef.current = gsap;
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
              state.current.covered = self.progress;
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

  // "Explore portfolio": dive into India, then navigate. The navy band then morphs
  // into the Portfolio page's header (BandTransition). Only with the live globe, and
  // never for new-tab / modified clicks.
  const onExplore = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!globeReady || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (diving) return;
    setDiving(true);
    state.current.diveAt = performance.now() / 1000;
    const g = gsapRef.current;
    const st = stage.current;
    const p = panel.current;
    if (g && st && p) {
      // Glide the globe to the middle of the panel as it zooms.
      const a = st.getBoundingClientRect();
      const b = p.getBoundingClientRect();
      g.to(st, {
        x: b.left + b.width / 2 - (a.left + a.width / 2),
        y: b.top + b.height / 2 - (a.top + a.height / 2),
        duration: DIVE_S,
        ease: "power2.inOut",
      });
    }
    window.setTimeout(() => router.push("/portfolio"), DIVE_S * 1000);
  };

  return (
    // The wrapper is two screens tall when motion is on (see .hero-scroll), so the
    // sticky panel holds while the next section (.hero-cover) slides up over it.
    <div ref={root} className="hero-scroll relative bg-ink-950">
      <div className="sticky top-0 h-svh">
        <BandTransition className="h-full" active={bandActive}>
          <section
            ref={panel}
            data-diving={diving || undefined}
            aria-label="Introduction"
            data-theme="dark"
            data-nav-dark
            className="relative isolate h-full overflow-hidden bg-ink text-white"
          >
            {/* Panel light (Brand Book: navy-led, aqua accents): lighter navy pooling behind the globe */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_32%,rgb(26_62_118/0.9),transparent_72%),linear-gradient(165deg,#0a1e3f_0%,#0c2550_55%,#081a36_100%)] lg:bg-[radial-gradient(42%_70%_at_68%_46%,rgb(26_62_118/0.9),transparent_72%),linear-gradient(165deg,#0a1e3f_0%,#0c2550_55%,#081a36_100%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(30%_26%_at_50%_32%,rgb(6_232_211/0.12),transparent_70%)] lg:bg-[radial-gradient(22%_36%_at_68%_46%,rgb(6_232_211/0.12),transparent_70%)]"
            />

            {/* Globe stage */}
            <div
              ref={stage}
              aria-hidden
              className="hero-globe absolute top-[7%] left-1/2 aspect-square w-[min(108vw,50svh)] -translate-x-1/2 sm:top-[8%] sm:w-[min(88vw,56svh)] lg:top-[45%] lg:right-[5%] lg:left-auto lg:w-[min(46vw,80svh)] lg:translate-x-0 lg:-translate-y-1/2"
            >
              <div
                className={`absolute inset-[7.5%] transition-opacity duration-700 ${globeReady || staticPoster ? "opacity-0" : "opacity-100"}`}
              >
                <Image
                  src={asset("/globe/poster-before.svg")}
                  alt=""
                  width={800}
                  height={800}
                  priority
                  unoptimized
                  className="size-full"
                />
              </div>
              {staticPoster && (
                <div className="hero-swap absolute inset-[7.5%]">
                  <Image
                    src={asset("/globe/fallback.svg")}
                    alt=""
                    width={800}
                    height={800}
                    unoptimized
                    className="size-full"
                  />
                </div>
              )}
              {mountGlobe && (
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ${globeReady ? "opacity-100" : "opacity-0"}`}
                >
                  <GlobeCanvas state={state} onReady={() => setGlobeReady(true)} />
                </div>
              )}
            </div>

            {/* Claim, bottom-left */}
            <div className="hero-dive-fade absolute inset-x-0 bottom-0 z-10 p-6 pb-8 sm:p-10 lg:p-14">
              <div className="hero-intro hero-intro--late max-w-[44rem]">
                <p className="hud flex items-center gap-3 text-teal-soft">
                  <span aria-hidden className="block h-px w-8 bg-teal" />
                  India&rsquo;s first energy-transition venture fund
                </p>
                <h1 className="display mt-5 text-[2.35rem] sm:text-6xl lg:text-[4.4rem]">
                  Engineering India&rsquo;s
                  <br />
                  future of <span className="sr-only">energy</span>
                  <SectorPill words={slides.map((s) => s.sector)} index={index} />
                </h1>
                <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/75 sm:text-base">{hero}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href={pitchHref} variant="solid">
                    Pitch to us
                  </ButtonLink>
                  <ButtonLink href="/portfolio" variant="outline" onClick={onExplore}>
                    Explore portfolio
                  </ButtonLink>
                </div>
              </div>
            </div>

            {/* Portfolio card, synced to the pill (desktop) */}
            {slide && (
              <div className="hero-dive-fade">
                <Link
                  href="/portfolio"
                  className="hero-card glass absolute right-14 bottom-14 z-10 hidden w-72 rounded-2xl p-5 transition-colors hover:border-teal/40 lg:block"
                >
                  <div key={index} className="hero-swap">
                    <p className="hud flex items-center justify-between text-teal-soft">
                      {slide.sector}
                      <ArrowUpRight className="size-3.5 text-white/60" aria-hidden />
                    </p>
                    {slide.company ? (
                      <>
                        <div className="mt-4 flex items-center gap-3">
                          {slide.company.logoUrl && (
                            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-1.5">
                              {/* Logos come from the CMS at arbitrary sizes. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={slide.company.logoUrl}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            </span>
                          )}
                          <p className="font-semibold">{slide.company.name}</p>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">
                          {slide.company.summary}
                        </p>
                        <p className="mt-4 text-xs text-white/50">In our portfolio</p>
                      </>
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-white/75">{slide.line}</p>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Dims as the panel recedes */}
            <div data-dim aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-ink opacity-0" />
          </section>
        </BandTransition>
      </div>
    </div>
  );
}

/** The cycling last word: the pill eases to each word's width while the words crossfade. */
function SectorPill({ words, index }: { words: string[]; index: number }) {
  const sizer = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<number[]>([]);

  useLayoutEffect(() => {
    const el = sizer.current;
    if (!el) return;
    const measure = () => setWidths(Array.from(el.children, (c) => (c as HTMLElement).offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [words]);

  if (!words.length) return <>energy.</>;
  return (
    <span aria-hidden className="relative ml-[0.15em] inline-block align-[0.12em]">
      {/* Invisible copies, to measure each word at the pill's type size */}
      <span ref={sizer} className="pointer-events-none invisible absolute top-0 left-0 flex whitespace-nowrap">
        {words.map((w, i) => (
          <span key={i} className="px-[0.55em] text-[0.5em] leading-none font-normal tracking-normal">
            {w}
          </span>
        ))}
      </span>
      <span
        className="relative inline-flex h-[0.86em] items-center overflow-hidden rounded-full border border-white/45 transition-[width] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ width: widths[index] ? widths[index] + 2 : undefined }}
      >
        <span
          key={index}
          className="hero-swap px-[0.55em] text-[0.5em] leading-none font-normal tracking-normal whitespace-nowrap"
        >
          {words[index]}
        </span>
      </span>
    </span>
  );
}
