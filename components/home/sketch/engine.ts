// A tiny 3D line engine for the home hero's mechanical blueprint sketches: shapes are
// built as 3D polylines, moved by an assembly timeline, then projected and stroked by
// render.ts in a hand-drawn style. No dependencies (three.js isn't part of the site).

export type V3 = [number, number, number];

export type Line = {
  pts: V3[];
  closed?: boolean;
  /** Secondary detail: drawn thinner and fainter. */
  detail?: boolean;
  /** Carries a flow (current, coolant, gas): animated aqua dashes while running. */
  flow?: boolean;
};

export type Xform = (p: V3) => V3;

export type Part = {
  lines: Line[];
  /** Offset from the assembled position when fully exploded. */
  explode?: V3;
  /** Assembly order (earlier parts arrive first; fractions allowed). */
  order?: number;
  /** Highlighted in aqua while the product runs. */
  moving?: boolean;
  /** Pose while running, from the run clock in seconds (spin, slide, crank…). */
  motion?: (run: number) => Xform;
  /** Lines rebuilt every frame from the run clock (rods, bubbles, prop discs). */
  dynamic?: (run: number) => Line[];
};

export type Annot =
  | { t: "center"; a: V3; b: V3 }
  | { t: "circle"; c: V3; r: number; axis: V3; dashed?: boolean }
  | { t: "dim"; a: V3; b: V3; off: number }
  | { t: "leader"; at: V3; dx: number; dy: number; w?: number }
  | { t: "notes"; dx: number; dy: number; rows: number; w: number };

export type Timing = { sketch: number; assemble: number; run: number; explode: number };

export type Model = {
  key: string;
  name: string;
  format: string;
  /** Exploded extent in model units; the sketch is scaled to fit this. */
  size: number;
  center: V3;
  yaw: number;
  pitch: number;
  /** Slow turntable rotation of the whole view, radians per second. */
  turntable?: number;
  timing?: Partial<Timing>;
  parts: Part[];
  annots: Annot[];
};

// ─── Vector maths ────────────────────────────────────────────────────────────

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export const X: V3 = [1, 0, 0];
export const Y: V3 = [0, 1, 0];
export const Z: V3 = [0, 0, 1];

/** Two unit vectors perpendicular to `axis` (and to each other). */
export function basis(axis: V3): [V3, V3] {
  const n = norm(axis);
  const ref: V3 = Math.abs(n[1]) < 0.9 ? Y : X;
  const u = norm(cross(ref, n));
  return [u, cross(n, u)];
}

/** Rotate p about the line through `origin` along `axis` (Rodrigues). */
export function rotateAbout(p: V3, origin: V3, axis: V3, ang: number): V3 {
  const k = norm(axis);
  const v = sub(p, origin);
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const r = add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
  return add(r, origin);
}

export const spin = (origin: V3, axis: V3, ang: number): Xform => (p) => rotateAbout(p, origin, axis, ang);
export const compose = (...fs: Xform[]): Xform => (p) => fs.reduce((q, f) => f(q), p);

// ─── Shape builders (all return 3D polylines) ────────────────────────────────

/** Points on a circle (or arc) around `axis`. */
export function arcPts(c: V3, axis: V3, r: number, n = 40, a0 = 0, a1 = Math.PI * 2): V3[] {
  const [u, v] = basis(axis);
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return add(c, add(mul(u, r * Math.cos(a)), mul(v, r * Math.sin(a))));
  });
}

export const ring = (c: V3, axis: V3, r: number, n = 40, detail = false): Line => ({ pts: arcPts(c, axis, r, n), closed: true, detail });

export const seg = (a: V3, b: V3, detail = false, flow = false): Line => ({ pts: [a, b], detail, flow });

export const poly = (pts: V3[], o: Partial<Line> = {}): Line => ({ pts, ...o });

/** Cylinder: both end circles plus `gens` generator lines along the side. */
export function cylinder(c: V3, axis: V3, r: number, h: number, gens = 6, n = 36): Line[] {
  const k = mul(norm(axis), h / 2);
  const a = sub(c, k);
  const b = add(c, k);
  const [u, v] = basis(axis);
  const out: Line[] = [ring(a, axis, r, n), ring(b, axis, r, n)];
  for (let i = 0; i < gens; i++) {
    const ang = (i / gens) * Math.PI * 2 + 0.3;
    const off = add(mul(u, r * Math.cos(ang)), mul(v, r * Math.sin(ang)));
    out.push(seg(add(a, off), add(b, off), true));
  }
  return out;
}

/** Hollow tube: outer cylinder plus the inner bore circles. */
export function tube(c: V3, axis: V3, rOut: number, rIn: number, h: number, gens = 4): Line[] {
  const k = mul(norm(axis), h / 2);
  return [...cylinder(c, axis, rOut, h, gens), ring(sub(c, k), axis, rIn, 28, true), ring(add(c, k), axis, rIn, 28, true)];
}

/** Spur gear (or internal ring gear when rTip < rRoot), tooth k centred at phase + k·2π/Z. */
export function gear(
  c: V3,
  axis: V3,
  o: { teeth: number; rRoot: number; rTip: number; thick: number; bore?: number; holes?: number; holeR?: number; holeAt?: number; rim?: number; phase?: number; connect?: number }
): Line[] {
  const { teeth, rRoot, rTip, thick, phase = 0 } = o;
  const T = (Math.PI * 2) / teeth;
  const [u, v] = basis(axis);
  const at = (r: number, a: number, z: number): V3 => add(add(c, mul(norm(axis), z)), add(mul(u, r * Math.cos(a)), mul(v, r * Math.sin(a))));
  const profile = (z: number) => {
    const pts: V3[] = [];
    for (let k = 0; k < teeth; k++) {
      const a = phase + k * T;
      pts.push(at(rRoot, a - 0.42 * T, z), at(rTip, a - 0.2 * T, z), at(rTip, a + 0.2 * T, z), at(rRoot, a + 0.42 * T, z));
    }
    return pts;
  };
  const out: Line[] = [
    { pts: profile(-thick / 2), closed: true },
    { pts: profile(thick / 2), closed: true },
  ];
  const step = o.connect ?? (teeth > 40 ? 3 : 1);
  for (let k = 0; k < teeth; k += step) {
    const a = phase + k * T;
    out.push(seg(at(rTip, a, -thick / 2), at(rTip, a, thick / 2), true));
  }
  const fz = mul(norm(axis), thick / 2);
  if (o.bore) out.push(ring(add(c, fz), axis, o.bore, 24), ring(sub(c, fz), axis, o.bore, 24, true));
  if (o.rim) out.push(ring(add(c, fz), axis, o.rim, 56), ring(sub(c, fz), axis, o.rim, 56, true));
  if (o.holes) {
    for (let i = 0; i < o.holes; i++) {
      const a = (i / o.holes) * Math.PI * 2 + phase;
      out.push(ring(at(o.holeAt ?? (rRoot + (o.bore ?? 0)) / 2, a, thick / 2), axis, o.holeR ?? 0.06, 14, true));
    }
  }
  return out;
}

/** Axis-aligned box as 12 edges. */
export function box(c: V3, [w, h, d]: V3, detail = false): Line[] {
  const [x0, x1, y0, y1, z0, z1] = [c[0] - w / 2, c[0] + w / 2, c[1] - h / 2, c[1] + h / 2, c[2] - d / 2, c[2] + d / 2];
  const top: V3[] = [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
  const bot: V3[] = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
  return [
    { pts: top, closed: true, detail },
    { pts: bot, closed: true, detail },
    ...top.map((p, i) => seg(p, bot[i], detail)),
  ];
}

/** Box between two points (an arm or beam), `w` wide and `h` tall. */
export function beam(a: V3, b: V3, w: number, h: number): Line[] {
  const dir = norm(sub(b, a));
  const side = mul(norm(cross(dir, Y)), w / 2);
  const up = mul(Y, h / 2);
  const corners = (p: V3): V3[] => [add(add(p, side), up), add(sub(p, side), up), sub(sub(p, side), up), sub(add(p, side), up)];
  const ca = corners(a);
  const cb = corners(b);
  return [{ pts: ca, closed: true }, { pts: cb, closed: true }, ...ca.map((p, i) => seg(p, cb[i], i > 1))];
}

/** Rectangle centred at c spanning u (width) and v (height). */
export function rect(c: V3, u: V3, v: V3, w: number, h: number, o: Partial<Line> = {}): Line {
  const hu = mul(norm(u), w / 2);
  const hv = mul(norm(v), h / 2);
  return { pts: [add(sub(c, hu), hv), add(add(c, hu), hv), sub(add(c, hu), hv), sub(sub(c, hu), hv)], closed: true, ...o };
}

/** Plate of thickness t along normal n, w × h in the (u, n×u) plane, with holes on the front face. */
export function plate(c: V3, n: V3, u: V3, w: number, h: number, t: number, holes: [number, number, number][] = []): Line[] {
  const nn = norm(n);
  const uu = norm(u);
  const vv = cross(nn, uu);
  const f = add(c, mul(nn, t / 2));
  const b = sub(c, mul(nn, t / 2));
  const front = rect(f, uu, vv, w, h);
  const back = rect(b, uu, vv, w, h, { detail: true });
  return [
    front,
    back,
    ...front.pts.map((p, i) => seg(p, back.pts[i], true)),
    ...holes.map(([du, dv, r]) => ring(add(f, add(mul(uu, du), mul(vv, dv))), nn, r, 18, true)),
  ];
}

/** Helix (screw thread or coil) along axis, centred at c. */
export function helix(c: V3, axis: V3, r: number, pitch: number, turns: number, perTurn = 20, phase = 0, o: Partial<Line> = {}): Line {
  const [u, v] = basis(axis);
  const k = norm(axis);
  const total = turns * perTurn;
  const len = pitch * turns;
  const pts = Array.from({ length: total + 1 }, (_, i) => {
    const a = phase + (i / perTurn) * Math.PI * 2;
    return add(add(c, mul(k, -len / 2 + (len * i) / total)), add(mul(u, r * Math.cos(a)), mul(v, r * Math.sin(a))));
  });
  return { pts, ...o };
}

/** Wire wound around a toroidal core. */
export function toroidCoil(c: V3, axis: V3, R: number, r: number, wraps: number, o: Partial<Line> = {}): Line {
  const [u, v] = basis(axis);
  const k = norm(axis);
  const n = wraps * 10;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n;
    const phi = s * Math.PI * 2;
    const th = s * wraps * Math.PI * 2;
    const rad = R + r * Math.cos(th);
    return add(c, add(add(mul(u, rad * Math.cos(phi)), mul(v, rad * Math.sin(phi))), mul(k, r * Math.sin(th))));
  });
  return { pts, closed: true, ...o };
}

/** Seeded pseudo-random numbers in [0, 1), so drawings are identical every visit. */
export function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
