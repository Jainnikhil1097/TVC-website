"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Person } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { spectrumCss } from "@/components/home/flow-geometry";
import { cn } from "@/lib/utils";

const MAX_TILT_X = 9; // degrees, up/down
const MAX_TILT_Y = 11; // degrees, left/right

/**
 * A team member as a card with real depth: a dark backplate (faint grid, soft amber →
 * aqua glow), the portrait raised above it, and a name plate floating in front. On
 * hover (mouse/trackpad) the card tilts toward the cursor and a light sheen follows it.
 * Portraits are always in full colour. Touch screens get a still card; reduced motion
 * gets no tilt. Tilt is written straight to CSS variables (no
 * React re-renders).
 */
export function DepthCard({
  person,
  size = "md",
  fallbackTitle = "",
  priority,
}: {
  person: Person;
  size?: "md" | "lg";
  fallbackTitle?: string;
  priority?: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  const tiltable = useRef(false);
  const title = person.title || fallbackTitle;

  useEffect(() => {
    tiltable.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el || !tiltable.current) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 2 * MAX_TILT_X).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 2 * MAX_TILT_Y).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = card.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const lg = size === "lg";
  return (
    <div className="group [perspective:1000px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        ref={card}
        className="relative rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
      >
        {/* Backplate: faint grid and a soft spectrum glow */}
        <div aria-hidden className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            className="absolute inset-x-6 bottom-6 h-1/3 opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-45"
            style={{ backgroundImage: spectrumCss() }}
          />
        </div>

        <div className={cn("relative [transform-style:preserve-3d]", lg ? "p-3 sm:p-4" : "p-2.5")}>
          {/* Portrait, raised off the plate */}
          <div className="[transform:translateZ(26px)]">
            <Avatar
              name={person.name}
              photo={person.photo}
              priority={priority}
              sizes={lg ? "(min-width: 768px) 30vw, 90vw" : "(min-width: 1280px) 220px, (min-width: 768px) 28vw, 45vw"}
              className="aspect-[4/5] w-full rounded-xl"
            />
          </div>

          {/* Name plate, floating in front */}
          <div className={cn("relative [transform:translateZ(46px)]", lg ? "-mt-10 px-3" : "-mt-8 px-2")}>
            <div className="rounded-xl border border-white/10 bg-black/70 px-3.5 py-3 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn("font-display leading-tight font-bold text-white", lg ? "text-lg sm:text-xl" : "text-[0.95rem]")}>
                    {person.name}
                  </p>
                  {title && <p className={cn("mt-1 leading-snug text-ink-300", lg ? "text-sm" : "text-xs")}>{title}</p>}
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
              </div>
            </div>
          </div>
        </div>

        {/* Sheen that follows the pointer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 [transform:translateZ(60px)] group-hover:opacity-100"
          style={{ background: "radial-gradient(40% 35% at var(--mx, 50%) var(--my, 30%), rgb(255 255 255 / 0.12), transparent 70%)" }}
        />
      </div>
    </div>
  );
}
