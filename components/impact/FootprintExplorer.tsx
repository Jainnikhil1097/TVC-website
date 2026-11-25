"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { geoDistance, geoEqualEarth, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { land, outline, presenceHeadline, presenceLabels, type FootprintCountry, type Presence } from "./geo";

const W = 960;
const H = 500;
const LAND = "#e3e9ee";
const HIGHLIGHT = "#bfe7e2";
const ACCENT = "#0ed5c2";
const INK = "#0b0b0b";

type Filter = "all" | Presence;

/**
 * The portfolio's global footprint: a flat map or a slowly turning globe, presence
 * filters, country chips and a panel with the selected country's evidence. Markers are
 * country-level, never facility locations. Land is drawn without country borders; only
 * listed countries are outlined, and India's outline is always the official boundary.
 */
export function FootprintExplorer({
  countries,
  companyNames,
  footnote,
}: {
  countries: FootprintCountry[];
  companyNames: Record<string, string>;
  footnote: string;
}) {
  const [view, setView] = useState<"map" | "globe">("map");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState(() => countries.find((c) => c.value)?.name ?? countries[0]?.name);
  const shown = (c: FootprintCountry) => filter === "all" || c.presence.includes(filter);
  const country = countries.find((c) => c.name === selected);

  const select = (name: string) => setSelected(name);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="View" className="flex gap-1 rounded-full border border-line bg-white p-1">
          {(["map", "globe"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn("min-h-10 rounded-full px-4 text-sm capitalize transition-colors", view === v ? "bg-ink text-white" : "text-muted hover:text-ink")}
            >
              {v}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Show presence" className="flex flex-wrap gap-2">
          {(["all", "hq", "manufacturing", "deployments"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm transition-colors",
                filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-teal-ink/50 hover:text-teal-ink"
              )}
            >
              {f === "all" ? "All presence" : presenceLabels[f]}
            </button>
          ))}
        </div>
        <p className="hud ml-auto text-muted">{countries.length} countries</p>
      </div>

      <div className="mt-6 grid gap-6 rounded-3xl bg-surface p-5 sm:p-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
        {/* Selected country */}
        <div aria-live="polite" className="lg:pt-2">
          <p className="eyebrow text-teal-ink">Selected country</p>
          {country && (
            <>
              <h3 className="display mt-4 text-3xl text-ink sm:text-4xl">{country.name}</h3>
              {country.companies.length > 0 && (
                <p className="mt-3 text-lg font-bold text-ink">
                  {country.companies.map((slug, i) => (
                    <span key={slug}>
                      {i > 0 && " · "}
                      <Link href={`/portfolio?company=${slug}`} className="hover:text-teal-ink">
                        {companyNames[slug] ?? slug}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
              {country.presence.length > 0 && <p className="eyebrow mt-4 text-teal-ink">{presenceHeadline(country.presence)}</p>}
              {country.value && <p className="display mt-4 text-5xl text-ink">{country.value}</p>}
              {country.valueLabel && <p className="mt-2 font-bold text-ink">{country.valueLabel}</p>}
              {country.detail ? (
                <p className="mt-4 leading-relaxed text-muted">{country.detail}</p>
              ) : (
                <p className="mt-4 leading-relaxed text-muted">Company details for this country are being confirmed.</p>
              )}
              {country.source && <p className="mt-4 text-xs leading-relaxed text-muted">Source: {country.source}</p>}
            </>
          )}
        </div>

        {/* Map or globe */}
        <div className="relative min-w-0">
          {view === "map" ? (
            <FlatMap countries={countries} selected={selected} shown={shown} onSelect={select} />
          ) : (
            <Globe countries={countries} selected={selected} shown={shown} onSelect={select} />
          )}
        </div>
      </div>

      <div role="group" aria-label="Countries" className="mt-6 flex flex-wrap gap-2">
        {countries.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-pressed={selected === c.name}
            onClick={() => select(c.name)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm transition-colors",
              selected === c.name ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-teal-ink/50 hover:text-teal-ink",
              !shown(c) && selected !== c.name && "opacity-40"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">{footnote}</p>
      <p className="hud mt-3 text-muted">Country-level markers / not individual facility coordinates</p>
    </div>
  );
}

type ViewProps = {
  countries: FootprintCountry[];
  selected?: string;
  shown: (c: FootprintCountry) => boolean;
  onSelect: (name: string) => void;
};

/** Equal Earth world map (SVG), with clickable country markers and labels. */
function FlatMap({ countries, selected, shown, onSelect }: ViewProps) {
  const { path, project } = useMemo(() => {
    const projection = geoEqualEarth().fitExtent([[8, 8], [W - 8, H - 8]], { type: "Sphere" } as never);
    return { path: geoPath(projection), project: (lon: number, lat: number) => projection([lon, lat]) ?? [0, 0] };
  }, []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="World map of portfolio presence">
      <path d={path(land) ?? ""} fill={LAND} />
      {countries.map((c) => {
        const o = outline(c.name);
        if (!o) return null;
        return <path key={c.name} d={path(o) ?? ""} fill={c.name === selected ? "#9fded7" : HIGHLIGHT} opacity={shown(c) ? 1 : 0.35} />;
      })}
      {countries.map((c) => {
        const [x, y] = project(c.lon, c.lat);
        const on = c.name === selected;
        const right = x < W * 0.8;
        // Label above the marker when another marker sits just below it (e.g. Netherlands over Switzerland).
        const crowded = countries.some((o) => {
          if (o === c) return false;
          const [ox, oy] = project(o.lon, o.lat);
          return oy > y && oy - y < 26 && Math.abs(ox - x) < 70;
        });
        const labelY = crowded ? y - 11 : y + 18;
        return (
          <g
            key={c.name}
            role="button"
            tabIndex={-1}
            aria-label={`Show ${c.name}`}
            onClick={() => onSelect(c.name)}
            className="cursor-pointer"
            opacity={shown(c) ? 1 : 0.3}
          >
            <circle cx={x} cy={y} r={14} fill="transparent" />
            {on && <circle cx={x} cy={y} r={11} fill={ACCENT} opacity={0.25} />}
            <circle cx={x} cy={y} r={5.5} fill={on ? ACCENT : "#ffffff"} stroke={INK} strokeWidth={1.5} />
            <text x={right ? x + 10 : x - 10} y={labelY} textAnchor={right ? "start" : "end"} fontSize={13} fill={INK} style={{ fontFamily: "var(--font-sans)" }}>
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Orthographic globe on a canvas: turns slowly (paused for reduced motion, on drag and with
 * the pause button), drag to spin, and turns to face the selected country.
 */
function Globe({ countries, selected, shown, onSelect }: ViewProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rotation = useRef<[number, number]>([-78, -18]);
  const target = useRef<[number, number] | null>(null);
  const dragging = useRef<{ x: number; y: number; r: [number, number] } | null>(null);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const live = useRef({ countries, selected, shown });
  useEffect(() => {
    live.current = { countries, selected, shown };
  }, [countries, selected, shown]);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Turn to face a newly selected country.
  useEffect(() => {
    const c = countries.find((x) => x.name === selected);
    if (c) target.current = [-c.lon, -Math.max(-35, Math.min(35, c.lat))];
  }, [selected, countries]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    // Reduced motion: no turning (the pause button is hidden by CSS too); drag still works.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let size = 0;
    const projection = geoOrthographic().clipAngle(90);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    const draw = () => {
      const { countries: list, selected: sel, shown: isShown } = live.current;
      projection.rotate([rotation.current[0], rotation.current[1], 0]).translate([size / 2, size / 2]).scale(size / 2 - 4);
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      path({ type: "Sphere" } as never);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      path(land);
      ctx.fillStyle = LAND;
      ctx.fill();
      for (const c of list) {
        const o = outline(c.name);
        if (!o) continue;
        ctx.beginPath();
        path(o);
        ctx.globalAlpha = isShown(c) ? 1 : 0.35;
        ctx.fillStyle = c.name === sel ? "#9fded7" : HIGHLIGHT;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      const centre: [number, number] = [-rotation.current[0], -rotation.current[1]];
      for (const c of list) {
        if (geoDistance([c.lon, c.lat], centre) > Math.PI / 2 - 0.05) continue; // far side
        const p = projection([c.lon, c.lat]);
        if (!p) continue;
        const on = c.name === sel;
        ctx.globalAlpha = isShown(c) ? 1 : 0.3;
        if (on) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 11, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(14,213,194,0.25)";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2);
        ctx.fillStyle = on ? ACCENT : "#ffffff";
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.font = "13px var(--font-sans), sans-serif";
        ctx.fillText(c.name, p[0] + 10, p[1] + 18);
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      path({ type: "Sphere" } as never);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.stroke();
    };

    const resize = () => {
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = rect.width;
      el.width = Math.round(rect.width * dpr);
      el.height = Math.round(rect.width * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 100) : 16;
      last = now;
      if (target.current && !dragging.current) {
        const [tl, tp] = target.current;
        const dl = ((tl - rotation.current[0] + 540) % 360) - 180;
        const dp = tp - rotation.current[1];
        rotation.current = [rotation.current[0] + dl * 0.08, rotation.current[1] + dp * 0.08];
        if (Math.abs(dl) < 0.2 && Math.abs(dp) < 0.2) target.current = null;
      } else if (playingRef.current && !dragging.current && !reduce) {
        rotation.current = [rotation.current[0] + dt * 0.006, rotation.current[1]];
      }
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    raf = requestAnimationFrame(tick);
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    dragging.current = { x: e.clientX, y: e.clientY, r: [...rotation.current] as [number, number] };
    target.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragging.current;
    if (!d) return;
    const k = 180 / (e.currentTarget.getBoundingClientRect().width || 1);
    rotation.current = [d.r[0] + (e.clientX - d.x) * k, Math.max(-60, Math.min(60, d.r[1] - (e.clientY - d.y) * k))];
  };
  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragging.current;
    dragging.current = null;
    // A tap (not a drag) selects the nearest marker.
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = rect.width;
      const projection = geoOrthographic().clipAngle(90).rotate([rotation.current[0], rotation.current[1], 0]).translate([size / 2, size / 2]).scale(size / 2 - 4);
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const centre: [number, number] = [-rotation.current[0], -rotation.current[1]];
      let best: { name: string; d: number } | null = null;
      for (const c of countries) {
        if (geoDistance([c.lon, c.lat], centre) > Math.PI / 2) continue;
        const p = projection([c.lon, c.lat]);
        if (!p) continue;
        const dist = Math.hypot(p[0] - px, p[1] - py);
        if (dist < 22 && (!best || dist < best.d)) best = { name: c.name, d: dist };
      }
      if (best) onSelect(best.name);
    }
  };

  return (
    <div className="relative mx-auto max-w-[30rem]">
      <canvas
        ref={canvas}
        className="aspect-square w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Globe of portfolio presence. Drag to turn it."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (dragging.current = null)}
      />
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="absolute right-2 bottom-2 inline-flex min-h-10 motion-reduce:hidden items-center gap-2 rounded-full border border-line bg-white px-4 text-sm text-ink hover:text-teal-ink"
      >
        {playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
        {playing ? "Pause rotation" : "Play rotation"}
      </button>
    </div>
  );
}
