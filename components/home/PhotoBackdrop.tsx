"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Image as CmsImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/** One full-screen hero photo: a portfolio company's cover image (built in app/(site)/page.tsx). */
export type HeroSlide = { slug: string; name: string; sector: string; summary: string; image: CmsImage };

/** How long each photo shows (keep in step with .hero-kenburns / .hero-progress in globals.css). */
export const SLIDE_MS = 6000;

/**
 * Full-screen photos behind the hero text: each crossfades in and drifts slowly
 * (Ken Burns). Photos load only as they come up: the first immediately (it's the
 * LCP image), each next one a slide ahead. Navy scrims keep the text readable on
 * any photo: from the left and bottom on desktop, mostly from the bottom on phones.
 */
export function PhotoBackdrop({ slides, index }: { slides: HeroSlide[]; index: number }) {
  const n = slides.length;
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, n > 1 ? 1 : 0]));
  const next = (index + 1) % n;
  // Mount the current photo and the one after it; keep earlier ones for crossfades.
  if (!loaded.has(index) || !loaded.has(next)) setLoaded(new Set(loaded).add(index).add(next));

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {slides.map((s, i) =>
        loaded.has(i) ? (
          <div
            key={s.slug}
            className={cn(
              "hero-photo absolute inset-0 transition-opacity duration-[1200ms] ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
            data-active={i === index || undefined}
          >
            <Image
              src={s.image.url}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn("object-cover", i === index && "hero-kenburns")}
              style={s.image.focal ? { objectPosition: `${s.image.focal.x}% ${s.image.focal.y}%` } : undefined}
            />
          </div>
        ) : null
      )}
      {/* Scrims: nav band at the top; text side (left on desktop) and the bottom */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(10_30_63/0.97)_0%,rgb(10_30_63/0.88)_30%,rgb(10_30_63/0.35)_58%,transparent_75%)] lg:bg-[linear-gradient(0deg,rgb(10_30_63/0.85)_0%,rgb(10_30_63/0.25)_45%,transparent_60%)]" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(10_30_63/0.92)_0%,rgb(10_30_63/0.7)_32%,rgb(10_30_63/0.15)_62%,transparent_80%)] lg:block" />
    </div>
  );
}

/** Progress bars: the active one fills over the slide's time; each jumps to its photo. */
export function SlideBars({
  slides,
  index,
  onSelect,
  playing,
}: {
  slides: HeroSlide[];
  index: number;
  onSelect: (i: number) => void;
  playing: boolean;
}) {
  return (
    <div className="-ml-1 flex" role="group" aria-label="Show photo">
      {slides.map((s, i) => (
        <button
          key={s.slug}
          type="button"
          aria-label={s.name}
          aria-pressed={i === index}
          onClick={() => onSelect(i)}
          className="group grid h-8 place-items-center px-1"
        >
          <span className="relative block h-[3px] w-9 overflow-hidden rounded-full bg-white/25 group-hover:bg-white/40">
            {i === index && (
              <span
                key={`${index}-${playing}`}
                className={cn("absolute inset-y-0 left-0 rounded-full bg-teal", playing ? "hero-progress" : "w-full")}
              />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Which company the photo shows. Desktop: bottom-right. Phones: a compact line under the buttons. */
export function PhotoCaption({
  slides,
  index,
  onSelect,
  playing,
}: {
  slides: HeroSlide[];
  index: number;
  onSelect: (i: number) => void;
  playing: boolean;
}) {
  const s = slides[index];
  if (!s) return null;
  return (
    <>
      <div className="hero-dive-fade absolute right-12 bottom-14 z-10 hidden w-80 text-right lg:block">
        <div key={index} className="eng-swap">
          <p className="eyebrow text-teal-soft">{s.sector}</p>
          <p className="mt-2 font-display text-2xl font-semibold">{s.name}</p>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/75">{s.summary}</p>
        </div>
        <div className="mt-4 flex items-center justify-end gap-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/85 hover:text-teal"
          >
            View company <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <SlideBars slides={slides} index={index} onSelect={onSelect} playing={playing} />
        </div>
      </div>
    </>
  );
}

/** Phones/tablets: "SUIND · Drone" and the bars, under the hero buttons. */
export function PhotoCaptionCompact({
  slides,
  index,
  onSelect,
  playing,
}: {
  slides: HeroSlide[];
  index: number;
  onSelect: (i: number) => void;
  playing: boolean;
}) {
  const s = slides[index];
  if (!s) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/15 pt-3 lg:hidden">
      <p key={index} className="eng-swap min-w-0 truncate text-[0.8rem]" aria-live="polite">
        <span className="font-semibold text-white">{s.name}</span>
        <span className="text-white/55"> · {s.sector}</span>
      </p>
      <SlideBars slides={slides} index={index} onSelect={onSelect} playing={playing} />
    </div>
  );
}

/** Advances the slideshow every SLIDE_MS while the tab is visible (not for reduced motion). */
export function useSlideTimer(count: number, setIndex: (f: (i: number) => number) => void, resetKey: number) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      clearTimeout(id);
      id = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") {
        setPlaying(true);
        tick();
      } else {
        setPlaying(false);
        clearTimeout(id);
      }
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start the clock after mount
    setPlaying(true);
    tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [count, setIndex, resetKey]);
  return playing;
}
