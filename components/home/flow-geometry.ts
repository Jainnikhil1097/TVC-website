// Shared geometry and colours for the "energy flow": the animated home-hero canvas
// (EnergyFlow.tsx, client) and the static footer echo (FooterWave.tsx, server) draw the
// same lines from these pure functions, so the two always match.

export type RGB = [number, number, number];
export type FlowLine = { y0: number; phase: number; alpha: number; neon: boolean };

// "Fossil → clean": each neon line runs from warm amber/ember on the left to Transition
// Aqua on the right — the energy transition, drawn. Amber is outside the brand palette
// and only used inside the wave.
export const SPECTRUM: [number, RGB][] = [
  [0, [255, 162, 76]], // amber
  [0.22, [255, 122, 69]], // ember
  [0.45, [127, 211, 168]], // warm teal
  [0.6, [14, 213, 194]], // Signal Teal
  [1, [6, 232, 211]], // Transition Aqua
];

export const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
export const rgb = (c: RGB) => c.join(", ");
export const hex = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

/** Spectrum colour at horizontal position u (0..1). */
export function spectrumAt(u: number): RGB {
  for (let i = 1; i < SPECTRUM.length; i++) {
    const [p1, c1] = SPECTRUM[i];
    const [p0, c0] = SPECTRUM[i - 1];
    if (u <= p1) return mix(c0, c1, (u - p0) / (p1 - p0));
  }
  return SPECTRUM[SPECTRUM.length - 1][1];
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Seeded pseudo-random numbers, so every visit (and every resize) looks the same. */
export function seededRandom(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * `count` streamlines. `neonEvery`: every nth line is a neon line. On black the plain
 * lines are faint texture (`dark`); on light they're a little stronger.
 */
export function buildLines(count: number, dark: boolean, neonEvery: number, rand = seededRandom(7)): FlowLine[] {
  return Array.from({ length: count }, (_, i) => ({
    y0: 0.04 + (0.92 * i) / (count - 1),
    phase: rand() * Math.PI * 2,
    alpha: 0.05 + rand() * 0.07, // the grey texture lines between the neon ones
    neon: i % neonEvery === (neonEvery === 7 ? 3 : 1),
  }));
}

/**
 * y (px) of a line at horizontal position u (0..1) and time t (s): loose and wavy at
 * the left, drawing into an ordered bundle at the right.
 */
export function flowY(l: FlowLine, u: number, t: number, height: number) {
  const converge = smoothstep(0.1, 1, u);
  const centre = 0.5;
  const base = centre + (l.y0 - centre) * (1 - 0.62 * converge);
  const amp = 0.055 * (1 - 0.72 * converge);
  const wave = Math.sin(u * 6.2 + t * 0.32 + l.phase) * 0.62 + Math.sin(u * 11.5 - t * 0.21 + l.phase * 1.7) * 0.38;
  return (base + amp * wave) * height;
}

/** The spectrum as a CSS gradient (left → right), for tinting other drawings to match. */
export const spectrumCss = () => `linear-gradient(90deg, ${SPECTRUM.map(([stop, c]) => `${hex(c)} ${Math.round(stop * 100)}%`).join(", ")})`;
