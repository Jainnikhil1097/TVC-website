"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { PerspectiveTab } from "./types";
import { CardRow } from "./CardRow";
import { cn } from "@/lib/utils";

/** Accessible tablist (Substack / News / Events / Reports / YouTube), each panel a left-aligned row of cards. */
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
        className="no-scrollbar flex max-w-full gap-2 overflow-x-auto border-b border-line"
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
                "relative -mb-px min-h-12 shrink-0 border-b-2 px-3 text-[0.95rem] font-medium transition-colors duration-300 sm:px-4",
                active ? "border-teal-ink text-ink" : "border-transparent text-muted hover:text-ink"
              )}
            >
              {t.label}
              {!t.placeholder && (
                <span className="ml-1.5 text-xs text-muted tabular-nums">{t.items.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        className="mt-10 sm:mt-12"
      >
        {/* Keyed so each tab starts at its first card. */}
        <CardRow key={tab.id} label={tab.label} items={tab.items} />
      </div>
    </div>
  );
}
