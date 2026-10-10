"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Person } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { AccentRule } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type TeamSpotlightProps = {
  label: string;
  people: readonly Person[];
  /** Used when a person has no title (e.g. advisors). */
  fallbackTitle?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Cinematic team viewer: one large spotlight portrait with name and title,
 * above a strip of thumbnails. Thumbnails are buttons; arrow keys move selection.
 */
export function TeamSpotlight({ label, people, fallbackTitle = "" }: TeamSpotlightProps) {
  const [index, setIndex] = useState(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);

  const person = people[index];
  const title = person.title ?? fallbackTitle;

  const select = (next: number, focus = false) => {
    const i = (next + people.length) % people.length;
    setIndex(i);
    const btn = thumbs.current[i];
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    if (focus) btn?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in keys) {
      e.preventDefault();
      select(index + keys[e.key], true);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(people.length - 1, true);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-ink-800">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-3 sm:px-7">
        <p className="hud text-ink-300">{label}</p>
        <div className="flex items-center gap-1">
          <p className="hud mr-2 text-ink-300" aria-hidden>
            <span className="text-white">{pad(index + 1)}</span> / {pad(people.length)}
          </p>
          <button
            type="button"
            onClick={() => select(index - 1)}
            className="grid size-11 place-items-center rounded-full text-ink-200 transition-colors hover:text-teal"
            aria-label={`Previous — ${label}`}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => select(index + 1)}
            className="grid size-11 place-items-center rounded-full text-ink-200 transition-colors hover:text-teal"
            aria-label={`Next — ${label}`}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Spotlight */}
      <div
        className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]"
      >
        <p className="sr-only" aria-live="polite">
          {person.name}, {title}. {index + 1} of {people.length}.
        </p>
        <div key={`p-${index}`} className="spot-portrait absolute inset-0 lg:left-auto lg:w-[62%]">
          <Avatar
            name={person.name}
            photo={person.photo}
            className="size-full"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/55 to-transparent lg:bg-gradient-to-r lg:from-ink-800 lg:from-[38%] lg:via-ink-800/70 lg:via-[55%] lg:to-transparent"
        />
        <div key={`t-${index}`} className="spot-text absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:top-0 lg:flex lg:max-w-[48%] lg:flex-col lg:justify-end lg:p-12">
          <p data-line className="hud text-teal">
            {title}
          </p>
          <h3 data-line className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">
            {person.name}
          </h3>
          <div data-line>
            <AccentRule className="mt-6" />
          </div>
          {person.bio && (
            <p data-line className="mt-5 max-w-md text-sm leading-relaxed text-ink-200">
              {person.bio}
            </p>
          )}
          {person.linkedin && (
            <a
              data-line
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-200 transition-colors hover:text-teal"
            >
              LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only">profile of {person.name} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div
        role="group"
        aria-label={`${label} — choose a person`}
        onKeyDown={onKeyDown}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto border-t border-white/8 px-5 py-5 sm:px-7"
      >
        {people.map((p, i) => {
          const active = i === index;
          return (
            <button
              key={p.name}
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              type="button"
              onClick={() => select(i)}
              aria-pressed={active}
              tabIndex={active ? 0 : -1}
              className={cn(
                "group w-20 shrink-0 snap-start text-left sm:w-24",
                active ? "opacity-100" : "opacity-50 hover:opacity-85"
              )}
            >
              <span
                className={cn(
                  "block overflow-hidden rounded-lg ring-1 transition-shadow duration-300",
                  active ? "ring-teal" : "ring-white/10"
                )}
              >
                <Avatar name={p.name} photo={p.photo} className="aspect-[3/4] w-full" sizes="96px" />
              </span>
              <span className="hud mt-2 block truncate text-[0.6rem] text-ink-200">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
