import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { InvestmentSector } from "@/lib/cms";
import type { Company } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

/**
 * All investment sectors at a glance (replaces the carousel, which showed one at
 * a time). Each tile links to the portfolio filtered to that sector.
 */
export function SectorGrid({ sectors, companies }: { sectors: InvestmentSector[]; companies: Company[] }) {
  if (!sectors.length) return null;
  const active = companies.filter((c) => c.status === "active");

  return (
    <section aria-labelledby="sectors-title" className="border-t border-line py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Where we invest"
            title={<span id="sectors-title">Sectors across the energy stack</span>}
          />
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-ink hover:text-teal-ink"
          >
            View the portfolio <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <Reveal as="ul" stagger={0.05} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((s) => {
            const count = s.portfolioSector ? active.filter((c) => c.sector === s.portfolioSector).length : 0;
            const href = s.portfolioSector ? `/portfolio?sector=${s.portfolioSector}` : "/portfolio";
            return (
              <li key={s.id} data-reveal>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-[border-color,box-shadow] hover:border-teal-ink/40 hover:shadow-[0_8px_30px_rgb(11_22_38/0.06)]"
                >
                  {/* Small dotted orb — a quiet echo of the globe */}
                  <span
                    aria-hidden
                    className="block size-9 rounded-full border border-teal-ink/30"
                    style={{
                      background:
                        "radial-gradient(circle, rgb(6 122 112 / 0.55) 1px, transparent 1.4px) 0 0 / 6px 6px, radial-gradient(circle at 35% 30%, #fff, #e8eef1)",
                    }}
                  />
                  <h3 className="mt-5 font-serif text-xl text-ink">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.line}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-ink">
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
