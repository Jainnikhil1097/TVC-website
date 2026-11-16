"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { cn } from "@/lib/utils";
import { BlueprintSketch } from "./BlueprintSketch";
import { MODELS } from "./models";

/**
 * TEMPORARY (/hero-lab): the real home hero with one blueprint sketch behind it.
 * ‹ › or ← → change the sketch; "Run only" skips the assembly so the mechanism just
 * runs (to compare the two approaches). The choice is kept in the URL (?v=3&run=1).
 */
export function SketchLab({ tagline, intro, initial, initialRunOnly }: { tagline: string; intro: string; initial: number; initialRunOnly: boolean }) {
  const [index, setIndex] = useState(Math.min(initial, MODELS.length - 1));
  const [runOnly, setRunOnly] = useState(initialRunOnly);

  useEffect(() => {
    window.history.replaceState(null, "", `?v=${index + 1}${runOnly ? "&run=1" : ""}`);
  }, [index, runOnly]);

  const go = useCallback((next: number) => setIndex((next + MODELS.length) % MODELS.length), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const model = MODELS[index];
  return (
    <>
      <HomeHero tagline={tagline} intro={intro} background={<BlueprintSketch key={`${model.key}-${runOnly}`} model={model} runOnly={runOnly} />} />

      <div className="fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
        <p className="rounded-full bg-ink/80 px-3 py-1 text-xs text-white/80 backdrop-blur">Try it: hover · drag · scroll (tap on phones)</p>
        <div className="flex items-center gap-1 rounded-full bg-white p-1.5 text-ink shadow-[0_12px_40px_rgb(10_30_63/0.35)] ring-1 ring-ink/10">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous sketch" className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
            <ChevronLeft className="size-5" />
          </button>
          <p className="min-w-[17rem] px-2 text-center text-sm" aria-live="polite">
            <span className="font-mono text-xs text-teal-ink">
              {index + 1} / {MODELS.length}
            </span>{" "}
            · <span className="font-semibold">{model.name}</span> <span className="text-muted">— {model.format}</span>
          </p>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next sketch" className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-pressed={runOnly}
            onClick={() => setRunOnly((r) => !r)}
            className={cn("ml-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors", runOnly ? "bg-ink text-white" : "bg-ink/5 text-ink hover:bg-ink/10")}
          >
            {runOnly ? "Run only: on" : "Run only: off"}
          </button>
        </div>
      </div>
    </>
  );
}
