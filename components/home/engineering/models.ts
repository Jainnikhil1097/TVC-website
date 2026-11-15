import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ModelKey } from "./registry";

/*
 * The hardware drawn in the home hero, one model per portfolio company. Each model
 * is a list of parts: a geometry (built once, lazily), where the part sits when
 * assembled, how far it travels when the model explodes, and an optional label.
 * Units: a model is about 2–4.5 units across, centred on the origin. These are
 * stylised engineering drawings, not CAD of the companies' actual products.
 */

export type Vec3 = [number, number, number];

export type Part = {
  geometry: () => THREE.BufferGeometry;
  /** Assembled position. */
  at?: Vec3;
  /** Travel when fully exploded. */
  explode: Vec3;
  label?: string;
  /** Label anchor, relative to the part's own position, and which way the leader goes. */
  labelAt?: Vec3;
  labelDir?: Vec3;
  /** Draw as a faint translucent volume (e.g. coolant). */
  ghost?: boolean;
};

export type Model = {
  key: ModelKey;
  parts: Part[];
  /** Exploded extents [width, height], to frame the camera. */
  fit: [number, number];
  /** Base tilt toward the viewer (radians) and turn. */
  tilt: number;
  turn: number;
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────
type G = THREE.BufferGeometry;
const merge = (...geos: G[]) => mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)))!;
/** Rotate (XYZ, radians) then move a geometry, in place. */
function place(g: G, pos: Vec3 = [0, 0, 0], rot: Vec3 = [0, 0, 0]) {
  if (rot[0]) g.rotateX(rot[0]);
  if (rot[1]) g.rotateY(rot[1]);
  if (rot[2]) g.rotateZ(rot[2]);
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}
const box = (w: number, h: number, d: number, pos?: Vec3, rot?: Vec3) => place(new THREE.BoxGeometry(w, h, d), pos, rot);
/** Cylinder along X (radial segments high enough that only the rims draw as edges). */
const cylX = (r: number, len: number, pos?: Vec3, seg = 40, open = false) =>
  place(new THREE.CylinderGeometry(r, r, len, seg, 1, open), pos, [0, 0, Math.PI / 2]);
const cylY = (r: number, len: number, pos?: Vec3, seg = 32) => place(new THREE.CylinderGeometry(r, r, len, seg), pos);
const ring = (count: number, make: (angle: number) => G) =>
  merge(...Array.from({ length: count }, (_, i) => make((i / count) * Math.PI * 2)));

// ─── 1. Electric motor (axis along X) ─────────────────────────────────────────
const motor: Model = {
  key: "motor",
  fit: [4.6, 3.0],
  tilt: 0.42,
  turn: -0.55,
  parts: [
    {
      label: "Housing · cooling fins",
      explode: [0, 0, 0],
      labelAt: [0, 0.66, 0.2],
      labelDir: [0.2, 1, 0],
      geometry: () =>
        merge(
          cylX(0.62, 1.0, [0, 0, 0], 56, true),
          ring(18, (a) => box(0.98, 0.09, 0.025, [0, Math.cos(a) * 0.66, Math.sin(a) * 0.66], [a, 0, 0]))
        ),
    },
    {
      label: "Stator · magnet-free",
      explode: [-1.05, 0, 0],
      labelAt: [0, -0.5, 0.2],
      labelDir: [-0.4, -1, 0],
      geometry: () =>
        merge(
          cylX(0.57, 0.72, [0, 0, 0], 56, true),
          cylX(0.47, 0.72, [0, 0, 0], 56, true),
          ring(12, (a) => box(0.72, 0.12, 0.07, [0, Math.cos(a) * 0.42, Math.sin(a) * 0.42], [a, 0, 0])),
          ring(12, (a) => box(0.6, 0.06, 0.11, [0, Math.cos(a) * 0.37, Math.sin(a) * 0.37], [a, 0, 0]))
        ),
    },
    {
      label: "Rotor",
      explode: [1.0, 0, 0],
      labelAt: [0, 0.38, 0],
      labelDir: [0.3, 1, 0],
      geometry: () =>
        merge(
          cylX(0.33, 0.66),
          ring(8, (a) => box(0.66, 0.02, 0.08, [0, Math.cos(a) * 0.335, Math.sin(a) * 0.335], [a, 0, 0]))
        ),
    },
    {
      label: "Output shaft",
      explode: [1.85, 0, 0],
      labelAt: [0.6, 0.06, 0],
      labelDir: [-0.1, 1, 0],
      geometry: () => merge(cylX(0.055, 1.7, [0.15, 0, 0], 24), cylX(0.09, 0.08, [0.55, 0, 0], 24)),
    },
    {
      label: "End cap · bearing",
      explode: [-1.75, 0, 0],
      at: [-0.53, 0, 0],
      labelAt: [0, 0.64, 0],
      labelDir: [0.25, 1, 0],
      geometry: () =>
        merge(
          cylX(0.64, 0.06),
          place(new THREE.TorusGeometry(0.12, 0.035, 10, 32), [-0.04, 0, 0], [0, Math.PI / 2, 0]),
          ring(4, (a) => cylX(0.03, 0.1, [-0.03, Math.cos(a + 0.78) * 0.5, Math.sin(a + 0.78) * 0.5], 12))
        ),
    },
    {
      label: "Motor controller",
      explode: [0, 0.85, 0],
      at: [0, 0.86, 0],
      labelAt: [0.4, 0.3, 0],
      labelDir: [1, 0.5, 0],
      geometry: () =>
        merge(
          box(0.84, 0.26, 0.52),
          ...Array.from({ length: 9 }, (_, i) => box(0.8, 0.12, 0.018, [0, 0.19, -0.22 + i * 0.055])),
          cylY(0.045, 0.12, [-0.3, -0.18, 0.15], 16),
          cylY(0.045, 0.12, [-0.3, -0.18, -0.15], 16)
        ),
    },
  ],
};

// ─── 2. Immersion-cooled battery pack (layers along Y) ───────────────────────
const cells = (cols: number, rows: number, x0: number) =>
  merge(
    ...Array.from({ length: cols * rows }, (_, i) =>
      cylY(0.065, 0.36, [x0 + (i % cols) * 0.15, 0, -0.45 + Math.floor(i / cols) * 0.15], 20)
    )
  );
const battery: Model = {
  key: "battery",
  fit: [3.8, 5.0],
  tilt: 0.55,
  turn: -0.6,
  parts: [
    {
      label: "Enclosure tray",
      explode: [0, -0.75, 0],
      at: [0, -0.25, 0],
      labelAt: [-1.03, -0.1, 0.5],
      labelDir: [-1, -0.5, 0],
      geometry: () =>
        merge(
          box(2.1, 0.05, 1.4, [0, -0.2, 0]),
          box(2.1, 0.42, 0.04, [0, 0, 0.68]),
          box(2.1, 0.42, 0.04, [0, 0, -0.68]),
          box(0.04, 0.42, 1.4, [1.03, 0, 0]),
          box(0.04, 0.42, 1.4, [-1.03, 0, 0])
        ),
    },
    {
      label: "Dielectric coolant",
      ghost: true,
      explode: [0, -0.75, 0],
      at: [0, -0.27, 0],
      labelAt: [-1.0, 0.1, 0.5],
      labelDir: [-1, -0.3, 0],
      geometry: () => box(2.0, 0.34, 1.3),
    },
    {
      label: "Cell modules",
      explode: [0, 0.05, 0],
      labelAt: [-0.85, 0.2, 0],
      labelDir: [-1, 0.6, 0],
      geometry: () => merge(cells(6, 7, -0.92), cells(6, 7, 0.17)),
    },
    {
      label: "Busbars",
      explode: [0, 0.55, 0],
      at: [0, 0.2, 0],
      labelAt: [0.9, 0, 0],
      labelDir: [1, 0.5, 0],
      geometry: () =>
        merge(
          ...Array.from({ length: 7 }, (_, i) => box(0.86, 0.02, 0.05, [-0.54, 0, -0.45 + i * 0.15])),
          ...Array.from({ length: 7 }, (_, i) => box(0.86, 0.02, 0.05, [0.55, 0, -0.45 + i * 0.15]))
        ),
    },
    {
      label: "BMS · thermal management",
      explode: [0, 1.0, 0],
      at: [0, 0.3, 0],
      labelAt: [0.6, 0.05, 0.2],
      labelDir: [1, 0.6, 0],
      geometry: () =>
        merge(
          box(1.3, 0.03, 0.42),
          ...Array.from({ length: 6 }, (_, i) => box(0.12, 0.04, 0.1, [-0.45 + i * 0.18, 0.03, 0.05])),
          box(0.2, 0.06, 0.12, [0.52, 0.04, -0.12])
        ),
    },
    {
      label: "Lid",
      explode: [0, 1.55, 0],
      at: [0, 0.34, 0],
      labelAt: [-0.9, 0.05, 0],
      labelDir: [-1, 0.7, 0],
      geometry: () =>
        merge(
          box(2.14, 0.05, 1.44),
          ...Array.from({ length: 3 }, (_, i) => box(2.0, 0.04, 0.08, [0, 0.045, -0.4 + i * 0.4]))
        ),
    },
  ],
};

// ─── 3. AEM electrolyser stack (axis along X) ─────────────────────────────────
const PLATES = 9;
const plateParts: Part[] = Array.from({ length: PLATES * 2 - 1 }, (_, i) => {
  const x = -0.56 + i * (1.12 / (PLATES * 2 - 2));
  const membrane = i % 2 === 1;
  const mid = i === PLATES - 1 || i === PLATES; // label one of each, near the middle
  return {
    at: [x, 0, 0] as Vec3,
    explode: [x * 1.55, 0, 0] as Vec3,
    label: mid ? (membrane ? "AEM membrane" : "Bipolar plate") : undefined,
    labelAt: (membrane ? [0, -0.46, 0.3] : [0, 0.52, 0.2]) as Vec3,
    labelDir: (membrane ? [0.2, -1, 0] : [0.2, 1, 0]) as Vec3,
    geometry: () =>
      membrane
        ? box(0.012, 0.86, 0.86)
        : merge(
            box(0.035, 1.0, 1.0),
            ...Array.from({ length: 5 }, (_, k) => box(0.045, 0.7, 0.03, [0, 0, -0.3 + k * 0.15]))
          ),
  };
});
const electrolyser: Model = {
  key: "electrolyser",
  fit: [4.4, 2.8],
  tilt: 0.38,
  turn: -0.7,
  parts: [
    ...([-1, 1] as const).map(
      (s): Part => ({
        at: [s * 0.74, 0, 0],
        explode: [s * 1.25, 0, 0],
        label: s < 0 ? "End plate · water in" : "H₂ outlet",
        labelAt: s < 0 ? [0, 0.66, 0] : [0.1, 0.42, 0.42],
        labelDir: s < 0 ? [-0.5, 1, 0] : [0.7, 1, 0],
        geometry: () =>
          merge(
            box(0.14, 1.24, 1.24),
            ...[-0.5, 0.5].flatMap((y) => [-0.5, 0.5].map((z) => cylX(0.06, 0.18, [0, y, z], 16))),
            cylX(0.07, 0.32, [s * 0.22, 0.32, 0.32], 20),
            cylX(0.07, 0.32, [s * 0.22, -0.32, -0.32], 20)
          ),
      })
    ),
    ...plateParts,
    {
      label: "Tie rods",
      at: [0, 0, 0],
      explode: [0, 0.95, 0],
      labelAt: [0.3, 0.5, -0.5],
      labelDir: [0.6, 1, 0],
      geometry: () => merge(...[-0.5, 0.5].flatMap((y) => [-0.5, 0.5].map((z) => cylX(0.028, 1.9, [0, y, z], 12)))),
    },
  ],
};

// ─── 4. Autonomous drone (Y up) ───────────────────────────────────────────────
const ARM = 0.72;
const corners = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;
const drone: Model = {
  key: "drone",
  fit: [3.4, 3.2],
  tilt: 0.5,
  turn: -0.5,
  parts: [
    {
      label: "Airframe",
      explode: [0, 0, 0],
      labelAt: [0.2, 0.1, 0.35],
      labelDir: [1, -0.3, 0],
      geometry: () =>
        merge(
          box(0.7, 0.16, 0.48),
          box(0.5, 0.06, 0.36, [0, 0.11, 0]),
          ...corners.map(([sx, sz]) => box(0.92, 0.05, 0.07, [(sx * ARM) / 2, 0, (sz * ARM) / 2], [0, sx * sz > 0 ? -Math.PI / 4 : Math.PI / 4, 0]))
        ),
    },
    {
      label: "Brushless motors",
      explode: [0, 0.42, 0],
      labelAt: [ARM, 0.1, ARM],
      labelDir: [1, 0.2, 0],
      geometry: () => merge(...corners.map(([sx, sz]) => cylY(0.075, 0.1, [sx * ARM, 0.08, sz * ARM], 24))),
    },
    {
      label: "Propellers",
      explode: [0, 0.85, 0],
      labelAt: [-ARM - 0.25, 0.16, ARM],
      labelDir: [-1, 0.6, 0],
      geometry: () =>
        merge(
          ...corners.flatMap(([sx, sz], i) => [
            box(0.62, 0.012, 0.055, [sx * ARM, 0.16, sz * ARM], [0, 0.4 + i * 0.7, 0.04]),
            cylY(0.03, 0.04, [sx * ARM, 0.16, sz * ARM], 12),
          ])
        ),
    },
    {
      label: "Flight controller",
      explode: [0, 1.25, 0],
      at: [0, 0.16, 0],
      labelAt: [0.2, 0.02, 0.1],
      labelDir: [1, 0.7, 0],
      geometry: () =>
        merge(
          box(0.34, 0.02, 0.28),
          box(0.1, 0.03, 0.1, [0, 0.025, 0]),
          ...[-1, 1].map((s) => box(0.05, 0.03, 0.05, [s * 0.11, 0.025, 0.08]))
        ),
    },
    {
      label: "Battery",
      explode: [0, -0.62, 0],
      at: [0, -0.15, 0],
      labelAt: [-0.22, -0.06, 0.12],
      labelDir: [-1, -0.6, 0],
      geometry: () => box(0.44, 0.12, 0.24),
    },
    {
      label: "Vision system",
      explode: [0.45, -0.55, 0],
      at: [0.3, -0.16, 0],
      labelAt: [0.0, -0.1, 0],
      labelDir: [-0.3, -1, 0],
      geometry: () =>
        merge(
          box(0.08, 0.1, 0.08, [0, 0.03, 0]),
          place(new THREE.SphereGeometry(0.085, 24, 12), [0.04, -0.06, 0]),
          cylX(0.04, 0.05, [0.13, -0.06, 0], 16)
        ),
    },
  ],
};

export const MODELS: Record<ModelKey, Model> = { motor, battery, electrolyser, drone };
