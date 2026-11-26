"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/base-path";

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

/** Goals with the official UN icon in public/sdg/ (add sdg-NN.webp to add one). */
const ICONS = new Set([5, 6, 7, 8, 9, 10, 11, 12, 13, 17]);

/** The goal's official UN icon (decorative: the title is always written beside it), or its number on its colour. */
function SdgIcon({ number, className }: { number: number; className: string }) {
  if (ICONS.has(number)) {
    return (
      // A 400px icon from public/; a plain img keeps it working under the static preview's base path.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={asset(`/sdg/sdg-${String(number).padStart(2, "0")}.webp`)} alt="" width={400} height={400} loading="lazy" className={cn("shrink-0 rounded-lg", className)} />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-lg font-display text-xl font-bold text-white", className)}
      style={{ backgroundColor: SDG_COLOURS[number] ?? "#000" }}
    >
      {number}
    </span>
  );
}

export type TeamFace = { title?: string; photo?: string; colour?: string };

/** A share as a ring, drawn in once (static for reduced motion). */
function Ring({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-28 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#e7ecf0" strokeWidth={10} />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={SDG_COLOURS[5]}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`}
          className="gender-ring"
          style={{ "--ring": `${(c * value) / 100}` } as React.CSSProperties}
        />
      </svg>
      <span className="font-display text-3xl font-bold text-ink">{value}%</span>
    </span>
  );
}

/**
 * One line of the goal 5 card: a share ("44% of employees are women.") as a ring with
 * its words beside it; otherwise names (split on "·", ";" or ","), each with their team
 * photo and title when they're on the team page.
 */
function GenderLine({ text, people }: { text: string; people: Record<string, TeamFace> }) {
  const share = text.match(/(\d{1,3})\s?%/);
  if (share) {
    const rest = text.replace(share[0], "").trim();
    return (
      <div className="mt-5 flex items-center gap-5">
        <Ring value={Math.min(100, Number(share[1]))} />
        <p className="text-lg leading-snug font-bold text-ink">
          <span className="sr-only">{share[1]}% </span>
          {rest}
        </p>
      </div>
    );
  }
  const names = text.split(/\s*[·;,]\s*/).filter(Boolean);
  return (
    <ul className="mt-5 space-y-4">
      {names.map((name) => {
        const p = people[name] ?? people[Object.keys(people).find((k) => k.startsWith(`${name} `)) ?? ""];
        const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
        return (
          <li key={name} className="flex items-center gap-4">
            <span
              aria-hidden
              className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full font-bold text-ink"
              style={{ backgroundColor: p?.colour && p.colour !== "#ffffff" ? p.colour : "#bfe7e2" }}
            >
              {p?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover object-top" />
              ) : (
                initials
              )}
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg leading-tight font-bold text-ink">{name}</span>
              {p?.title && <span className="mt-0.5 block text-sm leading-snug text-muted">{p.title}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The goals we align with, as a grid. Selecting one opens its panel below that row:
 * every company (or Transition VC itself) that contributes, how, and the measures behind
 * it. Goal 5 (Gender Equality) sits apart, as a bar: women in leadership, the women
 * heading departments, and women's share of the team (one entry per line).
 */
export function SdgExplorer({
  goals,
  companyNames,
  note,
  people = {},
}: {
  goals: SdgGoal[];
  companyNames: Record<string, string>;
  note: string;
  /** Team members by name (photo, title, team colour), for the people named under goal 5. */
  people?: Record<string, TeamFace>;
}) {
  const grid = goals.filter((g) => g.number !== 5);
  const gender = goals.find((g) => g.number === 5);
  const [open, setOpen] = useState<number | null>(null);
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
                <SdgIcon number={g.number} className="size-20 sm:size-24" />
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
            <div className="flex items-center gap-5">
              <SdgIcon number={current.number} className="size-16 sm:size-20" />
              <div>
                <p className="eyebrow" style={{ color: SDG_COLOURS[current.number] }}>
                  SDG {current.number}
                </p>
                <h3 className="display mt-2 text-2xl text-ink sm:text-3xl">{current.title}</h3>
              </div>
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
        <section aria-label={`SDG 5: ${gender.title}`} className="mt-4 rounded-3xl bg-surface p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_1fr] md:items-center md:gap-8">
            <div className="flex items-center gap-4">
              <SdgIcon number={5} className="size-20 sm:size-24" />
              <h3 className="font-bold text-ink">{gender.title}</h3>
            </div>
            {gender.summary && <p className="text-sm leading-relaxed text-muted">{gender.summary}</p>}
          </div>
          {gender.entries.length > 0 && (
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {gender.entries.map((e, i) => (
                <li key={i} className="flex flex-col rounded-2xl bg-white p-5 sm:p-6">
                  <p className="eyebrow text-teal-ink">{e.company ? companyNames[e.company] ?? e.label : e.label}</p>
                  <GenderLine text={e.connection} people={people} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
