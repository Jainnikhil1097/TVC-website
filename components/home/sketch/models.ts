// The eight mechanical blueprint sketches for the home hero, one per format. Generic
// drawings of the kinds of hardware the portfolio builds — no names or descriptions.

import {
  add,
  arcPts,
  beam,
  box,
  compose,
  cylinder,
  gear,
  helix,
  mul,
  norm,
  plate,
  poly,
  rect,
  ring,
  seg,
  spin,
  toroidCoil,
  tube,
  X,
  Y,
  Z,
  type Line,
  type Model,
  type Part,
  type V3,
} from "./engine";

const TAU = Math.PI * 2;
const O: V3 = [0, 0, 0];

// ─── 1. E-motor: axial exploded assembly ─────────────────────────────────────

function motor(): Model {
  const fins = Array.from({ length: 9 }, (_, i) => ring([-0.88 + i * 0.22, 0, 0], X, 0.97, 44, true));
  const coils: Line[] = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * TAU;
    const p = (x: number, r: number): V3 => [x, r * Math.cos(a), r * Math.sin(a)];
    return { pts: [p(-0.8, 0.64), p(0.8, 0.64), p(0.8, 0.77), p(-0.8, 0.77)], closed: true, detail: true };
  });
  const lams = Array.from({ length: 9 }, (_, i) => ring([-0.6 + i * 0.15, 0, 0], X, 0.55, 32, true));
  const magnets = Array.from({ length: 8 }, (_, k) => {
    const a = (k / 8) * TAU;
    return seg([-0.72, 0.56 * Math.cos(a), 0.56 * Math.sin(a)], [0.72, 0.56 * Math.cos(a), 0.56 * Math.sin(a)], true);
  });
  const bearing = (x: number): Line[] => [
    ...tube([x, 0, 0], X, 0.3, 0.12, 0.18, 0),
    ...Array.from({ length: 9 }, (_, k) => {
      const a = (k / 9) * TAU;
      return ring([x, 0.21 * Math.cos(a), 0.21 * Math.sin(a)], X, 0.045, 10, true);
    }),
  ];
  const cap = (x: number): Line[] => [
    ...cylinder([x, 0, 0], X, 0.86, 0.12, 4, 44),
    ring([x + Math.sign(x) * 0.06, 0, 0], X, 0.32, 28),
    ...Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * TAU + 0.5;
      return ring([x + Math.sign(x) * 0.06, 0.72 * Math.cos(a), 0.72 * Math.sin(a)], X, 0.05, 10, true);
    }),
  ];
  const rotorSpin = (run: number) => spin(O, X, run * 5);

  return {
    key: "motor",
    name: "E-motor",
    format: "Axial exploded assembly",
    size: 5.6,
    center: [-0.35, 0, 0],
    yaw: -0.62,
    pitch: 0.36,
    parts: [
      { order: 0, lines: [...cylinder(O, X, 0.85, 2.0, 8, 48), ...fins, ...box([0, -0.98, 0], [1.6, 0.14, 1.3], true), ...box([0.3, 0.95, 0], [0.5, 0.22, 0.45])] },
      { order: 1, lines: [ring([-0.85, 0, 0], X, 0.62, 40), ring([0.85, 0, 0], X, 0.62, 40), ...coils] },
      {
        order: 2,
        explode: [-1.7, 0, 0],
        moving: true,
        motion: rotorSpin,
        lines: [
          ...cylinder([-0.3, 0, 0], X, 0.12, 3.2, 4, 18),
          ...cylinder(O, X, 0.55, 1.5, 0, 40),
          ...lams,
          ...magnets,
          helix([1.1, 0, 0], X, 0.13, 0.045, 9, 16, 0, { detail: true }),
          seg([-1.6, 0.12, 0], [-1.25, 0.12, 0], true),
        ],
      },
      { order: 3, explode: [-2.4, 0, 0], lines: bearing(-1.05) },
      { order: 3, explode: [1.6, 0, 0], lines: bearing(1.05) },
      { order: 4, explode: [-3.0, 0, 0], lines: cap(-1.15) },
      { order: 4, explode: [2.2, 0, 0], lines: cap(1.15) },
    ],
    annots: [
      { t: "center", a: [-4.3, 0, 0], b: [3.6, 0, 0] },
      { t: "circle", c: O, r: 1.18, axis: X, dashed: true },
      { t: "dim", a: [-1.0, -1.1, 0.75], b: [1.0, -1.1, 0.75], off: 16 },
      { t: "leader", at: [0.1, 0.85, 0.2], dx: 70, dy: -80 },
      { t: "leader", at: [-0.6, -0.5, 0.6], dx: -80, dy: 70, w: 80 },
      { t: "notes", dx: 150, dy: 150, rows: 3, w: 110 },
      { t: "notes", dx: -330, dy: -170, rows: 2, w: 100 },
    ],
  };
}

// ─── 2. Battery pack: layer-stack drop ───────────────────────────────────────

function battery(): Model {
  const cells: Line[] = [];
  const cols = 6;
  const rows = 4;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = -1.25 + i * 0.5;
      const z = -0.75 + j * 0.5;
      cells.push(...cylinder([x, 0.65, z], Y, 0.19, 0.9, 2, 16), ring([x, 1.1, z], Y, 0.07, 10, true));
    }
  }
  const busbars = Array.from({ length: cols }, (_, i) => rect([-1.25 + i * 0.5, 1.13, 0], X, Z, 0.26, 1.72, { detail: true }));
  const serp: V3[] = [];
  for (let k = 0; k <= 6; k++) {
    const x = -1.2 + k * 0.4;
    const [z0, z1] = k % 2 ? [0.7, -0.7] : [-0.7, 0.7];
    serp.push([x, 1.3, z0], [x, 1.3, z1]);
  }
  const chips: Line[] = [...box([-0.35, 1.47, -0.2], [0.3, 0.05, 0.3], true), ...box([0.25, 1.47, -0.3], [0.2, 0.05, 0.2], true), ...box([0.5, 1.47, 0.05], [0.25, 0.08, 0.12])];
  const ribs = Array.from({ length: 6 }, (_, i) => seg([-1.25 + i * 0.5, 1.67, -0.95], [-1.25 + i * 0.5, 1.67, 0.95], true));

  return {
    key: "battery",
    name: "Battery pack",
    format: "Layer-stack drop",
    size: 4.9,
    center: [0, 1.35, 0],
    yaw: 0.62,
    pitch: 0.42,
    parts: [
      { order: 0, lines: [...box([0, 0, 0], [3.0, 0.35, 2.0]), rect([0, 0.175, 0], X, Z, 2.76, 1.76, { detail: true }), ...box([-1.6, -0.1, 0.9], [0.2, 0.06, 0.2], true), ...box([1.6, -0.1, -0.9], [0.2, 0.06, 0.2], true)] },
      { order: 1, explode: [0, 1.1, 0], lines: cells },
      { order: 2, explode: [0, 1.7, 0], lines: busbars },
      {
        order: 3,
        explode: [0, 2.3, 0],
        moving: true,
        lines: [
          ...plate([0, 1.26, 0], Y, X, 2.8, 1.8, 0.06),
          poly(serp, { flow: true }),
          ...cylinder([-1.45, 1.38, -0.7], Y, 0.06, 0.25, 2, 12),
          ...cylinder([1.45, 1.38, 0.7], Y, 0.06, 0.25, 2, 12),
        ],
      },
      {
        order: 4,
        explode: [0, 2.9, 0],
        lines: [
          ...plate([0, 1.43, -0.2], Y, X, 1.4, 0.8, 0.04),
          ...chips,
          poly([[-0.6, 1.46, 0.1], [-0.2, 1.46, 0.1], [-0.2, 1.46, -0.05], [0.4, 1.46, -0.05]], { detail: true, flow: true }),
        ],
      },
      { order: 5, explode: [0, 3.5, 0], lines: [...box([0, 1.61, 0], [3.0, 0.12, 2.0]), ...ribs, rect([1.0, 1.68, 0.5], X, Z, 0.5, 0.3, { detail: true })] },
    ],
    annots: [
      { t: "dim", a: [-1.5, -0.18, 1.0], b: [1.5, -0.18, 1.0], off: 16 },
      { t: "dim", a: [1.5, -0.18, 1.0], b: [1.5, 1.67, 1.0], off: -16 },
      { t: "circle", c: [-1.25, 1.1, 0.75], r: 0.32, axis: Y, dashed: true },
      { t: "leader", at: [-1.25, 1.1, -0.75], dx: -90, dy: -70 },
      { t: "leader", at: [0.5, 1.47, 0.05], dx: 90, dy: -60 },
      { t: "notes", dx: 160, dy: 140, rows: 3, w: 110 },
      { t: "notes", dx: -320, dy: -190, rows: 2, w: 100 },
    ],
  };
}

// ─── 3. Electrolyser stack: plates clamp together ────────────────────────────

function electrolyser(): Model {
  const parts: Part[] = [];
  const rodYZ: [number, number][] = [[0.95, 0.95], [0.95, -0.95], [-0.95, 0.95], [-0.95, -0.95]];
  const rods: Line[] = rodYZ.flatMap(([y, z]) => [
    ...cylinder([0, y, z], X, 0.05, 2.8, 2, 10),
    helix([1.27, y, z], X, 0.055, 0.04, 6, 10, 0, { detail: true }),
    helix([-1.27, y, z], X, 0.055, 0.04, 6, 10, 0, { detail: true }),
  ]);
  parts.push({ order: 0, lines: rods });

  const hex = (x: number, y: number, z: number): Line => ({ pts: arcPts([x, y, z], X, 0.1, 6).slice(0, 6), closed: true, detail: true });
  const endPlate = (x: number, side: number): Line[] => [
    ...plate([x, 0, 0], X, Z, 2.2, 2.2, 0.22, [
      ...rodYZ.map(([y, z]) => [z, y, 0.07] as [number, number, number]),
      [0.6, 0.75, 0.12],
      [-0.6, -0.75, 0.12],
    ]),
    ...rodYZ.map(([y, z]) => hex(x + side * 0.15, y, z)),
    ...cylinder([x + side * 0.28, 0.75, 0.6], X, 0.1, 0.3, 3, 14),
    ...cylinder([x + side * 0.28, -0.75, -0.6], X, 0.1, 0.3, 3, 14),
  ];
  const N = 8;
  const innerX = (i: number) => -0.7 + i * 0.2;
  const explodedX = (i: number) => -1.95 + i * 0.56;
  parts.push({ order: 1, explode: [-1.7, 0, 0], lines: endPlate(-0.95, -1) });
  for (let i = 0; i < N; i++) {
    const x = innerX(i);
    const bipolar = i % 2 === 0;
    const lines: Line[] = bipolar
      ? (() => {
          const field: V3[] = [];
          for (let k = 0; k <= 7; k++) {
            const z = -0.7 + k * 0.2;
            field.push([x + 0.03, k % 2 ? 0.7 : -0.7, z], [x + 0.03, k % 2 ? -0.7 : 0.7, z]);
          }
          return [...plate([x, 0, 0], X, Z, 1.9, 1.9, 0.05), poly(field, { detail: true })];
        })()
      : [...plate([x, 0, 0], X, Z, 1.7, 1.7, 0.02), rect([x + 0.012, 0, 0], Z, Y, 1.3, 1.3, { detail: true })];
    parts.push({ order: 1.6 + i * 0.4, explode: [explodedX(i) - x, 0, 0], lines });
  }
  parts.push({ order: 1.6 + N * 0.4, explode: [1.7, 0, 0], lines: endPlate(0.95, 1) });

  // Gas outlet with bubbles rising while it runs.
  parts.push({
    order: 1.6 + N * 0.4,
    explode: [1.7, 0, 0],
    moving: true,
    lines: [...cylinder([1.25, 1.55, 0.6], Y, 0.12, 0.9, 3, 16), poly([[1.23, 0.75, 0.6], [1.25, 1.1, 0.6]], { flow: true })],
    dynamic: (run) => {
      if (run <= 0) return [];
      return Array.from({ length: 6 }, (_, k) => {
        const s = (run * 0.45 + k / 6) % 1;
        return ring([1.25 + Math.sin(k * 2.1 + run) * 0.04, 1.12 + s * 0.85, 0.6], Z, 0.025 + (k % 3) * 0.012, 10);
      });
    },
  });

  return {
    key: "electrolyser",
    name: "Electrolyser stack",
    format: "Plates clamp together",
    size: 6.0,
    center: [0, 0.2, 0],
    yaw: -0.78,
    pitch: 0.32,
    parts,
    annots: [
      { t: "center", a: [-3.1, 0, 0], b: [3.1, 0, 0] },
      { t: "dim", a: [-0.95, -1.25, 1.1], b: [0.95, -1.25, 1.1], off: 16 },
      { t: "circle", c: [-1.06, 0.75, 0.6], r: 0.26, axis: X, dashed: true },
      { t: "leader", at: [-0.1, 0.6, 0.85], dx: 80, dy: -90 },
      { t: "leader", at: [1.25, 1.95, 0.6], dx: 70, dy: -40, w: 60 },
      { t: "notes", dx: -320, dy: 150, rows: 3, w: 120 },
      { t: "notes", dx: 150, dy: 160, rows: 2, w: 100 },
    ],
  };
}

// ─── 4. Agri drone: turntable assembly ───────────────────────────────────────

function drone(): Model {
  const dirs = Array.from({ length: 4 }, (_, k): V3 => [Math.cos(Math.PI / 4 + (k * Math.PI) / 2), 0, Math.sin(Math.PI / 4 + (k * Math.PI) / 2)]);
  const tip = (k: number) => mul(dirs[k], 1.75);
  const parts: Part[] = [
    {
      order: 0,
      lines: [...box([0, 0, 0], [0.9, 0.28, 0.9]), rect([0, 0.22, 0], X, Z, 0.6, 0.6, { detail: true }), ...[[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]].map(([x, z]) => seg([x, 0.22, z], [x * 1.5, 0.14, z * 1.5], true))],
    },
    { order: 1.5, explode: [0, -0.7, 0], lines: [-0.42, 0.42].flatMap((x) => [poly([[x, -0.14, -0.3], [x * 1.3, -0.62, -0.5], [x * 1.3, -0.62, 0.5], [x, -0.14, 0.3]]), seg([x * 1.3, -0.62, -0.75], [x * 1.3, -0.62, 0.75])]) },
    { order: 3, explode: [0, -1.3, 0], lines: [...cylinder([0, -0.45, 0], Y, 0.3, 0.42, 4, 28), ring([0, -0.66, 0], Y, 0.12, 16, true)] },
    { order: 3, explode: [0, 1.1, 0.6], lines: [...box([0, 0.24, 0.2], [0.55, 0.16, 0.35]), seg([-0.2, 0.33, 0.2], [0.2, 0.33, 0.2], true)] },
    { order: 3.4, explode: [0, 1.5, -0.3], lines: [...plate([0, 0.2, -0.22], Y, X, 0.36, 0.36, 0.03), ...box([0, 0.24, -0.22], [0.14, 0.04, 0.14], true)] },
  ];
  dirs.forEach((d, k) => {
    const p = tip(k);
    const hub: V3 = add(p, [0, 0.27, 0]);
    parts.push({ order: 1, explode: mul(d, 0.7), lines: beam(mul(d, 0.42), mul(d, 1.65), 0.1, 0.08) });
    parts.push({ order: 2, explode: add(mul(d, 0.9), [0, 0.8, 0]), lines: [...cylinder(add(p, [0, 0.1, 0]), Y, 0.15, 0.2, 4, 20), ring(add(p, [0, 0.22, 0]), Y, 0.05, 10, true)] });
    const blade = (sgn: number): Line => {
      const pts: V3[] = [];
      for (let i = 0; i <= 8; i++) pts.push(add(hub, [sgn * (0.04 + (0.58 * i) / 8), 0, 0.06 * (1 - (0.6 * i) / 8)]));
      for (let i = 8; i >= 0; i--) pts.push(add(hub, [sgn * (0.04 + (0.58 * i) / 8), 0, -0.04 * (1 - (0.6 * i) / 8)]));
      return { pts, closed: true };
    };
    const dirSign = k % 2 ? 1 : -1;
    parts.push({
      order: 4,
      explode: add(mul(d, 0.9), [0, 1.6, 0]),
      moving: true,
      lines: [blade(1), blade(-1), ring(hub, Y, 0.05, 10)],
      motion: (run) => spin(hub, Y, dirSign * run * 11),
      dynamic: (run) => (run > 0.6 ? [ring(hub, Y, 0.62, 36, true)] : []),
    });
  });

  return {
    key: "drone",
    name: "Agri drone",
    format: "Turntable assembly",
    size: 5.0,
    center: [0, 0.25, 0],
    yaw: 0.4,
    pitch: 0.5,
    turntable: 0.16,
    parts,
    annots: [
      { t: "dim", a: tip(0), b: tip(2), off: 18 },
      { t: "circle", c: add(tip(1), [0, 0.27, 0]), r: 0.7, axis: Y, dashed: true },
      { t: "leader", at: add(tip(3), [0.5, 0.27, 0]), dx: 80, dy: -70 },
      { t: "leader", at: [0, -0.6, 0.25], dx: -90, dy: 60 },
      { t: "notes", dx: 160, dy: 160, rows: 3, w: 110 },
      { t: "notes", dx: -330, dy: -190, rows: 2, w: 100 },
    ],
  };
}

// ─── 5. Wind-turbine planetary gearbox: gear-train mechanism ─────────────────

function gearbox(): Model {
  // Sun 18, planets 18, ring 54 teeth: ring fixed, carrier turns at sun/4.
  const m = 0.055;
  const Zs = 18;
  const Zp = 18;
  const Zr = 54;
  const rs = (m * Zs) / 2;
  const rp = (m * Zp) / 2;
  const rr = (m * Zr) / 2;
  const cd = rs + rp;
  const ws = 2.2; // sun, rad/s
  const sunAng = (run: number) => run * ws;
  const carrierAng = (run: number) => (run * ws * Zs) / (Zs + Zr);
  const planetAbs = (run: number) => carrierAng(run) - ((sunAng(run) - carrierAng(run)) * Zs) / Zp;

  const parts: Part[] = [];
  // Ring gear (fixed) with housing rim and bolt circle.
  parts.push({
    order: 0,
    lines: [
      ...gear(O, Z, { teeth: Zr, rRoot: rr + 1.25 * m, rTip: rr - m, thick: 0.34, connect: 3 }),
      ...cylinder(O, Z, 1.78, 0.34, 8, 64),
      ...Array.from({ length: 12 }, (_, k) => ring([1.66 * Math.cos((k / 12) * TAU), 1.66 * Math.sin((k / 12) * TAU), 0.17], Z, 0.05, 10, true)),
    ],
  });
  // Carrier with pins and output shaft (behind).
  const lobe: V3[] = [];
  for (let i = 0; i <= 90; i++) {
    const a = (i / 90) * TAU;
    const r = 0.62 + 0.5 * Math.pow(Math.max(0, Math.cos(1.5 * a)), 3);
    lobe.push([r * Math.cos(a), r * Math.sin(a), -0.32]);
  }
  parts.push({
    order: 1,
    explode: [0, 0, -1.4],
    moving: true,
    motion: (run) => spin(O, Z, carrierAng(run)),
    lines: [
      { pts: lobe, closed: true },
      { pts: lobe.map(([x, y]) => [x, y, -0.44] as V3), closed: true, detail: true },
      ...[0, 1, 2].flatMap((k) => cylinder([cd * Math.cos((k * TAU) / 3), cd * Math.sin((k * TAU) / 3), -0.1], Z, 0.11, 0.5, 2, 14)),
      ...cylinder([0, 0, -1.08], Z, 0.2, 1.3, 4, 20),
      seg([0.2, 0, -1.6], [0.2, 0, -1.0], true),
    ],
  });
  // Planets
  [0, 1, 2].forEach((k) => {
    const phi = (k * TAU) / 3;
    const pc: V3 = [cd * Math.cos(phi), cd * Math.sin(phi), 0];
    parts.push({
      order: 2,
      explode: add([0, 0, 1.0], mul(norm(pc), 0.5)),
      motion: (run) => compose(spin(pc, Z, planetAbs(run) - carrierAng(run)), spin(O, Z, carrierAng(run))),
      lines: gear(pc, Z, { teeth: Zp, rRoot: rp - 1.25 * m, rTip: rp + m, thick: 0.3, bore: 0.11, holes: 4, holeR: 0.06, holeAt: 0.27, phase: phi + Math.PI - Math.PI / Zp }),
    });
  });
  // Sun gear on the input shaft with flange.
  parts.push({
    order: 3,
    explode: [0, 0, 2.0],
    moving: true,
    motion: (run) => spin(O, Z, sunAng(run)),
    lines: [
      ...gear(O, Z, { teeth: Zs, rRoot: rs - 1.25 * m, rTip: rs + m, thick: 0.36, bore: 0.15 }),
      ...cylinder([0, 0, 0.85], Z, 0.15, 1.7, 4, 18),
      helix([0, 0, 1.5], Z, 0.16, 0.05, 7, 14, 0, { detail: true }),
      ...cylinder([0, 0, 1.05], Z, 0.7, 0.1, 4, 44),
      ...Array.from({ length: 8 }, (_, k) => ring([0.55 * Math.cos((k / 8) * TAU), 0.55 * Math.sin((k / 8) * TAU), 1.1], Z, 0.04, 10, true)),
    ],
  });

  return {
    key: "gearbox",
    name: "Wind-turbine gearbox",
    format: "Gear-train mechanism",
    size: 5.2,
    center: [0, 0, 0.5],
    yaw: 0.62,
    pitch: 0.42,
    timing: { run: 8 },
    parts,
    annots: [
      { t: "center", a: [0, 0, -2.2], b: [0, 0, 3.6] },
      { t: "circle", c: O, r: rr, axis: Z, dashed: true },
      { t: "circle", c: O, r: cd, axis: Z, dashed: true },
      { t: "circle", c: O, r: 2.05, axis: Z },
      { t: "dim", a: [-1.78, -1.9, 0.17], b: [1.78, -1.9, 0.17], off: 14 },
      { t: "leader", at: [cd, 0, 0.15], dx: 90, dy: -90 },
      { t: "leader", at: [0, 0, 1.6], dx: -80, dy: -70 },
      { t: "notes", dx: 170, dy: 130, rows: 4, w: 120 },
      { t: "notes", dx: -340, dy: 170, rows: 3, w: 110 },
    ],
  };
}

// ─── 6. Power converter: cutaway section ─────────────────────────────────────

function converter(): Model {
  const fins = Array.from({ length: 12 }, (_, k) => rect([0, -0.32, -0.8 + k * 0.145], X, Y, 2.5, 0.45, { detail: true }));
  const traces: Line[] = [
    poly([[-1.1, 0.1, 0.6], [-0.5, 0.1, 0.6], [-0.5, 0.1, 0.2]], { flow: true }),
    poly([[-0.22, 0.1, 0.2], [0.35, 0.1, 0.2], [0.35, 0.1, 0.45]], { flow: true }),
    poly([[0.6, 0.1, 0.45], [0.8, 0.1, 0.45], [0.8, 0.1, -0.4], [1.1, 0.1, -0.4]], { flow: true }),
    poly([[-0.7, 0.1, -0.45], [-0.7, 0.1, -0.1], [0.6, 0.1, -0.1]], { detail: true, flow: true }),
  ];
  const caps = [[0.6, -0.4], [0.95, -0.4], [0.6, 0.0], [0.95, 0.0]].flatMap(([x, z]) => [
    ...cylinder([x, 0.36, z], Y, 0.13, 0.5, 2, 16),
    seg([x - 0.08, 0.61, z], [x + 0.08, 0.61, z], true),
    seg([x, 0.61, z - 0.08], [x, 0.61, z + 0.08], true),
  ]);
  const hatch = (a: V3, b: V3, n: number, d: V3): Line[] => Array.from({ length: n }, (_, i) => {
    const p = add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], i / n));
    return seg(p, add(p, d), true);
  });
  return {
    key: "converter",
    name: "Power converter",
    format: "Cutaway section",
    size: 5.0,
    center: [0, 0.45, 0],
    yaw: -0.55,
    pitch: 0.5,
    parts: [
      { order: 0, explode: [0, -1.0, 0], lines: [...box([0, -0.05, 0], [2.6, 0.1, 1.8]), ...fins] },
      { order: 1, lines: [...box([0, 0.06, 0], [2.4, 0.06, 1.6]), ...traces, ...[[-1.1, -0.7], [1.1, -0.7], [-1.1, 0.7], [1.1, 0.7]].map(([x, z]) => ring([x, 0.1, z], Y, 0.04, 10, true))] },
      { order: 2, explode: [0, 1.3, 0], moving: true, lines: [toroidCoil([-0.5, 0.33, 0.2], Y, 0.28, 0.1, 22), ring([-0.5, 0.43, 0.2], Y, 0.18, 24, true), toroidCoil([-0.5, 0.33, -0.45], Y, 0.2, 0.08, 16, { detail: true })] },
      { order: 3, explode: [0, 1.7, 0], lines: caps },
      { order: 3.3, explode: [0, 2.0, 0], lines: [...box([0.35, 0.33, 0.48], [0.5, 0.45, 0.32]), helix([0.35, 0.33, 0.48], Y, 0.12, 0.04, 8, 12, 0, { detail: true })] },
      { order: 3.6, explode: [0, 1.5, 0], lines: [...box([-0.75, 0.13, -0.42], [0.34, 0.06, 0.34]), ...Array.from({ length: 6 }, (_, i) => seg([-0.88 + i * 0.05, 0.11, -0.59], [-0.88 + i * 0.05, 0.09, -0.65], true))] },
      {
        order: 4.5,
        explode: [0, 0, -1.6],
        lines: [
          rect([0, 0.08, -0.95], X, Y, 2.8, 1.4),
          poly([[-1.4, 0.78, -0.95], [-1.4, 0.78, 0], [1.4, 0.78, 0], [1.4, 0.78, -0.95]]),
          poly([[-1.4, -0.62, -0.95], [-1.4, -0.62, 0]]),
          poly([[1.4, -0.62, -0.95], [1.4, -0.62, 0]]),
          seg([-1.4, -0.62, 0], [-1.4, 0.78, 0]),
          seg([1.4, -0.62, 0], [1.4, 0.78, 0]),
          // Section hatching on the cut faces
          ...hatch([-1.4, 0.78, 0], [1.4, 0.78, 0], 28, [0.07, -0.08, 0]),
          ...hatch([1.4, -0.62, 0], [1.4, 0.78, 0], 14, [-0.08, 0.07, 0]),
          ...hatch([-1.4, -0.62, 0], [-1.4, 0.78, 0], 14, [0.08, 0.07, 0]),
        ],
      },
    ],
    annots: [
      { t: "dim", a: [-1.4, -0.75, 0.2], b: [1.4, -0.75, 0.2], off: 16 },
      { t: "circle", c: [-0.5, 0.33, 0.2], r: 0.48, axis: Y, dashed: true },
      { t: "leader", at: [-0.5, 0.45, 0.45], dx: -90, dy: -80 },
      { t: "leader", at: [0.95, 0.61, 0], dx: 80, dy: -70 },
      { t: "leader", at: [1.0, -0.5, 0.8], dx: 80, dy: 50, w: 60 },
      { t: "notes", dx: -320, dy: 160, rows: 3, w: 120 },
      { t: "notes", dx: 170, dy: -200, rows: 2, w: 100 },
    ],
  };
}

// ─── 7. Heat-recovery compressor: kinematic mechanism ────────────────────────

function compressor(): Model {
  const r = 0.32; // crank throw
  const L = 1.05; // rod length
  const w = 3.2; // rad/s
  const cyl = [
    { z: -0.5, off: 0 },
    { z: 0.5, off: Math.PI },
  ];
  const pin = (a: number, z: number): V3 => [r * Math.sin(a), r * Math.cos(a), z];
  const pistonY = (a: number) => r * Math.cos(a) + Math.sqrt(L * L - (r * Math.sin(a)) ** 2);

  const web = (z: number, a: number): Line => {
    const pts: V3[] = [];
    const c = pin(a, z);
    for (let i = 0; i <= 18; i++) {
      const t = a + Math.PI / 2 + (i / 18) * Math.PI;
      pts.push([0.24 * Math.sin(t), 0.24 * Math.cos(t), z]);
    }
    for (let i = 0; i <= 18; i++) {
      const t = a - Math.PI / 2 + (i / 18) * Math.PI;
      pts.push([c[0] + 0.17 * Math.sin(t), c[1] + 0.17 * Math.cos(t), z]);
    }
    return { pts, closed: true };
  };
  const crankLines: Line[] = [
    ...[-1.0, 0, 1.0].flatMap((z) => cylinder([0, 0, z], Z, 0.12, 0.26, 3, 16)),
    ...cyl.flatMap(({ z, off }) => [web(z - 0.16, off), web(z + 0.16, off), ...cylinder(pin(off, z), Z, 0.1, 0.32, 2, 14)]),
  ];
  const crankAng = (run: number) => run * w;

  const rodLines = (run: number): Line[] =>
    cyl.flatMap(({ z, off }) => {
      const a = crankAng(run) + off;
      const p = pin(a, z);
      const top: V3 = [0, pistonY(a), z];
      const dir = norm([top[0] - p[0], top[1] - p[1], 0]);
      const n: V3 = [-dir[1] * 0.05, dir[0] * 0.05, 0];
      return [seg(add(p, n), add(top, n)), seg([p[0] - n[0], p[1] - n[1], z], [top[0] - n[0], top[1] - n[1], z]), ring(p, Z, 0.14, 16), ring(top, Z, 0.07, 12)];
    });
  const pistonLines = (run: number): Line[] =>
    cyl.flatMap(({ z, off }) => {
      const y = pistonY(crankAng(run) + off);
      return [...cylinder([0, y + 0.14, z], Y, 0.29, 0.4, 4, 24), ring([0, y + 0.26, z], Y, 0.29, 24, true), ring([0, y + 0.22, z], Y, 0.29, 24, true)];
    });

  const coil = helix([1.2, 0.85, 0], Y, 0.34, 0.15, 9, 18, 0, { flow: true });

  return {
    key: "compressor",
    name: "Heat-recovery compressor",
    format: "Kinematic mechanism",
    size: 5.0,
    center: [0.25, 0.7, 0],
    yaw: 0.78,
    pitch: 0.24,
    parts: [
      { order: 0, lines: box([0, 0, 0], [1.0, 0.9, 2.4], true) },
      { order: 1, explode: [0, -1.3, 0], moving: true, motion: (run) => spin(O, Z, -crankAng(run)), lines: crankLines },
      { order: 1.6, explode: [0, -0.6, 0], moving: true, lines: [], dynamic: rodLines },
      { order: 2.2, explode: [0, 1.4, 0], moving: true, lines: [], dynamic: pistonLines },
      { order: 2.8, explode: [0, 2.2, 0], lines: [...cyl.flatMap(({ z }) => tube([0, 1.28, z], Y, 0.34, 0.3, 1.05, 4)), ...box([0, 1.88, 0], [0.9, 0.16, 1.9])] },
      { order: 3.2, explode: [0, 0, 1.6], moving: true, motion: (run) => spin(O, Z, -crankAng(run)), lines: [...cylinder([0, 0, 1.35], Z, 0.85, 0.12, 0, 48), ring([0, 0, 1.4], Z, 0.7, 40, true), ring([0, 0, 1.4], Z, 0.18, 18), ...Array.from({ length: 6 }, (_, k) => seg([0.18 * Math.cos((k / 6) * TAU), 0.18 * Math.sin((k / 6) * TAU), 1.4], [0.7 * Math.cos((k / 6) * TAU), 0.7 * Math.sin((k / 6) * TAU), 1.4], true))] },
      { order: 4, explode: [1.8, 0, 0], moving: true, lines: [coil, poly([[0.45, 1.92, 0.5], [1.2, 1.92, 0.5], [1.2, 1.55, 0.3]], { flow: true }), poly([[1.2, 0.18, 0.3], [1.2, -0.1, 0.3], [1.7, -0.1, 0.3]], { flow: true })] },
    ],
    annots: [
      { t: "center", a: [0, 0, -1.9], b: [0, 0, 2.0] },
      { t: "center", a: [0, -0.6, -0.5], b: [0, 2.4, -0.5] },
      { t: "circle", c: [0, 0, -0.5], r: r, axis: Z, dashed: true },
      { t: "dim", a: [-0.45, L - r, -0.5], b: [-0.45, L + r, -0.5], off: 14 },
      { t: "leader", at: [1.54, 1.2, 0], dx: 80, dy: -70 },
      { t: "leader", at: [0, 0.85, 1.35], dx: -90, dy: 70 },
      { t: "notes", dx: 170, dy: 150, rows: 3, w: 110 },
      { t: "notes", dx: -330, dy: -180, rows: 2, w: 100 },
    ],
  };
}

// ─── 8. sCO₂ radial turbine: construction-line sketch ────────────────────────

function turbine(): Model {
  const blades = 13;
  const bladeLines: Line[] = [];
  for (let b = 0; b < blades; b++) {
    const a0 = (b / blades) * TAU;
    const shroud: V3[] = [];
    const hub: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const s = i / 12;
      const sweep = a0 - 0.9 * s * s;
      const rS = 1.0 - 0.58 * s;
      const yS = 0.18 + 0.52 * Math.pow(s, 0.8);
      const rH = 1.0 - 0.73 * Math.pow(s, 0.7);
      const yH = 0.02 + 0.68 * s * s;
      shroud.push([rS * Math.cos(sweep), yS, rS * Math.sin(sweep)]);
      hub.push([rH * Math.cos(sweep), yH, rH * Math.sin(sweep)]);
    }
    bladeLines.push({ pts: [...shroud, ...hub.reverse()], closed: true });
  }
  const hubRings = [0, 0.18, 0.36, 0.54, 0.7].map((y) => ring([0, y, 0], Y, 0.27 + 0.73 * Math.pow(1 - y / 0.7, 1.8), 40, true));
  const volute = (y: number): Line => ({
    pts: Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * TAU;
      const rr = 1.25 + 0.32 * (i / 72);
      return [rr * Math.cos(a), y, rr * Math.sin(a)] as V3;
    }),
  });
  const vSpokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * TAU;
    const rr = 1.25 + 0.32 * (i / 12);
    return seg([rr * Math.cos(a), 0.08, rr * Math.sin(a)], [rr * Math.cos(a), 0.46, rr * Math.sin(a)], true);
  });
  const inflow: V3[] = Array.from({ length: 49 }, (_, i) => {
    const a = TAU - (i / 48) * TAU * 0.85;
    const rr = 1.55 - 0.45 * (i / 48);
    return [rr * Math.cos(a), 0.27, rr * Math.sin(a)];
  });
  const rotor = (run: number) => spin(O, Y, -run * 3);

  return {
    key: "turbine",
    name: "sCO₂ turbine",
    format: "Construction-line sketch",
    size: 4.4,
    center: [0, 0.15, 0],
    yaw: 0.4,
    pitch: 0.62,
    timing: { sketch: 5.5, assemble: 2.6 },
    parts: [
      { order: 0, explode: [0, -1.1, 0], lines: [...cylinder([0, -0.7, 0], Y, 0.14, 1.4, 4, 18), helix([0, -1.2, 0], Y, 0.15, 0.05, 7, 14, 0, { detail: true }), ...[-0.3, -0.38, -0.46].map((y) => ring([0, y, 0], Y, 0.22, 20, true))] },
      { order: 1, moving: true, motion: rotor, lines: [ring([0, 0, 0], Y, 1.0, 56), ring([0, -0.08, 0], Y, 1.0, 56, true), ring([0, 0, 0], Y, 0.25, 24)] },
      { order: 1.6, moving: true, motion: rotor, lines: hubRings },
      { order: 2.2, moving: true, motion: rotor, lines: bladeLines },
      {
        order: 3,
        explode: [0, 0.9, 0],
        lines: [volute(0.08), volute(0.46), ...vSpokes, ...cylinder([0, 1.1, 0], Y, 0.45, 0.8, 6, 36), ...cylinder([1.57, 0.27, -0.45], X, 0.2, 0.9, 4, 20), poly(inflow, { flow: true, detail: true }), poly([[0, 0.72, 0], [0, 1.6, 0]], { flow: true, detail: true })],
      },
    ],
    annots: [
      { t: "center", a: [-2.1, 0, 0], b: [2.1, 0, 0] },
      { t: "center", a: [0, 0, -2.1], b: [0, 0, 2.1] },
      { t: "center", a: [0, -1.6, 0], b: [0, 1.9, 0] },
      { t: "circle", c: O, r: 0.42, axis: Y, dashed: true },
      { t: "circle", c: O, r: 1.0, axis: Y, dashed: true },
      { t: "circle", c: O, r: 1.75, axis: Y },
      { t: "dim", a: [-1.0, 0, 0], b: [1.0, 0, 0], off: 22 },
      { t: "leader", at: [0.7, 0.4, 0.3], dx: 90, dy: -90 },
      { t: "notes", dx: 170, dy: 140, rows: 4, w: 120 },
      { t: "notes", dx: -340, dy: -190, rows: 3, w: 110 },
    ],
  };
}

export const MODELS: Model[] = [motor(), battery(), electrolyser(), drone(), gearbox(), converter(), compressor(), turbine()];
export const modelByKey = (key: string) => MODELS.find((m) => m.key === key) ?? MODELS[0];

