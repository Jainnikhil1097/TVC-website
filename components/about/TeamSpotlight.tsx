"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Person } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

type TeamSpotlightProps = {
  label: string;
  people: readonly Person[];
  /** Used when a person has no title (e.g. advisors). */
  fallbackTitle?: string;
};

/**
 * Team viewer: one featured portrait with name, title and LinkedIn, beside a
 * strip of thumbnails. Thumbnails are buttons; arrow keys move the selection.
 */
export function TeamSpotlight({ label, people, fallbackTitle = "" }: TeamSpotlightProps) {
  const [index, setIndex] = useState(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);

  const person = people[index];
  const title = person.title || fallbackTitle;
  const many = people.length > 1;

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
    <div className="rounded-3xl border border-line bg-white p-5 sm:p-8 lg:p-10">
      <h3 className="eyebrow text-muted">{label}</h3>

      {/* Spotlight */}
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end lg:gap-12">
        <p className="sr-only" aria-live="polite">
          {person.name}{title ? `, ${title}` : ""}. {index + 1} of {people.length}.
        </p>
        <div key={`p-${index}`} className="spot-portrait overflow-hidden rounded-2xl border border-line">
          <Avatar
            name={person.name}
            photo={person.photo}
            className="aspect-[4/5] w-full"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>
        <div className="flex flex-col">
          <div key={`t-${index}`} className="spot-text">
            {title && <p className="text-sm font-semibold text-teal-ink">{title}</p>}
            <p className="display mt-2 text-4xl text-ink sm:text-5xl">{person.name}</p>
            {person.bio && <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted">{person.bio}</p>}
            {person.linkedin && (
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-teal-ink hover:decoration-teal-ink"
              >
                LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
                <span className="sr-only">profile of {person.name} (opens in a new tab)</span>
              </a>
            )}
          </div>
          {many && (
            <div className="mt-8 flex gap-2">
              <button
                type="button"
                onClick={() => select(index - 1)}
                className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-teal-ink hover:text-teal-ink"
                aria-label={`Previous person — ${label}`}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => select(index + 1)}
                className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-teal-ink hover:text-teal-ink"
                aria-label={`Next person — ${label}`}
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {many && (
        <div
          role="group"
          aria-label={`${label} — choose a person`}
          onKeyDown={onKeyDown}
          className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto border-t border-line px-5 pt-6 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
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
                className="group w-20 shrink-0 snap-start text-left sm:w-24"
              >
                <span
                  className={cn(
                    "block overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-white transition-shadow duration-300",
                    active ? "ring-teal-ink" : "ring-transparent group-hover:ring-line"
                  )}
                >
                  <Avatar name={p.name} photo={p.photo} className="aspect-[3/4] w-full" sizes="96px" />
                </span>
                <span
                  className={cn(
                    "mt-2 block truncate text-xs",
                    active ? "font-semibold text-ink" : "text-muted group-hover:text-ink"
                  )}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
