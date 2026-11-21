"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Person } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { PortraitTile, TILE_COLOURS } from "./PortraitTile";

type Group = { id: string; label: string; people: Person[] };

const anchor = (id: string) => `team-${id}`;

/** Colour for the n-th person on the page, so neighbours (and rows) never repeat. */
const colourAt = (n: number) => TILE_COLOURS[n % TILE_COLOURS.length];

/**
 * The About page's people, all visible, no clicking: the founders first (large portrait
 * tiles with a short bio and "Known for"), then every team in order, each as one row of
 * tiles the visitor can scroll (TeamRow). Rows flip up into view as you reach them. On
 * desktop a sticky index lists the teams (names only), highlights the one in view and jumps to any;
 * on phones it becomes a row of chips.
 */
export function TeamSection({ groups }: { groups: Group[] }) {
  const founders = groups.find((g) => g.id === "founding");
  const teams = useMemo(() => groups.filter((g) => g.id !== "founding"), [groups]);
  const [active, setActive] = useState(teams[0]?.id);
  // Where each team's colours start, continuing on from the founders and earlier teams.
  const offsets = useMemo(() => {
    const first = founders?.people.length ?? 0;
    return teams.map((_, i) => first + teams.slice(0, i).reduce((sum, t) => sum + t.people.length, 0));
  }, [founders, teams]);

  // Scroll-spy: the team whose heading area sits in the middle band of the screen.
  useEffect(() => {
    const els = teams.map((t) => document.getElementById(anchor(t.id))).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id.replace(/^team-/, ""));
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [teams]);

  return (
    <div>
      {founders && (
        <div>
          <h3 className="eyebrow text-teal">{founders.label}</h3>
          <Reveal as="ul" stagger={0.12} className="mt-10 grid gap-12 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:gap-10">
            {founders.people.map((p, i) => (
              <li key={p.name} data-reveal className="flip-in flex flex-col">
                <PortraitTile person={p} colour={colourAt(i)} size="lg" priority={i === 0} />
                {p.bio && <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-200">{p.bio}</p>}
                {p.highlights && p.highlights.length > 0 && (
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="hud text-teal">Known for</p>
                    <ul className="mt-3 space-y-2.5">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex gap-3 text-sm leading-snug text-ink-200">
                          <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-teal" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </Reveal>
        </div>
      )}

      {teams.length > 0 && (
        <div className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-10 sm:mt-24 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
          {/* Team index: chips on phones, sticky list on desktop */}
          <nav aria-label="Teams" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
              {teams.map((t) => {
                const on = active === t.id;
                return (
                  <li key={t.id} className="shrink-0">
                    <a
                      href={`#${anchor(t.id)}`}
                      aria-current={on ? "true" : undefined}
                      className={cn(
                        "flex min-h-10 items-center justify-between gap-3 rounded-full border px-4 text-sm transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-2",
                        on
                          ? "border-teal text-white lg:bg-white/[0.03]"
                          : "border-white/15 text-ink-300 hover:text-white lg:border-white/10"
                      )}
                    >
                      {t.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* min-w-0 / minmax(0,1fr): wide rows scroll inside their column instead of widening the page. */}
          <div className="min-w-0 space-y-16 sm:space-y-20">
            {teams.map((t, ti) => (
              <section key={t.id} id={anchor(t.id)} aria-labelledby={`${anchor(t.id)}-title`} className="scroll-mt-28">
                <TeamRow
                  titleId={`${anchor(t.id)}-title`}
                  label={t.label}
                  people={t.people}
                  colourStart={offsets[ti]}
                  fallbackTitle={t.id === "advisors" ? "Sector Expert & Advisor" : ""}
                />
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One team: its heading, then a single row of cards, each person once. The row stays
 * still; visitors scroll it themselves (swipe, trackpad, or the ‹ › buttons, which only
 * appear when the team is wider than the row). Cards snap into place, and the edge fade
 * shows only on a side that has more cards. A team that fits simply sits left-aligned.
 */
function TeamRow({
  titleId,
  label,
  people,
  colourStart,
  fallbackTitle,
}: {
  titleId: string;
  label: string;
  people: Person[];
  colourStart: number;
  fallbackTitle: string;
}) {
  const row = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ overflow: false, start: true, end: true });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const next = { overflow: max > 4, start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 };
      setEdges((prev) => (prev.overflow === next.overflow && prev.start === next.start && prev.end === next.end ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  // Fade only the side(s) with more cards to see.
  const fade = edges.overflow
    ? `linear-gradient(to right, ${edges.start ? "black" : "transparent"}, black 6%, black 94%, ${edges.end ? "black" : "transparent"})`
    : undefined;

  return (
    <>
      <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <h3 id={titleId} className="font-display text-2xl font-bold text-white sm:text-[1.75rem]">
          {label}
        </h3>
        {edges.overflow && (
          <div className="flex shrink-0 gap-2">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => page(dir)}
                disabled={dir === -1 ? edges.start : edges.end}
                aria-label={`${dir === -1 ? "Previous" : "Next"} ${label} people`}
                className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-teal hover:text-teal disabled:pointer-events-none disabled:opacity-30"
              >
                {dir === -1 ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* A little top padding inside the row leaves room for heads growing on hover. */}
      <Reveal className="flip-in mt-6">
        <ul
          ref={row}
          data-lenis-prevent-wheel
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 pt-4 pb-1 sm:gap-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
          style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
        >
          {people.map((p, i) => (
            <li key={p.name} className="w-40 shrink-0 snap-start sm:w-48 lg:w-52">
              <PortraitTile person={p} colour={colourAt(colourStart + i)} fallbackTitle={fallbackTitle} />
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}
