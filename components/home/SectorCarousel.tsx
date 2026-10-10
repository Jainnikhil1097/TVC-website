"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { InvestmentSector } from "@/lib/cms";
import { ButtonLink } from "@/components/ui/Button";
import { AccentRule } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const PATTERNS = [
  // Subtle surface textures so each "planet" is distinct while staying monochrome.
  "radial-gradient(circle, rgb(255 255 255 / 0.28) 1px, transparent 1.4px) 0 0 / 9px 9px",
  "repeating-linear-gradient(0deg, rgb(255 255 255 / 0.1) 0 1px, transparent 1px 11px)",
  "linear-gradient(rgb(255 255 255 / 0.08) 1px, transparent 1px) 0 0 / 14px 14px, linear-gradient(90deg, rgb(255 255 255 / 0.08) 1px, transparent 1px) 0 0 / 14px 14px",
  "repeating-radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.09) 0 1px, transparent 1px 12px)",
];

function Orb({ index, className }: { index: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative aspect-square rounded-full", className)}
      style={{
        background:
          "radial-gradient(circle at 32% 28%, #3a4350 0%, #1a2029 42%, #0a0d12 75%)",
        boxShadow:
          "inset -18px -24px 60px rgb(0 0 0 / 0.65), inset 6px 8px 24px rgb(255 255 255 / 0.05), 0 0 0 1px rgb(14 213 194 / 0.18), 0 0 60px rgb(14 213 194 / 0.12)",
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-80"
        style={{
          background: PATTERNS[index % PATTERNS.length],
          maskImage: "radial-gradient(circle at 35% 30%, #000 20%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 35% 30%, #000 20%, transparent 72%)",
        }}
      />
    </div>
  );
}

export function SectorCarousel({ sectors: investmentSectors }: { sectors: InvestmentSector[] }) {
  const count = investmentSectors.length;
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);
  if (count === 0) return null;
  const at = (offset: number) => investmentSectors[(index + offset + count) % count];

  const sector = investmentSectors[index];
  const prev = at(-1);
  const next = at(1);
  const href = sector.portfolioSector ? `/portfolio?sector=${sector.portfolioSector}` : "/portfolio";

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };
  const onPointerDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Where we invest"
      className="starfield relative overflow-hidden border-y border-white/8 bg-ink-950"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ touchAction: "pan-y" }}
    >
      <div className="relative mx-auto flex min-h-[640px] max-w-[1600px] flex-col items-center px-5 pt-20 pb-0 text-center sm:min-h-[720px] sm:pt-24">
        <p className="eyebrow text-teal">
          Where we invest <span className="text-ink-400">·</span>{" "}
          <span className="hud text-ink-300">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </p>

        <div key={sector.id} className="sector-in mt-6 flex flex-col items-center" aria-live="polite">
          <h2 className="display text-[2.6rem] uppercase sm:text-6xl lg:text-7xl">{sector.name}</h2>
          <AccentRule center className="mt-7" />
          <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-ink-200 sm:text-base">{sector.line}</p>
        </div>

        <div className="relative z-10 mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-teal hover:text-teal"
            aria-label={`Previous sector: ${prev.name}`}
          >
            <ArrowLeft className="size-4" />
          </button>
          <ButtonLink href={href}>View companies</ButtonLink>
          <button
            type="button"
            onClick={() => go(1)}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-teal hover:text-teal"
            aria-label={`Next sector: ${next.name}`}
          >
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Side "planets" peeking in from the edges, labelled like the reference */}
        <button
          type="button"
          onClick={() => go(-1)}
          tabIndex={-1}
          aria-hidden
          className="group absolute top-[46%] left-0 hidden -translate-x-[45%] items-center md:flex"
        >
          <Orb key={`p-${prev.id}`} index={(index - 1 + count) % count} className="orb-in w-40 lg:w-52" />
          <span className="ml-6 font-serif text-sm tracking-[0.2em] text-white/55 uppercase transition-colors group-hover:text-white">
            {prev.name}
          </span>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          tabIndex={-1}
          aria-hidden
          className="group absolute top-[46%] right-0 hidden translate-x-[45%] flex-row-reverse items-center md:flex"
        >
          <Orb key={`n-${next.id}`} index={(index + 1) % count} className="orb-in w-40 lg:w-52" />
          <span className="mr-6 font-serif text-sm tracking-[0.2em] text-white/55 uppercase transition-colors group-hover:text-white">
            {next.name}
          </span>
        </button>

        {/* Main planet rising from the bottom */}
        <div className="pointer-events-none mt-auto w-full translate-y-[55%]">
          <Orb key={`m-${sector.id}`} index={index} className="orb-rise mx-auto w-[min(92vw,640px)]" />
        </div>
      </div>

      {/* Sector dots */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
        {investmentSectors.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${s.name}`}
            aria-current={i === index}
            className="grid size-6 place-items-center"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-6 bg-teal" : "w-1.5 bg-white/30"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
