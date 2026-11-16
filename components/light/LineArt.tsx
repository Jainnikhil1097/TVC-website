import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Abstract line-art compositions used in page heroes (one motif per page) and on
// the Impact / GIFT City pages. They stand in for photography: swap for <Image>
// once real photos are supplied. Strokes use currentColor, so set the colour with
// a text-* class.
//
// `animated` (page headers only) brings a drawing to life in the home hero's style:
// it draws itself in, keeps a gentle loop of its own, and aqua pulses travel along a
// few lines. Pure CSS on the server-rendered SVG (styles: "Header line-art motion" in
// globals.css); every animation ends on the full static drawing, so reduced-motion
// visitors simply see the still image. Without `animated` the output is unchanged.

export type LineArtVariant =
  | "arcs"
  | "flow"
  | "network"
  | "dots"
  | "skyline"
  | "blueprint"
  | "decouple"
  | "writing"
  | "meet"
  | "paths";

const AQUA = "#06e8d3"; // Brand "Transition Aqua"

const r = (n: number) => Math.round(n * 10) / 10;

type Css = CSSProperties & Record<`--${string}`, string | number>;

/** Props that make a stroked element draw itself in (staggered by `i`). */
const draw = (anim: boolean, i: number, extra?: string) =>
  anim ? { pathLength: 1, className: cn("la-d", extra), style: { "--i": i } as Css } : {};

/** A short aqua dash travelling along a copy of a line, on a loop. */
function Pulse({ children, dur, delay }: { children: ReactNode; dur: number; delay: number }) {
  return (
    <g className="la-pulse" stroke={AQUA} strokeWidth="1.6" style={{ "--dur": `${dur}s`, "--delay": `${delay}s` } as Css}>
      {children}
    </g>
  );
}

type Pt = [number, number];

function cubic([p0, p1, p2, p3]: Pt[], t: number): Pt {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

const curvePath = ([p0, p1, p2, p3]: Pt[]) => `M${p0} C${p1} ${p2} ${p3}`;
const polyPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${r(x)} ${r(y)}`).join(" ");

/** Seeded pseudo-random numbers, so server output is stable. */
const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/**
 * Impact: "decoupling". Emissions bend down while clean output rises past them; the
 * widening gap between the two is hatched, and aqua pulses ride the rising line.
 */
function decouple(anim: boolean) {
  const emissions: Pt[] = [[10, 70], [150, 60], [210, 170], [395, 250]];
  const output: Pt[] = [[10, 250], [160, 248], [230, 150], [395, 50]];
  const hatch: ReactNode[] = [];
  for (let k = 0, t = 0.42; t <= 1.0001; t += 0.024, k++) {
    const [ex, ey] = cubic(emissions, t);
    const [ox, oy] = cubic(output, t);
    if (oy < ey - 4) hatch.push(<line key={k} x1={r(ex)} y1={r(ey)} x2={r(ox)} y2={r(oy)} strokeWidth="0.5" strokeOpacity="0.7" {...draw(anim, 14 + k, "la-glow")} />);
  }
  const ticks = Array.from({ length: 10 }, (_, i) => 10 + (i + 1) * 38);
  return (
    <>
      <line x1="10" y1="272" x2="396" y2="272" strokeWidth="0.6" {...draw(anim, 0)} />
      <line x1="10" y1="20" x2="10" y2="272" strokeWidth="0.6" {...draw(anim, 0)} />
      {ticks.map((x, i) => (
        <line key={x} x1={x} y1="272" x2={x} y2="277" strokeWidth="0.6" {...draw(anim, 2 + i * 0.5)} />
      ))}
      {hatch}
      <path d={curvePath(emissions)} strokeWidth="1" strokeOpacity="0.6" {...draw(anim, 4)} />
      <path d={curvePath(output)} strokeWidth="1.6" {...draw(anim, 8)} />
      <circle cx="395" cy="250" r="3" strokeWidth="0.8" />
      <circle cx="395" cy="50" r="3.2" fill="currentColor" stroke="none" className={anim ? "la-pop" : undefined} style={anim ? ({ "--i": 30 } as Css) : undefined} />
      <circle cx="395" cy="50" r="10" strokeWidth="0.6" className={anim ? "la-breathe" : undefined} />
      {anim && (
        <>
          <Pulse dur={6} delay={1.8}>
            <path d={curvePath(output)} pathLength={1} />
          </Pulse>
          <Pulse dur={6} delay={4.8}>
            <path d={curvePath(output)} pathLength={1} />
          </Pulse>
        </>
      )}
    </>
  );
}

/**
 * Perspectives: a page being written. Lines of "words" appear row by row under a
 * heading, a few phrases glow, and a caret blinks at the end.
 */
function writing(anim: boolean) {
  const rand = seeded(23);
  const left = 44;
  const right = 384;
  const words: ReactNode[] = [];
  let caret: Pt = [left, 0];
  // Row 0 is a heading; a blank row; then two paragraphs.
  const rows = [0, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13];
  const paraEnds = new Set([7, 13]);
  rows.forEach((row) => {
    const y = 40 + row * 17;
    const heading = row === 0;
    const end = heading ? left + (right - left) * 0.58 : paraEnds.has(row) ? left + (right - left) * (0.35 + rand() * 0.3) : right;
    let x = left;
    let w = 0;
    while (x < end - 12) {
      const len = Math.min(heading ? 30 + rand() * 40 : 12 + rand() * 38, end - x);
      const glow = anim && !heading && rand() < 0.09;
      words.push(
        <line
          key={`${row}-${w}`}
          x1={r(x)}
          y1={y}
          x2={r(x + len)}
          y2={y}
          strokeWidth={heading ? 5 : 2.6}
          strokeLinecap="round"
          {...draw(anim, row * 3.2 + w * 0.35, glow ? "la-glow" : undefined)}
        />
      );
      caret = [x + len + 7, y];
      x += len + (heading ? 11 : 8);
      w++;
    }
  });
  const rule = 40 + 17 * 1 - 2;
  return (
    <>
      <line x1="24" y1="18" x2="24" y2="292" strokeWidth="0.6" {...draw(anim, 0)} />
      <line x1={left} y1={rule} x2={right} y2={rule} strokeWidth="0.5" strokeOpacity="0.7" {...draw(anim, 2)} />
      {words}
      <line
        x1={r(caret[0])}
        y1={caret[1] - 7}
        x2={r(caret[0])}
        y2={caret[1] + 7}
        stroke={anim ? AQUA : undefined}
        strokeWidth="1.6"
        className={anim ? "la-blink" : undefined}
        style={anim ? ({ "--delay": "2.6s" } as Css) : undefined}
      />
      {anim && (
        <>
          <Pulse dur={7} delay={1.6}>
            <line x1="24" y1="18" x2="24" y2="292" pathLength={1} />
          </Pulse>
          <Pulse dur={5} delay={2.4}>
            <line x1={left} y1={rule} x2={right} y2={rule} pathLength={1} />
          </Pulse>
        </>
      )}
    </>
  );
}

/**
 * Contact: two signals meeting. Waves come in from both edges, calm as they near the
 * centre and meet at a node, with pulses travelling inward from each side.
 */
function meet(anim: boolean) {
  const cx = 200;
  const cy = 150;
  const wave = (side: -1 | 1, k: number): Pt[] => {
    const pts: Pt[] = [];
    const offset = (k - 1) * 46;
    for (let s = 0; s <= 44; s++) {
      const u = s / 44; // 0 at the edge, 1 at the centre
      const x = side === -1 ? -10 + (cx + 10) * u : 410 - (410 - cx) * u;
      const calm = 1 - u;
      const y = cy + offset * calm * calm + 26 * calm * Math.sin(u * 13 + k * 1.9 + (side === 1 ? 1.1 : 0));
      pts.push([x, y]);
    }
    return pts;
  };
  const waves = ([-1, 1] as const).flatMap((side) => [0, 1, 2].map((k) => ({ side, k, d: polyPath(wave(side, k)) })));
  return (
    <>
      {waves.map((w, i) => (
        <path key={i} d={w.d} strokeWidth={w.k === 1 ? 1.2 : 0.7} strokeOpacity={w.k === 1 ? 1 : 0.7} {...draw(anim, i * 2)} />
      ))}
      <circle cx={cx} cy={cy} r="4.5" fill="currentColor" stroke="none" className={anim ? "la-pop" : undefined} style={anim ? ({ "--i": 24 } as Css) : undefined} />
      <circle cx={cx} cy={cy} r="14" strokeWidth="0.7" className={anim ? "la-breathe" : undefined} />
      <circle cx={cx} cy={cy} r="30" strokeWidth="0.5" strokeDasharray="2 5" className={anim ? "la-spin" : undefined} />
      {anim &&
        waves
          .filter((w) => w.k !== 2)
          .map((w, i) => (
            <Pulse key={`p${i}`} dur={4.5 + (i % 2)} delay={1.6 + i * 0.9}>
              <path d={w.d} pathLength={1} />
            </Pulse>
          ))}
    </>
  );
}

/**
 * About: converging paths. Lines set out from different starting points and merge
 * into one strong line — many backgrounds, one fund.
 */
function paths(anim: boolean) {
  // The merge sits right of centre: page headers fade the left of the drawing into
  // the band, so the convergence has to happen where it stays visible.
  const join: Pt = [318, 150];
  const starts: Pt[] = [[-10, 40], [-10, 150], [-10, 262], [110, -10], [215, -10], [150, 310], [245, 310]];
  const routes = starts.map(([x, y]): Pt[] =>
    y < 0 || y > 300
      ? [[x, y], [x + 10, 150 + (y < 0 ? -55 : 55)], [262, 150], join]
      : [[x, y], [x + 170, y], [240, 150], join]
  );
  const trunk = `M${join} L410 150`;
  return (
    <>
      {routes.map((p, i) => (
        <path key={i} d={curvePath(p)} strokeWidth="0.9" strokeOpacity="0.85" {...draw(anim, i * 1.5)} />
      ))}
      <path d={trunk} strokeWidth="2" {...draw(anim, 12)} />
      {/* A marker where each in-frame path sets out */}
      {routes
        .filter(([[, y]]) => y > 0 && y < 300)
        .map((p, i) => {
          const [mx, my] = cubic(p, 0.28);
          return <circle key={i} cx={r(mx)} cy={r(my)} r="2.6" fill="currentColor" stroke="none" className={anim ? "la-pop" : undefined} style={anim ? ({ "--i": i * 1.5 } as Css) : undefined} />;
        })}
      <circle cx={join[0]} cy={join[1]} r="4.5" fill="currentColor" stroke="none" />
      <circle cx={join[0]} cy={join[1]} r="13" strokeWidth="0.7" className={anim ? "la-breathe" : undefined} />
      {anim && (
        <>
          {[0, 2, 3, 6].map((i, k) => (
            <Pulse key={i} dur={4 + (k % 2)} delay={1.6 + k * 0.8}>
              <path d={curvePath(routes[i])} pathLength={1} />
            </Pulse>
          ))}
          <Pulse dur={3.2} delay={2.2}>
            <path d={trunk} pathLength={1} />
          </Pulse>
        </>
      )}
    </>
  );
}

function arcs(anim: boolean) {
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx="20" cy="300" r={36 + i * 26} strokeWidth="0.8" strokeOpacity={r(1 - i * 0.05)} {...draw(anim, i, "la-glow")} />
      ))}
      {anim &&
        [5, 9, 12].map((i, k) => (
          <Pulse key={i} dur={9 + k * 2} delay={1.8 + k * 1.3}>
            <circle cx="20" cy="300" r={36 + i * 26} pathLength={1} />
          </Pulse>
        ))}
    </>
  );
}

function flow(anim: boolean) {
  return Array.from({ length: 15 }, (_, i) => {
    const y = 30 + i * 17;
    const d = `M-10 ${y} C120 ${y - 70} 260 ${y + 70} 410 ${y - 24}`;
    const pulse = anim && i % 4 === 2;
    return (
      <g key={i} className={anim ? "la-sway" : undefined} style={anim ? ({ "--i": i, "--sway": `${i % 2 ? 5 : -5}px` } as Css) : undefined}>
        <path d={d} strokeWidth="0.8" {...draw(anim, i)} />
        {pulse && (
          <Pulse dur={5 + (i % 3)} delay={1.6 + i * 0.25}>
            <path d={d} pathLength={1} />
          </Pulse>
        )}
      </g>
    );
  });
}

/** Deterministic pseudo-random node graph (seeded, so server output is stable). */
function network(anim: boolean) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const nodes = Array.from({ length: 20 }, () => [r(30 + rand() * 340), r(30 + rand() * 240)]);
  const edgeList: [number, number][] = [];
  nodes.forEach(([x, y], i) => {
    const nearest = nodes
      .map(([x2, y2], j) => ({ j, d: (x - x2) ** 2 + (y - y2) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    nearest.forEach(({ j }) => {
      if (j > i) edgeList.push([i, j]);
    });
  });
  return (
    <>
      {edgeList.map(([i, j], k) => (
        <line key={`${i}-${j}`} x1={nodes[i][0]} y1={nodes[i][1]} x2={nodes[j][0]} y2={nodes[j][1]} strokeWidth="0.8" {...draw(anim, k)} />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 5 === 0 ? 5 : 2.5}
          fill="currentColor"
          stroke="none"
          className={anim ? "la-pop" : undefined}
          style={anim ? ({ "--i": i } as Css) : undefined}
        />
      ))}
      {nodes
        .filter((_, i) => i % 5 === 0)
        .map(([x, y], i) => (
          <circle
            key={`ring-${i}`}
            cx={x}
            cy={y}
            r="12"
            strokeWidth="0.6"
            className={anim ? "la-breathe" : undefined}
            style={anim ? ({ "--i": i } as Css) : undefined}
          />
        ))}
      {anim &&
        edgeList
          .filter((_, k) => k % 3 === 0)
          .map(([i, j], k) => (
            <Pulse key={`p${i}-${j}`} dur={3 + (k % 3)} delay={1.6 + k * 0.6}>
              <line x1={nodes[i][0]} y1={nodes[i][1]} x2={nodes[j][0]} y2={nodes[j][1]} pathLength={1} />
            </Pulse>
          ))}
    </>
  );
}

function dots(anim: boolean) {
  const out: ReactNode[] = [];
  let n = 0;
  for (let x = 10; x <= 400; x += 20) {
    for (let y = 10; y <= 300; y += 20) {
      // A sparse subset twinkles, rippling out from the main circle's centre.
      const twinkle = anim && n++ % 6 === 0;
      const dist = Math.hypot(x - 130, y - 150);
      out.push(
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="1.1"
          fill="currentColor"
          stroke="none"
          className={twinkle ? "la-twinkle" : undefined}
          style={twinkle ? ({ "--delay": `${r(dist / 90)}s` } as Css) : undefined}
        />
      );
    }
  }
  return (
    <>
      {out}
      <circle cx="130" cy="150" r="60" strokeWidth="0.8" {...draw(anim, 0)} />
      <circle cx="130" cy="150" r="96" strokeWidth="0.5" strokeDasharray="3 5" className={anim ? "la-spin" : undefined} />
      <circle cx="290" cy="110" r="34" strokeWidth="0.8" {...draw(anim, 8)} />
      <circle cx="290" cy="110" r="4" fill="currentColor" stroke="none" className={anim ? "la-blink" : undefined} />
      <circle cx="130" cy="150" r="4" fill="currentColor" stroke="none" />
      {anim && (
        <>
          <Pulse dur={7} delay={1.6}>
            <circle cx="130" cy="150" r="60" pathLength={1} />
          </Pulse>
          <Pulse dur={4.5} delay={2.6}>
            <circle cx="290" cy="110" r="34" pathLength={1} />
          </Pulse>
        </>
      )}
    </>
  );
}

/** Stylised finance-district skyline, anchored to the bottom edge. */
function skyline(anim: boolean) {
  const towers: [number, number, number][] = [
    [10, 34, 110], [48, 26, 150], [78, 40, 205], [122, 30, 170], [156, 46, 262],
    [206, 34, 190], [244, 52, 232], [300, 28, 150], [332, 40, 184], [376, 30, 120],
  ];
  const base = 300;
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return (
    <>
      <line x1="-10" y1={base} x2="410" y2={base} strokeWidth="1" {...draw(anim, 0)} />
      {towers.map(([x, w, h], i) => {
        const top = base - h;
        const floors: ReactNode[] = [];
        for (let y = top + 14; y < base; y += 12) {
          // A few windows light up aqua and fade, at random-but-stable moments.
          const lit = anim && rand() < 0.14;
          floors.push(
            <line
              key={y}
              x1={x + 4}
              y1={y}
              x2={x + w - 4}
              y2={y}
              strokeWidth="0.4"
              strokeOpacity="0.6"
              className={lit ? "la-window" : undefined}
              style={lit ? ({ "--delay": `${r(1.8 + rand() * 7)}s`, "--dur": `${r(5 + rand() * 4)}s` } as Css) : undefined}
            />
          );
        }
        return (
          <g key={i} className={anim ? "la-rise" : undefined} style={anim ? ({ "--i": i } as Css) : undefined}>
            <rect x={x} y={top} width={w} height={h} strokeWidth="0.9" />
            <line x1={x + w / 2} y1={top} x2={x + w / 2} y2={base} strokeWidth="0.3" strokeOpacity="0.5" />
            {floors}
            {i === 4 && (
              <>
                <line x1={x + w / 2} y1={top} x2={x + w / 2} y2={top - 34} strokeWidth="0.9" />
                {anim && <circle cx={x + w / 2} cy={top - 36} r="2.4" fill={AQUA} stroke="none" className="la-blink" />}
              </>
            )}
          </g>
        );
      })}
      {anim && (
        <Pulse dur={8} delay={2}>
          <line x1="-10" y1={base} x2="410" y2={base} pathLength={1} />
        </Pulse>
      )}
    </>
  );
}

/** Isometric survey grid with line-drawn towers — echoes the portfolio map. */
function blueprint(anim: boolean) {
  const cos = Math.cos(Math.PI / 6);
  const sin = Math.sin(Math.PI / 6);
  const S = 15; // grid cell size
  const iso = (x: number, y: number, z = 0) => [r(210 + (x - y) * cos * S), r(172 + (x + y) * sin * S - z * S)];
  const grid: ReactNode[] = [];
  const pulses: ReactNode[] = [];
  for (let i = -8; i <= 8; i++) {
    const [a1, a2] = [iso(i, -8), iso(i, 8)];
    const [b1, b2] = [iso(-8, i), iso(8, i)];
    grid.push(<line key={`gx${i}`} x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} strokeWidth="0.35" strokeOpacity="0.55" {...draw(anim, i + 8)} />);
    grid.push(<line key={`gy${i}`} x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} strokeWidth="0.35" strokeOpacity="0.55" {...draw(anim, i + 8)} />);
    if (anim && (i === -6 || i === 7)) {
      pulses.push(
        <Pulse key={`px${i}`} dur={6} delay={2 + (i + 8) * 0.15}>
          <line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} pathLength={1} />
        </Pulse>,
        <Pulse key={`py${i}`} dur={7.5} delay={3 + (i + 8) * 0.1}>
          <line x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} pathLength={1} />
        </Pulse>
      );
    }
  }
  // [x, y, width, depth, height] in grid units — fixed so server output is stable.
  const towers: [number, number, number, number, number][] = [
    [-5, -3, 2, 2, 4],
    [-2, -5, 2, 2, 7],
    [1, -2, 3, 2, 5],
    [-4, 2, 2, 3, 3],
    [2, 2, 2, 2, 7],
    [5, -1, 2, 2, 3],
  ];
  const pts = (list: number[][]) => list.map(([x, y]) => `${x},${y}`).join(" ");
  // Back-to-front, filled with the band colour, so nearer towers hide what's behind.
  const ordered = [...towers].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  const solid = "#0a1e3f";
  return (
    <>
      {grid}
      {pulses}
      {ordered.map(([x, y, w, d, h], i) => {
        const top = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)];
        const left = [iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)];
        const right = [iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)];
        const floors: ReactNode[] = [];
        for (let z = 1; z < h; z++) {
          const [p1, p2, p3] = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y, z)];
          floors.push(<polyline key={z} points={pts([p1, p2, p3])} strokeWidth="0.35" strokeOpacity="0.6" />);
        }
        const centre = iso(x + w / 2, y + d / 2, h);
        return (
          <g key={i} className={anim ? "la-rise" : undefined} style={anim ? ({ "--i": i + 3 } as Css) : undefined}>
            <polygon points={pts(left)} fill={solid} strokeWidth="0.8" />
            <polygon points={pts(right)} fill={solid} strokeWidth="0.8" />
            <polygon points={pts(top)} fill={solid} strokeWidth="0.9" />
            {floors}
            {/* Aqua beacon on the tallest towers */}
            {anim && h === 7 && <circle cx={centre[0]} cy={centre[1]} r="2.4" fill={AQUA} stroke="none" className="la-blink" style={{ "--delay": `${i * 0.7}s` } as Css} />}
          </g>
        );
      })}
    </>
  );
}

const variants: Record<LineArtVariant, (anim: boolean) => ReactNode> = {
  arcs,
  flow,
  network,
  dots,
  skyline,
  blueprint,
  decouple,
  writing,
  meet,
  paths,
};

export function LineArt({ variant, className, animated = false }: { variant: LineArtVariant; className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio={variant === "skyline" ? "xMidYMax slice" : "xMidYMid slice"}
      className={cn("size-full", animated && "la-anim", className)}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {variants[variant](animated)}
    </svg>
  );
}
