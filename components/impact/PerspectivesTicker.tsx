"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { title: string; url: string; date?: string };

/**
 * A slim strip under the Impact hero that cycles through the latest essays
 * ("Portfolio perspectives"), one at a time, with its date and position. Pauses while
 * hovered or focused, and stays still for reduced motion.
 */
export function PerspectivesTicker({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (items.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % items.length), 6000);
    return () => window.clearInterval(id);
  }, [items.length, paused]);
  const item = items[i];
  if (!item) return null;
  return (
    <div
      className="container-site"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mt-8 flex flex-col gap-2 rounded-2xl bg-surface px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <p className="eyebrow shrink-0 text-teal-ink">Portfolio perspectives</p>
        <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="impact-fade min-w-0 flex-1 truncate font-bold text-ink hover:text-teal-ink">
          {item.title}
        </a>
        <p className="hud shrink-0 text-muted" aria-live="polite">
          {item.date && <>{item.date} · </>}
          {i + 1} / {items.length}
        </p>
        {items.length > 1 && (
          <div className="flex gap-1.5" role="group" aria-label="Choose an essay">
            {items.map((x, k) => (
              <button
                key={x.url}
                type="button"
                aria-label={`Show essay ${k + 1}`}
                aria-pressed={k === i}
                onClick={() => setI(k)}
                className={cn("size-2.5 rounded-full transition-colors", k === i ? "bg-ink" : "bg-ink/20 hover:bg-ink/40")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
