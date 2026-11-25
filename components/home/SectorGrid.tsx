import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  CarFront,
  CircuitBoard,
  Cpu,
  Factory,
  FlaskConical,
  Layers,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { SectorIcon } from "@/lib/sector-icons";
import type { InvestmentSector } from "@/lib/cms";
import type { Company } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const ICONS: Record<SectorIcon, LucideIcon> = {
  mobility: CarFront,
  industrial: Factory,
  built: Building2,
  semiconductors: Cpu,
  electronics: CircuitBoard,
  renewables: Wind,
  storage: BatteryCharging,
  fuels: FlaskConical,
  general: Layers,
};

/** One colour per stop along the road (brand teal and aqua, plus the spectrum's warmer notes). */
const STOP_COLOURS = ["#0ed5c2", "#ffa24c", "#3b82f6", "#7fd3a8", "#8b5cf6", "#06e8d3", "#ef6c57", "#14b8a6"];

// The road (desktop), in SVG units: a wave whose peaks and troughs carry the stops.
const VW = 1200;
const VH = 640;
const MID = 330;
const AMP = 120;
const STEP = 150; // distance between stops along x
const X0 = 75;

function roadPath(n: number) {
  // Smooth wave through alternating peaks (up) and troughs (down), extended past both edges.
  const pts = Array.from({ length: n + 2 }, (_, i) => ({ x: X0 + (i - 1) * STEP, y: MID + (i % 2 === 0 ? AMP : -AMP) }));
  let d = `M ${pts[0].x - STEP} ${MID}`;
  d += ` Q ${pts[0].x - STEP / 2} ${pts[0].y}, ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = (a.x + b.x) / 2;
    d += ` C ${c} ${a.y}, ${c} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

/**
 * A small electric car seen from above, pointing right (+x), centred on the origin: teal
 * body, dark glass, wheels and a soft headlight glow. animateMotion turns it with the road.
 */
function TopDownCar({ small = false }: { small?: boolean }) {
  return (
    <g transform={small ? "scale(0.62)" : undefined}>
      <ellipse cx={0} cy={2.5} rx={19} ry={9.5} fill="#000" opacity={0.12} />
      {[-11, 11].map((x) => [-8.6, 8.6].map((y) => <rect key={`${x}${y}`} x={x - 3.6} y={y - 2} width={7.2} height={4} rx={1.6} fill="#111" />))}
      <rect x={-17} y={-8} width={34} height={16} rx={6} fill="#0ed5c2" />
      <rect x={-4} y={-6.2} width={11} height={12.4} rx={2.6} fill="#0b3b37" />
      <rect x={-13} y={-5.6} width={6} height={11.2} rx={2} fill="#0b3b37" opacity={0.85} />
      <rect x={14} y={-6.5} width={2.4} height={3.4} rx={1} fill="#fffbe6" />
      <rect x={14} y={3.1} width={2.4} height={3.4} rx={1} fill="#fffbe6" />
      <path d="M17 -6 L34 -12 L34 0 Z M17 6 L34 12 L34 0 Z" fill="#fffbe6" opacity={0.18} />
    </g>
  );
}

type Stop = InvestmentSector & { count: number; href: string };

function Label({ s, i }: { s: Stop; i: number }) {
  const Icon = ICONS[s.icon] ?? Layers;
  const colour = STOP_COLOURS[i % STOP_COLOURS.length];
  return (
    <>
      <p className="flex items-center gap-2 font-display text-lg leading-tight font-bold text-ink">
        <Icon className="size-5 shrink-0" style={{ color: colour }} aria-hidden />
        {s.name}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.line}</p>
      <Link href={s.href} className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-sm font-bold text-teal-ink hover:text-ink">
        {s.count > 0 ? `${s.count} ${s.count === 1 ? "company" : "companies"}` : "Explore"}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </>
  );
}

/**
 * The investment sectors as stops along one winding road (desktop), drawn in as it
 * comes into view; a straight road with stops stacked beside it on phones. The step
 * numbers only order the road. Each stop links to the portfolio, filtered to that sector
 * when one maps cleanly. Everything comes from CMS → Pages → Home: where we invest.
 */
export function SectorGrid({ sectors, companies }: { sectors: InvestmentSector[]; companies: Company[] }) {
  if (!sectors.length) return null;
  const active = companies.filter((c) => c.status === "active");
  const stops: Stop[] = sectors.map((s) => ({
    ...s,
    count: s.portfolioSector ? active.filter((c) => c.sector === s.portfolioSector).length : 0,
    href: s.portfolioSector ? `/portfolio?sector=${s.portfolioSector}` : "/portfolio",
  }));
  const d = roadPath(stops.length);

  return (
    <section id="sectors" aria-labelledby="sectors-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Where we invest" title={<span id="sectors-title">Sectors across the energy stack</span>} />
          <Link href="/portfolio" className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-ink hover:text-teal-ink">
            View the portfolio <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Desktop: the winding road */}
        <Reveal className="sector-road relative mt-10 hidden lg:block" >
          <div className="relative w-full" style={{ aspectRatio: `${VW} / ${VH}` }}>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 size-full overflow-hidden" aria-hidden>
              <path id="sector-road-path" d={d} fill="none" stroke="#e7ecf0" strokeWidth={46} strokeLinecap="round" className="sector-road-band" pathLength={1} />
              <path d={d} fill="none" stroke="#ffffff" strokeWidth={2} strokeDasharray="10 12" className="sector-road-line" />
              {/* An electric car driving the road, turning with it (hidden for reduced motion) */}
              <g className="sector-road-traffic">
                <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#sector-road-path" />
                </animateMotion>
                {/* In its lane, just off the centre line */}
                <g transform="translate(0 9)">
                  <TopDownCar />
                </g>
              </g>
              {stops.map((_, i) => {
                const x = X0 + i * STEP;
                const y = MID + (i % 2 === 0 ? -AMP : AMP);
                return (
                  <g key={i} className="sector-road-stop" style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                    <circle cx={x} cy={y + 6} r={17} fill="#000" opacity={0.08} />
                    <circle cx={x} cy={y} r={17} fill="#111111" />
                    <circle cx={x} cy={y} r={7} fill={STOP_COLOURS[i % STOP_COLOURS.length]} />
                  </g>
                );
              })}
            </svg>
            <ul>
              {stops.map((s, i) => {
                const x = X0 + i * STEP;
                const up = i % 2 === 0; // peak: label above; trough: label below
                const y = MID + (up ? -AMP : AMP);
                return (
                  <li
                    key={s.id}
                    className="absolute w-[19%] -translate-x-1/2"
                    style={{
                      left: `${(x / VW) * 100}%`,
                      ...(up ? { bottom: `${((VH - (y - 34)) / VH) * 100}%` } : { top: `${((y + 34) / VH) * 100}%` }),
                    }}
                  >
                    <Label s={s} i={i} />
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        {/* Phones and tablets: a straight road with the stops beside it */}
        <Reveal as="ul" stagger={0.06} className="relative mt-10 space-y-8 pl-14 lg:hidden">
          <span aria-hidden className="absolute top-2 bottom-2 left-[18px] w-[14px] rounded-full bg-[#e7ecf0]" />
          <span aria-hidden className="absolute top-2 bottom-2 left-[24.5px] w-px border-l border-dashed border-white" />
          {/* Above the stop dots, so the car drives over them */}
          <span aria-hidden className="sector-road-car absolute top-2 left-[13px] z-10 h-[calc(100%-1rem)] w-6 motion-reduce:hidden">
            <svg viewBox="-12 -20 24 40" className="sector-road-car-body block w-6">
              <g transform="rotate(90) scale(1.05)">
                <TopDownCar small />
              </g>
            </svg>
          </span>
          {stops.map((s, i) => (
            <li key={s.id} data-reveal className="relative">
              <span aria-hidden className="absolute top-0.5 -left-[46px] grid size-[26px] place-items-center rounded-full bg-[#111111]">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: STOP_COLOURS[i % STOP_COLOURS.length] }} />
              </span>
              <Label s={s} i={i} />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
