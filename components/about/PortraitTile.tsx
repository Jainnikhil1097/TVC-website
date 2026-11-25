import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Person } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

/**
 * Square colours, in turn: Transition Aqua, amber, Mint, warm teal and Mist, the brand
 * accents plus the warm end of the home hero's energy flow.
 */
export const TILE_COLOURS = ["#06e8d3", "#ffa24c", "#83f4e9", "#7fd3a8", "#ebf1f1"] as const;

/**
 * A team member "coming out of the grid": a colour square with the person cut out
 * above it, their shoulders ending at the square's bottom edge and their head rising
 * over its top. Portraits are transparent cut-outs (scripts/cutout-team-photos.swift),
 * so the square shows through around them. On hover the person grows slightly
 * out of the square. Name, title and LinkedIn sit underneath. Without a photo, the
 * square shows the person's initials.
 */
export function PortraitTile({
  person,
  colour,
  size = "md",
  fallbackTitle = "",
  priority,
}: {
  person: Person;
  colour: string;
  size?: "md" | "lg";
  fallbackTitle?: string;
  priority?: boolean;
}) {
  const lg = size === "lg";
  const title = person.title || fallbackTitle;
  return (
    <figure className="group">
      <div className="relative aspect-[4/5]">
        {/* The square: the lower three-quarters of the tile */}
        <div aria-hidden className="absolute inset-x-0 top-[26%] bottom-0 rounded-2xl" style={{ backgroundColor: colour }} />
        {person.photo ? (
          // Clipped to the square's sides and rounded bottom, open at the top so the head rises clear.
          <div className="absolute inset-x-0 -top-[12%] bottom-0 overflow-hidden rounded-b-2xl">
            <Image
              src={person.photo}
              alt={person.name}
              fill
              priority={priority}
              sizes={lg ? "(min-width: 768px) 30vw, 90vw" : "(min-width: 1024px) 208px, (min-width: 640px) 192px, 160px"}
              className="origin-bottom object-contain object-bottom transition-transform duration-500 ease-out-quart group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          </div>
        ) : (
          <div aria-hidden className="@container absolute inset-x-0 top-[26%] bottom-0 grid place-items-center">
            <span className="display text-[26cqw] text-black/30">{initials(person.name)}</span>
          </div>
        )}
      </div>

      <figcaption className={cn("flex items-start justify-between gap-3", lg ? "mt-5" : "mt-4")}>
        <div className="min-w-0">
          <p className={cn("font-display leading-tight font-bold text-white", lg ? "text-xl sm:text-2xl" : "text-[0.95rem]")}>
            {person.name}
          </p>
          {title && <p className={cn("mt-1 leading-snug text-ink-300", lg ? "text-sm sm:text-base" : "text-xs")}>{title}</p>}
        </div>
        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${person.name} on LinkedIn`}
            className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-teal hover:text-teal"
          >
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )}
      </figcaption>
    </figure>
  );
}
