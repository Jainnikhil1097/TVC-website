import type { CSSProperties } from "react";

/*
 * The Transition symbol: six V-shaped bars pointing in at the centre, arranged so
 * neighbouring Vs run as parallel pairs along six spokes (the whole mark is turned
 * slightly, like a pinwheel).
 *
 * STAND-IN: rebuilt from the Brand Book PDF (which only contains raster images) by
 * measuring and overlaying. Replace PIECES with the official SVG paths when they're
 * supplied. The Brand Book says: never recolour, stretch or add effects.
 *
 * Geometry is in a -1…1 box around the centre: bar width W, each bar offset D from its
 * spoke, and spokes at ROT + 60°·k.
 */
const W = 0.135;
const D = 0.135;
const ROT = -100.5;
const VERTEX = 2.3 * D; // how far each V's point sits from the centre

const rad = (deg: number) => (deg * Math.PI) / 180;
const f = (n: number) => n.toFixed(4);

/** One V per sector between spokes k and k+1: its path, and its outward direction. */
export const PIECES = Array.from({ length: 6 }, (_, k) => {
  const g1 = rad(ROT + 60 * k);
  const g2 = rad(ROT + 60 * (k + 1));
  const a = (g1 + g2) / 2;
  const end1 = [Math.cos(g1) + D * Math.cos(g1 + Math.PI / 2), Math.sin(g1) + D * Math.sin(g1 + Math.PI / 2)];
  const end2 = [Math.cos(g2) + D * Math.cos(g2 - Math.PI / 2), Math.sin(g2) + D * Math.sin(g2 - Math.PI / 2)];
  const v = [VERTEX * Math.cos(a), VERTEX * Math.sin(a)];
  return {
    d: `M${f(end1[0])},${f(end1[1])} L${f(v[0])},${f(v[1])} L${f(end2[0])},${f(end2[1])}`,
    /** Unit vector from the centre through this V's point (for assemble/open motion). */
    dir: [Math.cos(a), Math.sin(a)] as const,
  };
});

/** The symbol as a static mark (logo, favicon-style uses). */
export function BrandSymbol({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="-1.1 -1.1 2.2 2.2"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {PIECES.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={W}
          strokeLinejoin="round"
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}

export const SYMBOL_STROKE = W;
