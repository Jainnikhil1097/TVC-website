"use client";

import { useEffect, useRef, useState } from "react";
import type { PortfolioSectorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  GAP,
  GROUND_MATRIX,
  PLOT,
  TOWER,
  iso,
  poly,
  stageHeight,
  stageLegend,
  toPercent,
  type MapLayout,
  type Pin,
} from "./geometry";
import { portfolioSectorName } from "@/lib/taxonomy";
import { statusLabel } from "./status";

type PortfolioMapProps = {
  layout: MapLayout;
  activeSector: PortfolioSectorId | null;
  selected: string | null;
  onSelect: (slug: string) => void;
};

const TEAL = "#0ed5c2";

// Scoped to the map SVG: hairline strokes at any scale, and a slow "current" along the transmission line.
const mapCss = `
.tvc-map * { vector-effect: non-scaling-stroke; }
@keyframes tvc-dash { to { stroke-dashoffset: -160; } }
.tvc-dash { animation: tvc-dash 14s linear infinite; }
@media (prefers-reduced-motion: reduce) { .tvc-dash { animation: none; } }
`;

function Tower({ pin, state }: { pin: Pin; state: "idle" | "active" | "dim" }) {
  const { u, v, h } = pin;
  const s = TOWER;
  // Footprint corners: back, right, front, left.
  const A = [u - s, v - s] as const;
  const B = [u + s, v - s] as const;
  const C = [u + s, v + s] as const;
  const D = [u - s, v + s] as const;
  const g = (p: readonly [number, number], z = 0) => iso(p[0], p[1], z);
  const active = state === "active";
  const top = iso(u, v, h);
  const tip = iso(u, v, h + pin.leader);

  return (
    <g
      className="transition-opacity duration-500"
      style={{ opacity: state === "dim" ? 0.16 : 1 }}
      stroke={TEAL}
      strokeLinejoin="round"
    >
      {/* Ground marker */}
      <polygon
        points={poly([g([u - s - 9, v - s - 9]), g([u + s + 9, v - s - 9]), g([u + s + 9, v + s + 9]), g([u - s - 9, v + s + 9])])}
        fill="none"
        strokeOpacity={active ? 0.6 : 0.22}
        strokeDasharray="3 4"
        strokeWidth={1}
      />
      {/* Left and right faces, then top */}
      <polygon
        points={poly([g(D), g(C), g(C, h), g(D, h)])}
        fill={TEAL}
        fillOpacity={active ? 0.16 : 0.05}
        strokeOpacity={active ? 1 : 0.55}
        strokeWidth={1}
      />
      <polygon
        points={poly([g(C), g(B), g(B, h), g(C, h)])}
        fill={TEAL}
        fillOpacity={active ? 0.26 : 0.1}
        strokeOpacity={active ? 1 : 0.55}
        strokeWidth={1}
      />
      <polygon
        points={poly([g(A, h), g(B, h), g(C, h), g(D, h)])}
        fill="#ffffff"
        fillOpacity={active ? 0.22 : 0.07}
        strokeOpacity={active ? 1 : 0.7}
        strokeWidth={1}
      />
      {/* Leader line to the HUD label */}
      <line
        x1={top.x}
        y1={top.y}
        x2={tip.x}
        y2={tip.y}
        stroke="#ffffff"
        strokeOpacity={active ? 0.8 : 0.35}
        strokeDasharray="2 3"
        strokeWidth={1}
      />
      <circle cx={tip.x} cy={tip.y} r={2.5} fill={TEAL} stroke="none" />
    </g>
  );
}

export function PortfolioMap({ layout, activeSector, selected, onSelect }: PortfolioMapProps) {
  const { zones, pinsByDepth, ground, viewBox } = layout;
  const stageRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Gentle pointer parallax — a few degrees at most; off for touch and reduced motion.
  useEffect(() => {
    const stage = stageRef.current;
    const frame = stage?.parentElement;
    if (!stage || !frame) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      stage.style.transform = `rotateX(${(cy * 3).toFixed(3)}deg) rotateY(${(cx * -3).toFixed(3)}deg)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const corners = [iso(0, 0), iso(ground.w, 0), iso(ground.w, ground.h), iso(0, ground.h)];
  const zoneCentre = (i: number) => iso(zones[i].u + PLOT / 2, zones[i].v + PLOT / 2);
  // Serpentine "transmission line" linking every sector plot.
  const gridOrder = [0, 1, 2, 3, 7, 6, 5, 4].filter((i) => i < zones.length);
  const gridLine = poly(gridOrder.map(zoneCentre));

  const gridLines: { from: [number, number]; to: [number, number] }[] = [];
  for (let u = 0; u <= ground.w; u += 48) gridLines.push({ from: [u, 0], to: [u, ground.h] });
  for (let v = 0; v <= ground.h; v += 48) gridLines.push({ from: [0, v], to: [ground.w, v] });

  const roads: { from: [number, number]; to: [number, number] }[] = [];
  for (let c = 1; c < 4; c++) {
    const u = c * (PLOT + GAP) - GAP / 2;
    roads.push({ from: [u, -24], to: [u, ground.h + 24] });
  }
  roads.push({ from: [-24, PLOT + GAP / 2], to: [ground.w + 24, PLOT + GAP / 2] });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-ink-950 blueprint-grid [perspective:1800px]">
      {/* HUD frame */}
      <div aria-hidden className="pointer-events-none absolute inset-4 z-20">
        {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map(
          (c) => (
            <span key={c} className={cn("absolute size-5 border-teal/50", c)} />
          )
        )}
      </div>
      <div className="pointer-events-none absolute top-8 left-9 z-20">
        <p className="hud text-teal">Portfolio site plan</p>
        <p className="hud mt-1 text-ink-400">
          {pinsByDepth.length} companies · {zones.length} sectors
        </p>
      </div>
      <p aria-hidden className="hud pointer-events-none absolute top-8 right-9 z-20 text-right text-ink-400">
        BLR · 12.97° N / 77.59° E
      </p>

      <div ref={stageRef} className="relative px-6 pt-20 pb-24 will-change-transform [transform-style:preserve-3d]">
        <div className="relative mx-auto w-full max-w-[1400px]" style={{ aspectRatio: `${viewBox.w} / ${viewBox.h}` }}>
          <svg
            className="tvc-map absolute inset-0 size-full"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            aria-hidden
            focusable="false"
          >
            <style>{mapCss}</style>
            {/* Ground survey grid */}
            <g stroke={TEAL} strokeOpacity={0.08} strokeWidth={1}>
              {gridLines.map((l, i) => {
                const a = iso(...l.from);
                const b = iso(...l.to);
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
            </g>
            <polygon points={poly(corners)} fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={1} />

            {/* Roads */}
            <g stroke="#ffffff" strokeOpacity={0.12} strokeDasharray="10 8" strokeWidth={1}>
              {roads.map((r, i) => {
                const a = iso(...r.from);
                const b = iso(...r.to);
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
            </g>

            {/* Sector plots */}
            {zones.map((z) => {
              const dim = activeSector !== null && activeSector !== z.id;
              const on = activeSector === z.id;
              const plot = [iso(z.u, z.v), iso(z.u + PLOT, z.v), iso(z.u + PLOT, z.v + PLOT), iso(z.u, z.v + PLOT)];
              const inset = 12;
              const inner = [
                iso(z.u + inset, z.v + inset),
                iso(z.u + PLOT - inset, z.v + inset),
                iso(z.u + PLOT - inset, z.v + PLOT - inset),
                iso(z.u + inset, z.v + PLOT - inset),
              ];
              return (
                <g key={z.id} className="transition-opacity duration-500" style={{ opacity: dim ? 0.25 : 1 }}>
                  <polygon
                    points={poly(plot)}
                    fill={on ? TEAL : "#ffffff"}
                    fillOpacity={on ? 0.06 : 0.015}
                    stroke="#ffffff"
                    strokeOpacity={on ? 0.45 : 0.2}
                    strokeWidth={1}
                  />
                  <polygon
                    points={poly(inner)}
                    fill="none"
                    stroke={TEAL}
                    strokeOpacity={on ? 0.5 : 0.2}
                    strokeDasharray="4 5"
                    strokeWidth={1}
                  />
                  {/* Label painted on the ground plane, along the plot's front-left edge */}
                  <g transform={GROUND_MATRIX}>
                    <text
                      x={z.u + 20}
                      y={z.v + PLOT - 22}
                      fill={on ? TEAL : "#9aa1ad"}
                      style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: 2.5 }}
                    >
                      {`${z.number} — ${z.name.toUpperCase()}`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Transmission line */}
            <polyline
              points={gridLine}
              fill="none"
              stroke={TEAL}
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="6 10"
              className="tvc-dash"
            />

            {/* Towers, back to front */}
            {pinsByDepth.map((pin) => {
              const slug = pin.company.slug;
              const dim = activeSector !== null && activeSector !== pin.zone;
              const active = !dim && (selected === slug || hovered === slug);
              return <Tower key={slug} pin={pin} state={dim ? "dim" : active ? "active" : "idle"} />;
            })}
          </svg>

          {/* HUD callouts (HTML, so text stays crisp and focusable) */}
          {pinsByDepth.map((pin, depth) => {
            const { company } = pin;
            const dim = activeSector !== null && activeSector !== pin.zone;
            const active = !dim && (selected === company.slug || hovered === company.slug);
            const pos = toPercent(iso(pin.u, pin.v, pin.h + pin.leader), viewBox);
            const status = statusLabel(company);
            return (
              <button
                key={company.slug}
                type="button"
                onClick={() => onSelect(company.slug)}
                onPointerEnter={() => setHovered(company.slug)}
                onPointerLeave={() => setHovered((h) => (h === company.slug ? null : h))}
                onFocus={() => setHovered(company.slug)}
                onBlur={() => setHovered((h) => (h === company.slug ? null : h))}
                tabIndex={dim ? -1 : 0}
                aria-hidden={dim || undefined}
                aria-label={`${company.name} — ${portfolioSectorName(company.sector)}, ${company.stage}, invested ${company.yearInvested}${status ? `, ${status}` : ""}. Open profile`}
                data-active={active || undefined}
                className={cn(
                  "group absolute -translate-y-full rounded-md border px-2.5 py-1.5 text-left whitespace-nowrap transition-[opacity,border-color,background-color] duration-300",
                  "border-white/12 bg-ink-900/85 hover:border-teal/60 data-[active]:border-teal data-[active]:bg-ink-800",
                  dim && "pointer-events-none opacity-20"
                )}
                style={{ left: pos.left, top: pos.top, zIndex: 10 + depth, marginLeft: -3 }}
              >
                <span className="flex items-baseline gap-2">
                  <span className="hud text-teal">{pin.number}</span>
                  <span className="text-[0.72rem] font-semibold tracking-wide text-white">{company.name}</span>
                  {status && <span className="hud text-white/60">· {status}</span>}
                </span>
                <span className="hud hidden pt-1 text-ink-300 group-data-[active]:block">
                  {portfolioSectorName(company.sector)} · {company.stage} · {company.yearInvested}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend: tower height encodes stage */}
      <div className="pointer-events-none absolute bottom-8 left-9 z-20 flex items-end gap-4">
        <p className="hud mr-1 self-center text-ink-400">Tower height = stage</p>
        {stageLegend.map((s) => (
          <span key={s} className="flex flex-col items-center gap-1.5">
            <span
              className="w-2.5 border border-teal/70 bg-teal/15"
              style={{ height: Math.round(stageHeight[s] / 5) }}
            />
            <span className="hud text-[0.6rem] text-ink-300">{s}</span>
          </span>
        ))}
      </div>
      <p className="hud pointer-events-none absolute right-9 bottom-8 z-20 text-ink-400">Select a company to view its profile</p>
    </div>
  );
}
