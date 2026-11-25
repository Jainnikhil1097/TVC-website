import { buildLines, flowY, hex, seededRandom, SPECTRUM } from "@/components/home/flow-geometry";

// Drawn once on the server in a 1200 × 120 box, then stretched to the footer's width:
// a slim ribbon along the footer's top edge, above the newsletter.
const W = 1200;
const H = 120;
const POINTS = 40;
const T = 6; // the moment of the hero's flow this still is taken from

/** The line sampled at a fixed moment, as a compact SVG path (whole-pixel points). */
function pathFor(line: ReturnType<typeof buildLines>[number]) {
  let d = "";
  for (let k = 0; k <= POINTS; k++) {
    const u = k / POINTS;
    d += `${k ? "L" : "M"}${Math.round(u * W)} ${Math.round(flowY(line, u, T, H))}`;
  }
  return d;
}

const lines = buildLines(30, true, 3, seededRandom(11));
const neon = lines.filter((l) => l.neon).map(pathFor);
const texture = lines.filter((l) => !l.neon).filter((_, i) => i % 2 === 0).map(pathFor);

/**
 * A quiet, static echo of the home hero's energy flow along the top edge of the footer:
 * the same "fossil → clean" lines (amber → Transition Aqua), faint, fading out before
 * the newsletter text. Server-rendered SVG — no animation, no JavaScript. Each neon line
 * is defined once and reused for its glow and core, to keep the markup small.
 */
export function FooterWave() {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 w-full [mask-image:linear-gradient(to_bottom,black_0%,black_30%,transparent_85%)] sm:h-28"
    >
      <defs>
        <linearGradient id="fw-g" x1="0" y1="0" x2="1" y2="0">
          {SPECTRUM.map(([stop, c]) => (
            <stop key={stop} offset={stop} stopColor={hex(c)} />
          ))}
        </linearGradient>
        {neon.map((d, i) => (
          <path key={i} id={`fw-${i}`} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </defs>
      <g fill="none" strokeLinecap="round">
        <g stroke="#ffffff" strokeOpacity={0.05} strokeWidth={0.5}>
          {texture.map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g stroke="url(#fw-g)">
          {neon.map((_, i) => (
            <g key={i}>
              <use href={`#fw-${i}`} strokeOpacity={0.12} strokeWidth={2.4} />
              <use href={`#fw-${i}`} strokeOpacity={0.6} strokeWidth={0.7} />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
