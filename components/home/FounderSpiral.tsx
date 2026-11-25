"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Pillar = { title: string; text: string; points: string[] };

// Helix geometry, in SVG units. One turn per pillar, read top to bottom.
type Geo = { VW: number; cx: number; R: number; P: number; ry: number; band: number };
const DESKTOP: Geo = { VW: 1200, cx: 600, R: 190, P: 116, ry: 48, band: 30 };
const PHONE: Geo = { VW: 360, cx: 92, R: 64, P: 132, ry: 18, band: 16 };

const TEAL = "#0ed5c2";
const DEEP = "#067a70";

const point = (g: Geo, t: number) => {
  const yc = g.ry + 8 + (t / (Math.PI * 2)) * g.P;
  return [g.cx + g.R * Math.cos(t), yc + g.ry * Math.sin(t)] as const;
};

/** The ribbon as runs of polygons: inner (far) faces first, then outer (near) faces. */
function ribbon(g: Geo, turns: number) {
  const step = 0.06;
  const runs: { d: string; front: boolean; turn: number }[] = [];
  for (let k = turns - 1; k >= 0; k--) {
    for (const front of [false, true]) {
      // The near half of a turn is where sin(t) > 0 (lower part of the ellipse).
      const from = 2 * Math.PI * k + (front ? 0 : Math.PI);
      const to = from + Math.PI;
      const top: string[] = [];
      const bottom: string[] = [];
      for (let t = from; t <= to + 1e-6; t += step) {
        const [x, y] = point(g, t);
        top.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        bottom.unshift(`${x.toFixed(1)},${(y + g.band).toFixed(1)}`);
      }
      runs.push({ d: `M${top.join("L")}L${bottom.join("L")}Z`, front, turn: k });
    }
  }
  return runs;
}

/** Where a pillar's heading attaches: the turn's left or right edge. */
const anchor = (g: Geo, k: number, side: "left" | "right") => point(g, 2 * Math.PI * k + (side === "right" ? 0 : Math.PI));

function Figure({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  // A small standing figure (head, body, legs), feet on the ribbon's top edge.
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#0b0b0b">
      <circle cx={0} cy={-27} r={4.2} />
      <rect x={-4.5} y={-22} width={9} height={13} rx={3.5} />
      <rect x={-4} y={-10} width={3.4} height={10} rx={1.5} />
      <rect x={0.6} y={-10} width={3.4} height={10} rx={1.5} />
    </g>
  );
}

/** The ribbon's top edge on each near face: where the flowing light runs. */
function flowEdges(g: Geo, turns: number) {
  return Array.from({ length: turns }, (_, k) => {
    const pts: string[] = [];
    for (let t = 2 * Math.PI * k; t <= 2 * Math.PI * k + Math.PI + 1e-6; t += 0.06) {
      const [x, y] = point(g, t);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M${pts.join("L")}`;
  });
}

function Spiral({ g, pillars, sides, onOpen, open, idPrefix }: {
  g: Geo;
  pillars: Pillar[];
  sides: "alternate" | "right";
  onOpen: (k: number, el: HTMLElement) => void;
  open: number | null;
  idPrefix: string;
}) {
  const n = pillars.length;
  const VH = point(g, 2 * Math.PI * n)[1] + g.ry + g.band + 12;
  const runs = ribbon(g, n);
  const edges = flowEdges(g, n);
  const sideOf = (k: number): "left" | "right" => (sides === "right" ? "right" : k % 2 === 0 ? "left" : "right");
  const box = useRef<HTMLDivElement>(null);
  const walker = useRef<SVGGElement>(null);

  // Scroll-linked motion: turns light up one by one (--lit, in turns) and a figure walks the
  // ribbon. A tiny scroll handler (works in every browser), only while on screen; nothing
  // moves for reduced motion, where --lit stays unset and everything shows fully lit.
  useEffect(() => {
    const el = box.current;
    const fig = walker.current;
    if (!el || !fig) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scale = g === PHONE ? 0.55 : 1;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!el.offsetParent) return; // the other (desktop/phone) layout is hidden
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh * 0.72 - r.top) / r.height));
      const lit = progress * (n + 0.6);
      el.style.setProperty("--lit", lit.toFixed(3));
      // The walker follows the ribbon; on the far side of a turn it is hidden behind it.
      const t = Math.min(n - 0.02, progress * n) * Math.PI * 2;
      const [x, y] = point(g, t);
      fig.setAttribute("transform", `translate(${x.toFixed(1)} ${(y + 1).toFixed(1)}) scale(${scale})`);
      fig.style.opacity = Math.sin(t) > 0.05 ? "1" : "0";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    let active = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !active) {
        active = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      } else if (!e.isIntersecting && active) {
        active = false;
        window.removeEventListener("scroll", onScroll);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [g, n]);

  // Lit-ness of turn k: 0.18 (dim) → 1 as the scroll reaches it. Unset --lit = fully lit.
  const lit = (k: number) => `clamp(0.18, calc(var(--lit, 99) - ${k}), 1)`;

  return (
    <div ref={box} className="relative w-full" style={{ aspectRatio: `${g.VW} / ${VH}` }}>
      <svg viewBox={`0 0 ${g.VW} ${VH}`} className="absolute inset-0 size-full" aria-hidden>
        {runs.map((r, i) => (
          <path
            key={i}
            d={r.d}
            fill={r.front ? TEAL : DEEP}
            style={{ opacity: open === null ? lit(r.turn) : open === r.turn ? 1 : 0.3 }}
            className="transition-opacity duration-300"
          />
        ))}
        {/* Light flowing along the ribbon's near edges */}
        <g className="spiral-flow" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth={g === PHONE ? 1.5 : 2.5}>
          {edges.map((d, k) => (
            <path key={k} d={d} pathLength={100} style={{ animationDelay: `${k * -0.9}s`, opacity: open === null ? lit(k) : 0 }} />
          ))}
        </g>
        {/* Leader lines from each turn's edge to its heading */}
        {pillars.map((_, k) => {
          const side = sideOf(k);
          const [x, y] = anchor(g, k, side);
          const x2 = side === "left" ? x - 26 : x + 26;
          return (
            <line
              key={k}
              x1={x}
              y1={y + g.band / 2}
              x2={x2}
              y2={y + g.band / 2}
              stroke="#0b0b0b"
              strokeOpacity={0.25}
              strokeDasharray="2 3"
              style={{ opacity: lit(k) }}
            />
          );
        })}
        {/* Figures standing on the steps, and one walking the ribbon with the scroll */}
        {[3, 6].filter((k) => k < n).map((k) => {
          const [x, y] = point(g, 2 * Math.PI * k + Math.PI / 2 + (k % 2 ? 0.5 : -0.4));
          return (
            <g key={k} style={{ opacity: lit(k) }}>
              <Figure x={x} y={y + 1} scale={g === PHONE ? 0.55 : 1} />
            </g>
          );
        })}
        <g ref={walker} className="transition-opacity duration-200 motion-reduce:hidden" style={{ opacity: 0 }}>
          <Figure x={0} y={0} />
        </g>
      </svg>

      {pillars.map((p, k) => {
        const side = sideOf(k);
        const [x, y] = anchor(g, k, side);
        const top = `${((y + g.band / 2) / VH) * 100}%`;
        const style =
          side === "left"
            ? { top, right: `${(1 - (x - 34) / g.VW) * 100}%`, width: `${((x - 34) / g.VW) * 100 - 2}%` }
            : { top, left: `${((x + 34) / g.VW) * 100}%`, right: 0 };
        return (
          <button
            key={k}
            type="button"
            id={`${idPrefix}-${k}`}
            aria-haspopup="dialog"
            aria-expanded={open === k}
            onClick={(e) => onOpen(k, e.currentTarget)}
            className={cn(
              "group absolute -translate-y-1/2 rounded-xl px-2 py-1.5 transition-[background-color,opacity] duration-300 hover:bg-white focus-visible:bg-white",
              side === "left" ? "text-right" : "text-left",
              open === k && "bg-white shadow-[0_8px_30px_rgb(0_0_0/0.08)]"
            )}
            style={{ ...style, opacity: `clamp(0.35, calc(var(--lit, 99) - ${k} + 0.3), 1)` }}
          >
            <span className="hud block text-teal-ink">{String(k + 1).padStart(2, "0")}</span>
            <span className="mt-1 block text-[0.95rem] leading-snug font-bold text-ink sm:text-base">{p.title}</span>
            <span className={cn("mt-1 inline-flex items-center gap-1 text-xs font-bold text-teal-ink", side === "left" && "flex-row-reverse")}>
              <Plus className="size-3.5 transition-transform group-aria-expanded:rotate-45" aria-hidden /> What this means
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * "Why founders choose us" as a spiral staircase: one turn per point, headings beside the
 * turns, and each point's details in a pop-up (anchored beside it on desktop, a sheet on
 * phones). Esc, a click outside or the × closes it, and focus returns to the heading.
 */
export function FounderSpiral({ pillars }: { pillars: Pillar[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; right: number; w: number } | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const onOpen = (k: number, el: HTMLElement) => {
    if (open === k) return close();
    trigger.current = el;
    const box = wrap.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (box) setRect({ top: r.top - box.top, left: r.left - box.left, right: box.right - r.right, w: r.width });
    setOpen(k);
  };
  const close = () => {
    setOpen(null);
    trigger.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (open === null) return;
    card.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (card.current?.contains(t) || trigger.current?.contains(t)) return;
      setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const p = open !== null ? pillars[open] : null;
  // Desktop: beside the heading, over the spiral.
  const leftSide = open !== null && open % 2 === 0;

  return (
    <div ref={wrap} className="relative">
      <div className="hidden md:block">
        <Spiral g={DESKTOP} pillars={pillars} sides="alternate" onOpen={onOpen} open={open} idPrefix="pillar-d" />
      </div>
      <div className="md:hidden">
        <Spiral g={PHONE} pillars={pillars} sides="right" onOpen={onOpen} open={open} idPrefix="pillar-m" />
      </div>

      {p && (
        <>
          <div aria-hidden className="fixed inset-0 z-[60] bg-ink/30 md:hidden" />
          <div
            ref={card}
            role="dialog"
            aria-modal="false"
            aria-labelledby="pillar-pop-title"
            tabIndex={-1}
            className={cn(
              "impact-fade z-[61] bg-white text-left shadow-[0_18px_50px_rgb(0_0_0/0.16)] outline-none",
              "fixed inset-x-0 bottom-0 max-h-[75svh] overflow-y-auto rounded-t-3xl p-6",
              "md:absolute md:inset-x-auto md:bottom-auto md:max-h-none md:w-[24rem] md:overflow-visible md:rounded-2xl md:border md:border-line"
            )}
            style={
              rect && typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
                ? // Toward the spiral (the page centre), where there is always room.
                  leftSide
                  ? { top: Math.max(0, rect.top - 12), left: rect.left + rect.w + 12 }
                  : { top: Math.max(0, rect.top - 12), right: rect.right + rect.w + 12 }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="hud text-teal-ink">{String((open ?? 0) + 1).padStart(2, "0")}</p>
                <h3 id="pillar-pop-title" className="mt-1 text-lg leading-snug font-bold text-ink">
                  {p.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink hover:border-teal-ink hover:text-teal-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            {p.text && <p className="mt-3 text-sm leading-relaxed text-muted">{p.text}</p>}
            {p.points.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-sm leading-relaxed text-ink/80">
                    <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-teal" />
                    {pt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
