"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PerspectiveCard } from "./types";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

type CurvedCarouselProps = {
  label: string;
  items: PerspectiveCard[];
};

const SPACING = 300; // px between card centres
const ROTATE = 22; // deg per step
const DEPTH = 70; // px towards viewer per step (concave curve)
const VISIBLE = 2; // cards shown either side of the active one

/**
 * Desktop: a concave, curved row of cards (CSS 3D — no WebGL). Arrow keys,
 * buttons, drag/swipe and clicking a side card all move the selection.
 * Below 1024px: a flat scroll-snap row, which is lighter and more natural on touch.
 */
export function CurvedCarousel({ label, items }: CurvedCarouselProps) {
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const count = items.length;

  const go = (i: number) => setActive(Math.max(0, Math.min(count - 1, i)));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    go(active + (e.key === "ArrowRight" ? 1 : -1));
    // Keep focus on the stage — the previously focused card is about to be hidden.
    e.currentTarget.focus();
  };

  const onPointerDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (drag.current && Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
  };
  // Swallow the click that ends a drag so it doesn't open a link.
  const onClickCapture = (e: MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current = null;
  };

  const cardStyle = (i: number): CSSProperties => {
    const o = i - active;
    const d = Math.abs(o);
    return {
      transform: `translateX(${o * SPACING}px) translateZ(${d * DEPTH}px) rotateY(${-o * ROTATE}deg)`,
      opacity: d === 0 ? 1 : d > VISIBLE ? 0 : d === 1 ? 0.55 : 0.25,
      zIndex: count - d,
      pointerEvents: d > VISIBLE ? "none" : undefined,
    };
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Desktop: curved 3D row */}
      <div className="hidden lg:block">
        <div
          tabIndex={0}
          aria-label={`${label}: use the left and right arrow keys to browse`}
          className="relative mx-auto h-[25rem] touch-pan-y rounded-3xl select-none [perspective:1800px]"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          onClickCapture={onClickCapture}
        >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {items.map((item, i) => {
              const isActive = i === active;
              const hidden = Math.abs(i - active) > VISIBLE;
              return (
                <div
                  key={item.id}
                  className="absolute top-0 left-1/2 -ml-[10.5rem] h-full w-[21rem] transition-[transform,opacity] duration-700 ease-out-expo will-change-transform"
                  style={cardStyle(i)}
                  aria-hidden={!isActive}
                >
                  <Card item={item} interactive={isActive} className={cn(!isActive && "shadow-none")} />
                  {!isActive && !hidden && (
                    // Off-centre cards: clicking brings them to the centre.
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => go(i)}
                      className="absolute inset-0 cursor-pointer rounded-3xl"
                      aria-label={`Show ${item.title}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-teal hover:text-teal disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <p className="hud min-w-16 text-center text-ink-300" aria-live="polite">
            <span className="text-white">{String(active + 1).padStart(2, "0")}</span> /{" "}
            {String(count).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === count - 1}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-teal hover:text-teal disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
            aria-label="Next"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile / tablet: flat scroll-snap row */}
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 md:-mx-8 md:scroll-px-8 md:px-8 lg:hidden">
        {items.map((item) => (
          <li key={item.id} className="grid min-h-[19rem] w-[82%] shrink-0 snap-start sm:w-[46%]">
            <Card item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
