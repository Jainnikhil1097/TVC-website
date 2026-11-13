"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PerspectiveCard } from "./types";
import { Card } from "./Card";

type CardRowProps = {
  label: string;
  items: PerspectiveCard[];
};

/**
 * A left-aligned, horizontally scrolling row of cards: the first card starts at
 * the left edge and the next one peeks in on the right, so it's clear there's
 * more. Native scrolling (trackpad, touch, keyboard via Tab) with scroll-snap;
 * on larger screens, arrow buttons step one card at a time and disable at the ends.
 */
export function CardRow({ label, items }: CardRowProps) {
  const row = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = row.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, items.length]);

  const step = (dir: 1 | -1) => {
    const el = row.current;
    const card = el?.querySelector<HTMLElement>("li");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  };

  const overflows = !(atStart && atEnd);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={row}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:scroll-px-0 lg:gap-5 lg:px-0"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="grid min-h-[19rem] w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2.5rem)/3.25)]"
          >
            <Card item={item} />
          </li>
        ))}
      </ul>

      {overflows && (
        <div className="mt-8 hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            className="grid size-11 place-items-center rounded-full border border-ink/20 bg-white text-ink transition-colors hover:border-teal-ink hover:text-teal-ink disabled:opacity-35 disabled:hover:border-ink/20 disabled:hover:text-ink"
            aria-label={`Previous — ${label}`}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            className="grid size-11 place-items-center rounded-full border border-ink/20 bg-white text-ink transition-colors hover:border-teal-ink hover:text-teal-ink disabled:opacity-35 disabled:hover:border-ink/20 disabled:hover:text-ink"
            aria-label={`Next — ${label}`}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <p className="ml-2 text-sm text-muted">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      )}
    </div>
  );
}
