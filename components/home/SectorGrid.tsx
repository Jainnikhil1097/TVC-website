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

/**
 * All investment sectors at a glance, four to a row on desktop. Each tile links to
 * the portfolio (filtered to that sector when one maps cleanly).
 */
export function SectorGrid({ sectors, companies }: { sectors: InvestmentSector[]; companies: Company[] }) {
  if (!sectors.length) return null;
  const active = companies.filter((c) => c.status === "active");

  return (
    <section id="sectors" aria-labelledby="sectors-title" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Where we invest"
            title={<span id="sectors-title">Sectors across the energy stack</span>}
          />
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-ink hover:text-teal-ink"
          >
            View the portfolio <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <Reveal as="ul" stagger={0.05} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((s) => {
            const count = s.portfolioSector ? active.filter((c) => c.sector === s.portfolioSector).length : 0;
            const href = s.portfolioSector ? `/portfolio?sector=${s.portfolioSector}` : "/portfolio";
            const Icon = ICONS[s.icon] ?? Layers;
            return (
              <li key={s.id} data-reveal>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-[border-color,box-shadow] hover:border-teal-ink/40 hover:shadow-[0_8px_30px_rgb(0_0_0/0.06)]"
                >
                  {/* Sector icon, in the same style as "Why founders choose us" */}
                  <span className="grid size-11 place-items-center rounded-full bg-teal/10 text-teal-ink transition-colors group-hover:bg-teal/20">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display font-bold text-xl text-ink">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.line}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-teal-ink">
                    {count > 0 ? `${count} ${count === 1 ? "company" : "companies"}` : "Explore"}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
