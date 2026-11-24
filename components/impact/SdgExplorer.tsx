"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SdgGoal = {
  number: number;
  title: string;
  summary: string;
  entries: { company?: string; label: string; connection: string; measures: string }[];
};

/** The UN SDG colours, so each goal reads as itself. */
const SDG_COLOURS: Record<number, string> = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21", 6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925",
  10: "#dd1367", 11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b", 16: "#00689d", 17: "#19486a",
};

/**
 * The goals we align with, as a grid. Selecting one opens its panel below that row:
 * every company (or Transition VC itself) that contributes, how, and the measures behind
 * it. Goal 5 (Gender Equality) sits apart, as a bar with the people it refers to.
 */
export function SdgExplorer({ goals, companyNames, note }: { goals: SdgGoal[]; companyNames: Record<string, string>; note: string }) {
  const grid = goals.filter((g) => g.number !== 5);
  const gender = goals.find((g) => g.number === 5);
  const [open, setOpen] = useState<number | null>(null);
  const [genderOpen, setGenderOpen] = useState(false);
  const current = grid.find((g) => g.number === open);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="eyebrow text-teal-ink">UN Sustainable Development Goals we align with</p>
        {note && <p className="text-sm text-muted">{note}</p>}
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((g) => {
          const on = open === g.number;
          return (
            <li key={g.number}>
              <button
                type="button"
                aria-expanded={on}
                aria-controls="sdg-panel"
                onClick={() => setOpen(on ? null : g.number)}
                className={cn(
                  "group flex h-full w-full items-start gap-5 rounded-2xl border bg-white p-5 text-left transition-[border-color,box-shadow] sm:p-6",
                  on ? "border-ink shadow-[0_8px_30px_rgb(0_0_0/0.08)]" : "border-line hover:border-teal-ink/40"
                )}
              >
                <span
                  aria-hidden
                  className="grid size-12 shrink-0 place-items-center rounded-xl font-display text-xl font-bold text-white"
                  style={{ backgroundColor: SDG_COLOURS[g.number] ?? "#000" }}
                >
                  {g.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink">{g.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{g.summary}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-ink">
                    {g.entries.length} {g.entries.length === 1 ? "contribution" : "contributions"}
                    {on ? <Minus className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {current && (
        <section
          id="sdg-panel"
          aria-label={`SDG ${current.number}: ${current.title}`}
          className="mt-4 rounded-3xl border border-line bg-white p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow" style={{ color: SDG_COLOURS[current.number] }}>
                SDG {current.number}
              </p>
              <h3 className="display mt-2 text-2xl text-ink sm:text-3xl">{current.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink hover:border-teal-ink hover:text-teal-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <ul className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
            {current.entries.map((e, i) => (
              <li key={i} className="border-t border-line pt-4">
                <p className="font-bold text-ink">
                  {e.company ? (
                    <Link href={`/portfolio?company=${e.company}`} className="hover:text-teal-ink">
                      {companyNames[e.company] ?? e.label}
                    </Link>
                  ) : (
                    e.label
                  )}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{e.connection}</p>
                {e.measures && <p className="hud mt-2 text-teal-ink">Measures: {e.measures}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gender && (
        <div className="mt-4 rounded-3xl bg-surface p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr_auto] md:items-center md:gap-8">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-xl font-display text-xl font-bold text-white"
                style={{ backgroundColor: SDG_COLOURS[5] }}
              >
                5
              </span>
              <p className="font-bold text-ink">{gender.title}</p>
            </div>
            <div>
              <p className="eyebrow text-teal-ink">Our people practices</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{gender.summary}</p>
            </div>
            <button
              type="button"
              aria-expanded={genderOpen}
              onClick={() => setGenderOpen((v) => !v)}
              className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-ink hover:text-teal-ink"
            >
              Meet our women leaders {genderOpen ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
            </button>
          </div>
          {genderOpen && (
            <ul className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-5 md:grid-cols-2">
              {gender.entries.map((e, i) => (
                <li key={i}>
                  <p className="font-bold text-ink">{e.company ? companyNames[e.company] ?? e.label : e.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{e.connection}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
