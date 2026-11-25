"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { cn } from "@/lib/utils";
import { BlueprintSketch } from "./BlueprintSketch";
import { MODELS, modelByKey } from "./models";
import type { Model } from "./engine";

// Every sample in the lab: the eight single sketches, then two "drawing sheets" with
// several products side by side. Module-level so each entry's array is stable.
type Entry = { key: string; name: string; format: string; models: Model[]; background?: boolean };
const ENTRIES: Entry[] = [
  ...MODELS.map((m) => ({ key: m.key, name: m.name, format: m.format, models: [m] })),
  {
    key: "sheet-3",
    name: "Three products",
    format: "Drawing sheet, side by side",
    models: ["motor", "gearbox", "drone"].map(modelByKey),
  },
  {
    key: "sheet-4",
    name: "Four products",
    format: "Drawing sheet, side by side",
    models: ["motor", "gearbox", "drone", "turbine"].map(modelByKey),
  },
  // Behind the whole hero, not interactive.
  { key: "bg-1", name: "Full background", format: "One product behind the headline", models: [modelByKey("gearbox")], background: true },
  { key: "bg-8", name: "Full background", format: "All eight as a drawing wallpaper", models: MODELS, background: true },
];

/**
 * TEMPORARY (/hero-lab): the real home hero with a blueprint sketch (or a sheet of
 * several, side by side) behind it.
 * ‹ › or ← → change the sketch; "Run only" skips the assembly so the mechanism just
 * runs (to compare the two approaches). The choice is kept in the URL (?v=3&run=1).
 * Works in development and on the GitHub Pages preview.
 */
export function SketchLab({ tagline, intro }: { tagline: string; intro: string }) {
  const [index, setIndex] = useState(0);
  const [runOnly, setRunOnly] = useState(false);

  // Pick up ?v= / ?run= from the address (read in the browser so the page can be
  // exported statically for the GitHub Pages preview).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = Number(params.get("v"));
    const run = params.get("run") === "1";
    const id = requestAnimationFrame(() => {
      if (Number.isInteger(v) && v >= 1 && v <= ENTRIES.length) setIndex(v - 1);
      setRunOnly(run);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const remember = (i: number, run: boolean) => window.history.replaceState(null, "", `?v=${i + 1}${run ? "&run=1" : ""}`);

  const go = useCallback(
    (next: number) => {
      const i = (next + ENTRIES.length) % ENTRIES.length;
      setIndex(i);
      remember(i, runOnly);
    },
    [runOnly]
  );
  const toggleRun = () => {
    setRunOnly(!runOnly);
    remember(index, !runOnly);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const entry = ENTRIES[index];
  return (
    <>
      <HomeHero tagline={tagline} intro={intro} backgroundFull={entry.background}
        background={
          <BlueprintSketch
            key={`${entry.key}-${runOnly}`}
            models={entry.models}
            runOnly={runOnly}
            interactive={!entry.background}
            placement={entry.background ? "background" : "side"}
            dim={entry.background ? (entry.models.length > 1 ? 0.55 : 0.7) : 1}
          />
        } />

      <div className="fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
        <p className="rounded-full bg-ink/80 px-3 py-1 text-xs text-white/80 backdrop-blur">
          {entry.background ? "Background only (not interactive)" : "Try it: hover · drag · scroll (tap on phones)"}
        </p>
        <div className="flex items-center gap-1 rounded-full bg-white p-1.5 text-ink shadow-[0_12px_40px_rgb(0_0_0/0.35)] ring-1 ring-ink/10">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous sketch" className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
            <ChevronLeft className="size-5" />
          </button>
          <p className="min-w-[17rem] px-2 text-center text-sm" aria-live="polite">
            <span className="font-sans text-xs font-bold tabular-nums text-teal-ink">
              {index + 1} / {ENTRIES.length}
            </span>{" "}
            · <span className="font-bold">{entry.name}</span> <span className="text-muted">— {entry.format}</span>
          </p>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next sketch" className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-pressed={runOnly}
            onClick={toggleRun}
            className={cn("ml-1 rounded-full px-4 py-2 text-xs font-bold transition-colors", runOnly ? "bg-ink text-white" : "bg-ink/5 text-ink hover:bg-ink/10")}
          >
            {runOnly ? "Run only: on" : "Run only: off"}
          </button>
        </div>
      </div>
    </>
  );
}
