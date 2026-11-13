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
import { statusLabel, type CompanyEssay } from "./status";
import { CompanyLogo } from "./CompanyLogo";
import { MAP_POPOVER_ID, MapPopover, mapLabelId } from "./MapPopover";

type PortfolioMapProps = {
  layout: MapLayout;
  activeSector: PortfolioSectorId | null;
  /** Company whose full profile panel is open (highlighted on the map). */
  selected: string | null;
  /** Company whose info card is open beside it on the map. */
  popover: string | null;
  onPopoverChange: (slug: string | null) => void;
  onOpenProfile: (slug: string) => void;
  essays: Record<string, CompanyEssay | undefined>;
};

// A true blueprint: pale line art on deep navy, bright teal highlights — the same
// ink as the page heroes and the home globe.
const INK = "#d6e4f0"; // line colour
const ACCENT = "#0ed5c2";
const PAPER = "#0b1626"; // map background
const TOP = "#13263f"; // tower roofs: a lighter navy so towers read as solid volumes

// Scoped to the map SVG: hairline strokes at any scale, and a slow "current" along the transmission line.
const mapCss = `
.tvc-map * { vector-effect: non-scaling-stroke; }
@keyframes tvc-dash { to { stroke-dashoffset: -160; } }
.tvc-dash { animation: tvc-dash 14s linear infinite; }
@media (prefers-reduced-motion: reduce) { .tvc-dash { animation: none; } }
`;

type TowerProps = {
  pin: Pin;
  state: "idle" | "active" | "dim";
  onEnter: () => void;
  onLeave: () => void;
  onActivate: () => void;
};

/**
 * One company's tower. It responds to the pointer like its label does (hover
 * previews, click opens the info card); keyboard users use the labels, which are
 * the accessible controls, so the SVG itself stays aria-hidden.
 */
function Tower({ pin, state, onEnter, onLeave, onActivate }: TowerProps) {
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
      data-map-label
      className="transition-opacity duration-500"
      style={{
        opacity: state === "dim" ? 0.16 : 1,
        cursor: state === "dim" ? "default" : "pointer",
        pointerEvents: state === "dim" ? "none" : "auto",
      }}
      stroke={active ? ACCENT : INK}
      strokeLinejoin="round"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onActivate}
    >
      {/* Ground marker (invisible fill so the whole footprint is hoverable — a painted fill at 0 opacity still catches the pointer) */}
      <polygon
        points={poly([g([u - s - 9, v - s - 9]), g([u + s + 9, v - s - 9]), g([u + s + 9, v + s + 9]), g([u - s - 9, v + s + 9])])}
        fill="#000"
        fillOpacity={0}
        strokeOpacity={active ? 0.7 : 0.25}
        strokeDasharray="3 4"
        strokeWidth={1}
      />
      {/* Left and right faces, then top */}
      <polygon
        points={poly([g(D), g(C), g(C, h), g(D, h)])}
        fill={ACCENT}
        fillOpacity={active ? 0.22 : 0.06}
        strokeOpacity={active ? 1 : 0.6}
        strokeWidth={1}
      />
      <polygon
        points={poly([g(C), g(B), g(B, h), g(C, h)])}
        fill={ACCENT}
        fillOpacity={active ? 0.38 : 0.14}
        strokeOpacity={active ? 1 : 0.6}
        strokeWidth={1}
      />
      <polygon
        points={poly([g(A, h), g(B, h), g(C, h), g(D, h)])}
        fill={active ? "#14403f" : TOP}
        fillOpacity={1}
        strokeOpacity={active ? 1 : 0.75}
        strokeWidth={1}
      />
      {/* Leader line to the HUD label, with a wider invisible line so it's easy to hover */}
      <line x1={top.x} y1={top.y} x2={tip.x} y2={tip.y} stroke="#000" strokeOpacity={0} strokeWidth={14} />
      <line
        x1={top.x}
        y1={top.y}
        x2={tip.x}
        y2={tip.y}
        stroke={active ? ACCENT : INK}
        strokeOpacity={active ? 0.9 : 0.35}
        strokeDasharray="2 3"
        strokeWidth={1}
      />
      <circle cx={tip.x} cy={tip.y} r={2.5} fill={active ? ACCENT : INK} stroke="none" />
    </g>
  );
}

export function PortfolioMap({
  layout,
  activeSector,
  selected,
  popover,
  onPopoverChange,
  onOpenProfile,
  essays,
}: PortfolioMapProps) {
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
    <div
      data-theme="dark"
      className="relative overflow-hidden rounded-3xl border border-white/10 [perspective:1800px]"
      style={{
        backgroundColor: PAPER,
        backgroundImage: `radial-gradient(70% 60% at 50% 45%, rgb(14 213 194 / 0.07), transparent 70%), linear-gradient(rgb(214 228 240 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(214 228 240 / 0.05) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    >
      {/* HUD frame */}
      <div aria-hidden className="pointer-events-none absolute inset-4 z-20">
        {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map(
          (c) => (
            <span key={c} className={cn("absolute size-5 border-white/25", c)} />
          )
        )}
      </div>
      <div className="pointer-events-none absolute top-8 left-9 z-20">
        <p className="hud text-teal">Portfolio site plan</p>
        <p className="hud mt-1 text-ink-300">
          {pinsByDepth.length} companies · {zones.length} sectors
        </p>
      </div>
      <p aria-hidden className="hud pointer-events-none absolute top-8 right-9 z-20 text-right text-ink-300">
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
            <g stroke={INK} strokeOpacity={0.07} strokeWidth={1}>
              {gridLines.map((l, i) => {
                const a = iso(...l.from);
                const b = iso(...l.to);
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
            </g>
            <polygon points={poly(corners)} fill="#ffffff" fillOpacity={0.02} stroke={INK} strokeOpacity={0.22} strokeWidth={1} />

            {/* Roads */}
            <g stroke={INK} strokeOpacity={0.18} strokeDasharray="10 8" strokeWidth={1}>
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
                    fill={on ? ACCENT : "#ffffff"}
                    fillOpacity={on ? 0.1 : 0.03}
                    stroke={INK}
                    strokeOpacity={on ? 0.55 : 0.22}
                    strokeWidth={1}
                  />
                  <polygon
                    points={poly(inner)}
                    fill="none"
                    stroke={ACCENT}
                    strokeOpacity={on ? 0.8 : 0.35}
                    strokeDasharray="4 5"
                    strokeWidth={1}
                  />
                  {/* Label painted on the ground plane, along the plot's front-left edge */}
                  <g transform={GROUND_MATRIX}>
                    <text
                      x={z.u + 20}
                      y={z.v + PLOT - 22}
                      fill={on ? ACCENT : "#8fa3b8"}
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
              stroke={ACCENT}
              strokeOpacity={0.45}
              strokeWidth={1}
              strokeDasharray="6 10"
              className="tvc-dash"
            />

            {/* Towers, back to front */}
            {pinsByDepth.map((pin) => {
              const slug = pin.company.slug;
              const dim = activeSector !== null && activeSector !== pin.zone;
              const active = !dim && (selected === slug || hovered === slug || popover === slug);
              return (
                <Tower
                  key={slug}
                  pin={pin}
                  state={dim ? "dim" : active ? "active" : "idle"}
                  onEnter={() => setHovered(slug)}
                  onLeave={() => setHovered((h) => (h === slug ? null : h))}
                  onActivate={() => onPopoverChange(popover === slug ? null : slug)}
                />
              );
            })}
          </svg>

          {/* HUD callouts (HTML, so text stays crisp and focusable). Hover/focus grows a
              label into a card with the company's logo; click opens the info card. */}
          {pinsByDepth.map((pin, depth) => {
            const { company } = pin;
            const slug = company.slug;
            const dim = activeSector !== null && activeSector !== pin.zone;
            const focus = hovered ?? popover;
            const active = !dim && (selected === slug || hovered === slug || popover === slug);
            const recede = !dim && focus !== null && focus !== slug && !active;
            const pos = toPercent(iso(pin.u, pin.v, pin.h + pin.leader), viewBox);
            const status = statusLabel(company);
            return (
              <button
                key={slug}
                id={mapLabelId(slug)}
                type="button"
                data-map-label
                onClick={() => onPopoverChange(popover === slug ? null : slug)}
                onPointerEnter={() => setHovered(slug)}
                onPointerLeave={() => setHovered((h) => (h === slug ? null : h))}
                onFocus={() => setHovered(slug)}
                onBlur={() => setHovered((h) => (h === slug ? null : h))}
                tabIndex={dim ? -1 : 0}
                aria-hidden={dim || undefined}
                aria-expanded={popover === slug}
                aria-controls={popover === slug ? MAP_POPOVER_ID : undefined}
                aria-label={`${company.name} — ${portfolioSectorName(company.sector)}, ${company.stage}, invested ${company.yearInvested}${status ? `, ${status}` : ""}. Show details`}
                data-active={active || undefined}
                className={cn(
                  "group absolute -translate-y-full origin-bottom-left rounded-lg border px-2.5 py-1.5 text-left whitespace-nowrap",
                  "transition-[opacity,border-color,background-color,box-shadow,scale] duration-300 ease-out-quart motion-reduce:transition-none",
                  "border-white/15 bg-[#0f1d31]/90 shadow-[0_2px_12px_rgb(0_0_0/0.25)] backdrop-blur-sm hover:border-teal/60",
                  "data-[active]:scale-[1.06] data-[active]:border-teal data-[active]:bg-[#0f1d31] data-[active]:shadow-[0_14px_36px_rgb(0_0_0/0.4),0_0_0_1px_rgb(14_213_194/0.25)] motion-reduce:data-[active]:scale-100",
                  recede && "opacity-60",
                  dim && "pointer-events-none opacity-25"
                )}
                style={{ left: pos.left, top: pos.top, zIndex: active ? 150 : 10 + depth, marginLeft: -3 }}
              >
                {/* Logo (or large name until a logo is uploaded) — revealed on hover/focus */}
                <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out-quart group-data-[active]:grid-rows-[1fr] motion-reduce:transition-none">
                  <span className="overflow-hidden">
                    <span className="block pt-1 pb-2">
                      {company.logo ? (
                        <CompanyLogo company={company} tone="dark" className="h-9 w-36" />
                      ) : (
                        <span className="block font-serif text-lg leading-tight text-white">{company.name}</span>
                      )}
                    </span>
                  </span>
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="hud text-teal">{pin.number}</span>
                  <span className={cn("text-[0.75rem] font-semibold text-white", !company.logo && "group-data-[active]:hidden")}>
                    {company.name}
                  </span>
                  {status && <span className="hud text-ink-300">· {status}</span>}
                </span>
                <span className="hud hidden pt-1 text-ink-300 group-data-[active]:block">
                  {portfolioSectorName(company.sector)} · {company.stage} · {company.yearInvested}
                </span>
              </button>
            );
          })}

          {/* Info card beside the clicked company */}
          {(() => {
            const pin = popover ? pinsByDepth.find((p) => p.company.slug === popover) : undefined;
            if (!pin || (activeSector !== null && activeSector !== pin.zone)) return null;
            const a = iso(pin.u, pin.v, pin.h + pin.leader);
            return (
              <MapPopover
                key={pin.company.slug}
                company={pin.company}
                number={pin.number}
                essay={essays[pin.company.slug]}
                anchor={{ fx: (a.x - viewBox.x) / viewBox.w, fy: (a.y - viewBox.y) / viewBox.h }}
                onClose={() => onPopoverChange(null)}
                onOpenProfile={onOpenProfile}
              />
            );
          })()}
        </div>
      </div>

      {/* Legend: tower height encodes stage */}
      <div className="pointer-events-none absolute bottom-8 left-9 z-20 flex items-end gap-4">
        <p className="hud mr-1 self-center text-ink-300">Tower height = stage</p>
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
      <p className="hud pointer-events-none absolute right-9 bottom-8 z-20 text-ink-300">Hover to preview · click for details</p>
    </div>
  );
}
