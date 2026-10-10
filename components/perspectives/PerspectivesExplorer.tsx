"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { PerspectiveTab } from "./types";
import { CurvedCarousel } from "./CurvedCarousel";
import { cn } from "@/lib/utils";

/** Accessible tablist (Substack / News / Events / Reports / YouTube), each panel a curved carousel. */
export function PerspectivesExplorer({ tabs }: { tabs: PerspectiveTab[] }) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (selected + step + tabs.length) % tabs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const tab = tabs[selected];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Perspectives by format"
        onKeyDown={onKeyDown}
        className="no-scrollbar mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-ink-950/40 p-1 backdrop-blur-md"
      >
        {tabs.map((t, i) => {
          const active = i === selected;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(i)}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-4 text-[0.72rem] sm:px-5 sm:text-[0.78rem] font-semibold tracking-[0.08em] uppercase transition-colors duration-300",
                active ? "bg-white text-ink-950" : "text-ink-200 hover:text-white"
              )}
            >
              {t.label}
              {!t.placeholder && (
                <span className={cn("ml-2 font-mono text-[0.65rem]", active ? "text-ink-600" : "text-ink-400")}>
                  {t.items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        className="mt-12 sm:mt-14"
      >
        {/* Keyed so each tab starts at its first card. */}
        <CurvedCarousel key={tab.id} label={tab.label} items={tab.items} />
      </div>
    </div>
  );
}
