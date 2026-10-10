import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Abstract line-art compositions for the light pages (Impact, GIFT City).
// They stand in for photography: swap for <Image> once real photos are supplied.
// Strokes use currentColor, so set the colour with a text-* class.

export type LineArtVariant = "shell" | "arcs" | "flow" | "network" | "dots" | "skyline";

const r = (n: number) => Math.round(n * 10) / 10;

function quad(p0: number[], p1: number[], p2: number[], t: number) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

/** Ruled surface between two curves — evokes a sweeping architectural shell. */
function shell() {
  const a = [[110, 320], [250, 40], [430, 10]];
  const b = [[270, 330], [340, 170], [430, 130]];
  const lines: ReactNode[] = [];
  for (let i = 0; i <= 44; i++) {
    const t = i / 44;
    const [x1, y1] = quad(a[0], a[1], a[2], t);
    const [x2, y2] = quad(b[0], b[1], b[2], t);
    lines.push(<line key={i} x1={r(x1)} y1={r(y1)} x2={r(x2)} y2={r(y2)} strokeWidth="0.6" />);
  }
  return (
    <>
      {lines}
      <path d="M110 320 Q250 40 430 10" strokeWidth="1.2" />
      <path d="M270 330 Q340 170 430 130" strokeWidth="1.2" />
    </>
  );
}

function arcs() {
  return Array.from({ length: 16 }, (_, i) => {
    const radius = 36 + i * 26;
    return (
      <circle key={i} cx="20" cy="300" r={radius} strokeWidth="0.8" strokeOpacity={r(1 - i * 0.05)} />
    );
  });
}

function flow() {
  return Array.from({ length: 15 }, (_, i) => {
    const y = 30 + i * 17;
    return <path key={i} d={`M-10 ${y} C120 ${y - 70} 260 ${y + 70} 410 ${y - 24}`} strokeWidth="0.8" />;
  });
}

/** Deterministic pseudo-random node graph (seeded, so server output is stable). */
function network() {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const nodes = Array.from({ length: 20 }, () => [r(30 + rand() * 340), r(30 + rand() * 240)]);
  const edges: ReactNode[] = [];
  nodes.forEach(([x, y], i) => {
    const nearest = nodes
      .map(([x2, y2], j) => ({ j, d: (x - x2) ** 2 + (y - y2) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    nearest.forEach(({ j }) => {
      if (j > i) edges.push(<line key={`${i}-${j}`} x1={x} y1={y} x2={nodes[j][0]} y2={nodes[j][1]} strokeWidth="0.8" />);
    });
  });
  return (
    <>
      {edges}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 5 : 2.5} fill="currentColor" stroke="none" />
      ))}
      {nodes
        .filter((_, i) => i % 5 === 0)
        .map(([x, y], i) => (
          <circle key={`ring-${i}`} cx={x} cy={y} r="12" strokeWidth="0.6" />
        ))}
    </>
  );
}

function dots() {
  const out: ReactNode[] = [];
  for (let x = 10; x <= 400; x += 20) {
    for (let y = 10; y <= 300; y += 20) {
      out.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="currentColor" stroke="none" />);
    }
  }
  return (
    <>
      {out}
      <circle cx="130" cy="150" r="60" strokeWidth="0.8" />
      <circle cx="130" cy="150" r="96" strokeWidth="0.5" strokeDasharray="3 5" />
      <circle cx="290" cy="110" r="34" strokeWidth="0.8" />
      <circle cx="290" cy="110" r="4" fill="currentColor" stroke="none" />
      <circle cx="130" cy="150" r="4" fill="currentColor" stroke="none" />
    </>
  );
}

/** Stylised finance-district skyline, anchored to the bottom edge. */
function skyline() {
  const towers: [number, number, number][] = [
    [10, 34, 110], [48, 26, 150], [78, 40, 205], [122, 30, 170], [156, 46, 262],
    [206, 34, 190], [244, 52, 232], [300, 28, 150], [332, 40, 184], [376, 30, 120],
  ];
  const base = 300;
  return (
    <>
      <line x1="-10" y1={base} x2="410" y2={base} strokeWidth="1" />
      {towers.map(([x, w, h], i) => {
        const top = base - h;
        const floors: ReactNode[] = [];
        for (let y = top + 14; y < base; y += 12) {
          floors.push(<line key={y} x1={x + 4} y1={y} x2={x + w - 4} y2={y} strokeWidth="0.4" strokeOpacity="0.6" />);
        }
        return (
          <g key={i}>
            <rect x={x} y={top} width={w} height={h} strokeWidth="0.9" />
            <line x1={x + w / 2} y1={top} x2={x + w / 2} y2={base} strokeWidth="0.3" strokeOpacity="0.5" />
            {floors}
            {i === 4 && <line x1={x + w / 2} y1={top} x2={x + w / 2} y2={top - 34} strokeWidth="0.9" />}
          </g>
        );
      })}
    </>
  );
}

const variants: Record<LineArtVariant, () => ReactNode> = { shell, arcs, flow, network, dots, skyline };

export function LineArt({ variant, className }: { variant: LineArtVariant; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio={variant === "skyline" ? "xMidYMax slice" : "xMidYMid slice"}
      className={cn("size-full", className)}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {variants[variant]()}
    </svg>
  );
}
