// Draws a mechanical Model as a hand-drawn blueprint sketch on a 2D canvas, driven by
// a looping timeline: sketch-in → assemble → run → explode. See engine.ts for models.

import { add, arcPts, mul, rotateAbout, sub, X, Y, type Line, type Model, type Timing, type V3 } from "./engine";

const WHITE = "255, 255, 255";
const AQUA = "6, 232, 211"; // Brand "Transition Aqua"
const MINT = "131, 244, 233"; // Brand "Mint"

const DEFAULT_TIMING: Timing = { sketch: 3, assemble: 3.4, run: 6.5, explode: 2.4 };
const STAGGER = 0.45;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Stable pseudo-random in [0, 1) for a given integer. */
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export type Layout = {
  cx: number;
  cy: number;
  scale: number;
  /** Pixel scale for annotations. */
  px: number;
  /** Radius of the interaction zone around the drawing, in px. */
  r: number;
  /** Box the drawing is fitted into, in px (scale = fit / model.size). */
  fit: number;
};

/** Visitor interaction for this frame: extra rotation, pull-apart and a focused part. */
export type View = { yaw: number; pitch: number; pull: number; focus: number };

const NO_VIEW: View = { yaw: 0, pitch: 0, pull: 0, focus: -1 };

type Frame = {
  draw: number; // 0..1 sketch-in progress
  annot: number; // 0..1 annotation reveal
  assembledAt: (order: number) => number;
  run: number; // run clock (s)
  runAmt: number; // 0..1 how "on" the product is
  alpha: number; // global fade
  time: number;
};

export function totalDuration(model: Model) {
  const t = { ...DEFAULT_TIMING, ...model.timing };
  return t.sketch + t.assemble + t.run + t.explode;
}

/** Where we are in the loop at time t (seconds). `runOnly` skips assembly: always built and running. */
export function frameAt(model: Model, time: number, runOnly: boolean): Frame {
  const maxOrder = Math.max(0, ...model.parts.map((p) => p.order ?? 0));
  if (runOnly) return { draw: 1, annot: 1, assembledAt: () => 1, run: time, runAmt: 1, alpha: 1, time };
  const T = { ...DEFAULT_TIMING, ...model.timing };
  const tt = time % (T.sketch + T.assemble + T.run + T.explode);
  const window = (p: number, order: number) => ease(clamp01(p * (1 + maxOrder * STAGGER) - order * STAGGER));

  if (tt < T.sketch) {
    const p = tt / T.sketch;
    return { draw: p, annot: clamp01(p * 1.8), assembledAt: () => 0, run: 0, runAmt: 0, alpha: clamp01(p * 5), time };
  }
  if (tt < T.sketch + T.assemble) {
    const p = (tt - T.sketch) / T.assemble;
    return { draw: 1, annot: 1, assembledAt: (o) => window(p, o), run: 0, runAmt: 0, alpha: 1, time };
  }
  if (tt < T.sketch + T.assemble + T.run) {
    const r = tt - T.sketch - T.assemble;
    return { draw: 1, annot: 1, assembledAt: () => 1, run: r, runAmt: clamp01(r / 0.8), alpha: 1, time };
  }
  const x = (tt - T.sketch - T.assemble - T.run) / T.explode;
  return {
    draw: 1,
    annot: 1,
    // Last in, first out.
    assembledAt: (o) => 1 - window(x, maxOrder - o),
    run: T.run + T.explode * (x - (x * x) / 2), // spins down
    runAmt: 1 - x,
    alpha: x < 0.55 ? 1 : 1 - (x - 0.55) / 0.45,
    time,
  };
}

/** Reveal of a part during sketch-in: construction first, then parts in assembly order. */
function revealAt(draw: number, order: number, maxOrder: number) {
  return clamp01((draw * (1 + maxOrder * 0.3) - order * 0.3 - 0.15) * 1.8);
}

// ─── Projection ──────────────────────────────────────────────────────────────

function projector(model: Model, layout: Layout, time: number, view: View) {
  const yaw = model.yaw + (model.turntable ?? 0) * time + view.yaw;
  const pitch = Math.max(-0.6, Math.min(1.1, model.pitch + view.pitch));
  const D = model.size * 3.2;
  return (p: V3): [number, number, number] => {
    let q = sub(p, model.center);
    q = rotateAbout(q, [0, 0, 0], Y, yaw);
    q = rotateAbout(q, [0, 0, 0], X, pitch);
    const f = D / (D - q[2]);
    return [layout.cx + q[0] * layout.scale * f, layout.cy - q[1] * layout.scale * f, q[2]];
  };
}

// ─── Hand-drawn strokes ──────────────────────────────────────────────────────

type P2 = [number, number, number];

/** Two slightly offset passes with tiny stable jitter; straight lines overshoot a touch. */
function sketchStroke(ctx: CanvasRenderingContext2D, pts: P2[], seed: number, frac: number, closed: boolean) {
  const n = pts.length;
  if (n < 2 || frac <= 0) return;
  const limit = frac >= 1 ? n - 1 : (n - 1) * frac;
  for (let pass = 0; pass < 2; pass++) {
    const amp = pass === 0 ? 0.9 : 1.4;
    ctx.beginPath();
    for (let i = 0; i <= Math.ceil(limit); i++) {
      let x: number, y: number;
      if (i > limit) {
        const a = pts[i - 1];
        const b = pts[Math.min(i, n - 1)];
        const t = limit - (i - 1);
        x = a[0] + (b[0] - a[0]) * t;
        y = a[1] + (b[1] - a[1]) * t;
      } else {
        x = pts[i][0];
        y = pts[i][1];
      }
      x += (hash(seed * 131 + i * 7 + pass * 3) - 0.5) * amp;
      y += (hash(seed * 177 + i * 11 + pass * 5) - 0.5) * amp;
      if (i === 0) {
        // Overshoot the start of straight strokes, as a quick hand would.
        if (n === 2 && pass === 0) {
          const dx = pts[1][0] - pts[0][0];
          const dy = pts[1][1] - pts[0][1];
          const l = Math.hypot(dx, dy) || 1;
          x -= (dx / l) * 3;
          y -= (dy / l) * 3;
        }
        ctx.moveTo(x, y);
      } else ctx.lineTo(x, y);
    }
    if (closed && frac >= 1) ctx.closePath();
    ctx.globalAlpha = pass === 0 ? 1 : 0.55;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Wavy "handwriting" (never real text), left-aligned at (x, y). */
function scribble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, seed: number, frac: number) {
  const end = w * frac;
  let gapAt = 10 + hash(seed) * 20;
  ctx.beginPath();
  let pen = false;
  for (let s = 0; s <= end; s += 1.6) {
    if (s > gapAt) {
      pen = false;
      gapAt = s + 4 + 12 + hash(seed + s) * 22;
      s += 4;
      continue;
    }
    const yy = y + Math.sin(s * 0.62 + seed) * 1.7 + Math.sin(s * 1.9 + seed * 2) * 0.8;
    if (!pen) {
      ctx.moveTo(x + s, yy);
      pen = true;
    } else ctx.lineTo(x + s, yy);
  }
  ctx.stroke();
}

// ─── Frame ───────────────────────────────────────────────────────────────────

/**
 * Draws one frame and returns each part's screen centre (null if not drawn), used to
 * find the part nearest the pointer.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  model: Model,
  layout: Layout,
  f: Frame,
  view: View = NO_VIEW,
  /** Several sketches share the hero: skip the free-floating notes (they'd collide). */
  compact = false
) {
  const project = projector(model, layout, f.time, view);
  const centres: ([number, number] | null)[] = model.parts.map(() => null);
  const maxOrder = Math.max(0, ...model.parts.map((p) => p.order ?? 0));
  const k = layout.px;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Annotations (construction first): Mint, faint.
  ctx.strokeStyle = `rgba(${MINT}, ${0.32 * f.alpha})`;
  ctx.lineWidth = 0.8;
  model.annots.forEach((a, i) => {
    const rv = clamp01(f.annot * 1.6 - i * 0.08);
    if (rv <= 0) return;
    if (a.t === "center") {
      ctx.setLineDash([14, 4, 3, 4]);
      const p = project(a.a);
      const q = project(a.b);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] + (q[0] - p[0]) * rv, p[1] + (q[1] - p[1]) * rv);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (a.t === "circle") {
      if (a.dashed) ctx.setLineDash([3, 5]);
      const pts = arcPts(a.c, a.axis, a.r, 48).map(project);
      sketchStroke(ctx, pts, 900 + i, rv, true);
      ctx.setLineDash([]);
    } else if (a.t === "dim") {
      const p = project(a.a);
      const q = project(a.b);
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const l = Math.hypot(dx, dy) || 1;
      const [ux, uy] = [dx / l, dy / l];
      const [nx, ny] = [-uy, ux];
      const o = a.off * k;
      const A: [number, number] = [p[0] + nx * o, p[1] + ny * o];
      const B: [number, number] = [q[0] + nx * o, q[1] + ny * o];
      ctx.beginPath();
      ctx.moveTo(p[0] + nx * 3, p[1] + ny * 3);
      ctx.lineTo(A[0] + nx * 5, A[1] + ny * 5);
      ctx.moveTo(q[0] + nx * 3, q[1] + ny * 3);
      ctx.lineTo(B[0] + nx * 5, B[1] + ny * 5);
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(A[0] + (B[0] - A[0]) * rv, A[1] + (B[1] - A[1]) * rv);
      // Arrowheads
      const h = 6;
      for (const [P, s] of [[A, 1], [B, -1]] as const) {
        ctx.moveTo(P[0], P[1]);
        ctx.lineTo(P[0] + (ux * s - nx * 0.45) * h, P[1] + (uy * s - ny * 0.45) * h);
        ctx.moveTo(P[0], P[1]);
        ctx.lineTo(P[0] + (ux * s + nx * 0.45) * h, P[1] + (uy * s + ny * 0.45) * h);
      }
      ctx.stroke();
      scribble(ctx, (A[0] + B[0]) / 2 - 9 + nx * 10, (A[1] + B[1]) / 2 + ny * 10, 18, 40 + i, rv);
    } else if (a.t === "leader") {
      const p = project(a.at);
      const ex = p[0] + a.dx * 0.6 * k;
      const ey = p[1] + a.dy * k;
      const w = (a.w ?? 70) * k;
      const dir = a.dx >= 0 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2, 0, Math.PI * 2);
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] + (ex - p[0]) * rv, p[1] + (ey - p[1]) * rv);
      if (rv >= 1) ctx.lineTo(ex + dir * w, ey);
      ctx.stroke();
      if (rv >= 1) {
        const x0 = dir > 0 ? ex + 4 : ex - w;
        scribble(ctx, x0, ey - 8, w - 8, 70 + i, 1);
        scribble(ctx, x0, ey + 9, (w - 8) * 0.7, 90 + i, 1);
      }
    } else if (!compact) {
      for (let r = 0; r < a.rows; r++) {
        const w = a.w * k * (r === a.rows - 1 ? 0.6 : 1);
        scribble(ctx, layout.cx + a.dx * k, layout.cy + a.dy * k + r * 11 * k, w, 200 + i * 13 + r, clamp01(rv * 1.4 - r * 0.25));
      }
    }
  });

  // Parts
  model.parts.forEach((part, pi) => {
    const order = part.order ?? 0;
    const reveal = revealAt(f.draw, order, maxOrder);
    if (reveal <= 0) return;
    const a = f.assembledAt(order);
    // The loop drives assembly; hover/scroll can only add separation on top.
    const apart = Math.max(1 - a, view.pull);
    const off = part.explode && apart > 0 ? mul(part.explode, apart) : null;
    const focused = pi === view.focus;
    let sx = 0;
    let sy = 0;
    let sn = 0;
    const pose = part.motion ? part.motion(f.run) : null;
    const lines: Line[] = part.dynamic ? [...part.lines, ...part.dynamic(f.run)] : part.lines;
    // Aqua marks motion: strong while a part slides into place, a softer tint (same
    // weight as the pencil lines) while the product runs, so the sketch stays a sketch.
    const assembling = a > 0.02 && a < 0.98;
    const running = Boolean(part.moving) && f.runAmt > 0;

    lines.forEach((line, li) => {
      const pts = line.pts.map((p) => {
        let q = pose ? pose(p) : p;
        if (off) q = add(q, off);
        const s = project(q);
        sx += s[0];
        sy += s[1];
        sn++;
        return s;
      });
      // Depth: nearer strokes are stronger.
      const zMid = pts[Math.floor(pts.length / 2)][2];
      const depth = clamp01(0.5 + zMid / model.size);
      const base = (line.detail ? 0.22 : 0.48) * (0.5 + 0.5 * depth) * f.alpha;
      ctx.lineWidth = (line.detail ? 0.7 : 1.05) * (focused ? 1.3 : 1);
      if (focused) {
        ctx.strokeStyle = `rgba(${AQUA}, ${(line.detail ? 0.6 : 0.9) * f.alpha})`;
      } else if (assembling) {
        ctx.strokeStyle = `rgba(${AQUA}, ${0.7 * f.alpha})`;
      } else if (running) {
        ctx.strokeStyle = `rgba(${AQUA}, ${Math.min(0.7, base * (0.85 + 0.25 * f.runAmt))})`;
      } else {
        ctx.strokeStyle = `rgba(${WHITE}, ${base})`;
      }
      sketchStroke(ctx, pts, pi * 997 + li * 31, reveal, Boolean(line.closed));

      if (line.flow && f.runAmt > 0) {
        ctx.save();
        ctx.setLineDash([9, 16]);
        ctx.lineDashOffset = -f.time * 42;
        ctx.strokeStyle = `rgba(${AQUA}, ${0.85 * f.runAmt * f.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
        ctx.restore();
      }
    });
    if (sn) centres[pi] = [sx / sn, sy / sn];
  });
  return centres;
}

/**
 * Where each sketch sits in the hero. One: right of the headline on desktop, the top
 * half on phones. Three or four: a "drawing sheet" of figures in the same area.
 */
export type Placement = "side" | "background";

export function layoutsFor(count: number, width: number, height: number, placement: Placement = "side"): Layout[] {
  const desktop = width >= 1024;
  const make = (cx: number, cy: number, fit: number): Layout => ({ cx, cy, scale: 1, px: Math.max(0.5, Math.min(1, fit / 560)), r: fit * 0.62, fit });
  if (placement === "background") {
    // Behind everything: one large drawing across the hero, or an even "wallpaper" of
    // figures (4 × 2 on desktop, 2 × 4 on phones).
    if (count <= 1) {
      return [desktop ? make(width * 0.55, height * 0.52, Math.min(width * 0.78, height * 1.05)) : make(width * 0.5, height * 0.45, Math.min(width * 1.15, height * 0.72))];
    }
    const cols = desktop ? 4 : 2;
    const rows = Math.ceil(count / cols);
    const fit = desktop ? Math.min(width / cols, height / rows) * 0.92 : Math.min(width / cols, height / rows) * 0.95;
    return Array.from({ length: count }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      // Rows stagger slightly (one left, one right), like a drafting sheet rather than
      // a table, while every figure stays inside the hero.
      const x = ((c + (desktop ? (r % 2 ? 0.62 : 0.38) : 0.5)) * width) / cols;
      return make(x, ((r + 0.5) * height) / rows, fit);
    });
  }
  if (count <= 1) {
    const fit = desktop ? Math.min(width * 0.5, height * 0.72) : Math.min(width * 0.92, height * 0.44);
    return [make(desktop ? width * 0.68 : width * 0.5, desktop ? height * 0.5 : height * 0.3, fit)];
  }
  // Cell centres as fractions of a region; the region is right of the headline on
  // desktop and the top of the hero on phones.
  const cells: [number, number][] =
    count === 3
      ? desktop
        ? [[0.24, 0.3], [0.74, 0.36], [0.48, 0.76]]
        : [[0.18, 0.5], [0.5, 0.5], [0.82, 0.5]]
      : [[0.26, 0.27], [0.75, 0.27], [0.26, 0.75], [0.75, 0.75]];
  const region = desktop
    ? { x: width * 0.46, y: height * 0.12, w: width * 0.48, h: height * 0.8 }
    : { x: 0, y: height * 0.08, w: width, h: height * 0.44 };
  const fit = desktop
    ? Math.min(region.w * (count === 3 ? 0.44 : 0.46), region.h * (count === 3 ? 0.44 : 0.43))
    : count === 3
      ? Math.min(width * 0.31, region.h * 0.62)
      : Math.min(width * 0.44, region.h * 0.44);
  return cells.slice(0, count).map(([u, v]) => make(region.x + u * region.w, region.y + v * region.h, fit));
}

/** "FIG. 01" under a sketch on a multi-figure sheet. */
export function drawFigureLabel(ctx: CanvasRenderingContext2D, layout: Layout, n: number, alpha: number) {
  const x = layout.cx - layout.r * 0.55;
  const y = layout.cy + layout.r * 0.92;
  ctx.save();
  ctx.font = `${Math.round(10 * Math.max(0.9, layout.px))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = `rgba(${MINT}, ${0.55 * alpha})`;
  ctx.strokeStyle = `rgba(${MINT}, ${0.35 * alpha})`;
  ctx.lineWidth = 0.8;
  const text = `FIG. ${String(n).padStart(2, "0")}`;
  ctx.fillText(text, x, y);
  const w = ctx.measureText(text).width;
  ctx.beginPath();
  ctx.moveTo(x, y + 5);
  ctx.lineTo(x + w + 26, y + 5);
  ctx.stroke();
  ctx.restore();
}
