"use client";

import type { Company, FundId, PortfolioSectorId } from "@/lib/types";
import { portfolioFunds, portfolioSectors } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

type SectorFilterProps = {
  /** Companies in the current mode (active only, or including exits). */
  companies: Company[];
  value: PortfolioSectorId | null;
  onChange: (sector: PortfolioSectorId | null) => void;
};

export function SectorFilter({ companies, value, onChange }: SectorFilterProps) {
  const options: { id: PortfolioSectorId | null; name: string; count: number }[] = [
    { id: null, name: "All", count: companies.length },
    ...portfolioSectors.map((s) => ({
      id: s.id,
      name: s.name,
      count: companies.filter((c) => c.sector === s.id).length,
    })),
  ];

  return (
    <div className="-mx-5 md:mx-0">
      <div
        role="group"
        aria-label="Filter by sector"
        className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 md:flex-wrap md:overflow-visible md:px-0"
      >
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.85rem] font-normal transition-colors duration-300",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-teal-ink/50 hover:text-teal-ink"
              )}
            >
              {o.name}
              <span className={cn("hud", active ? "text-white/70" : "text-muted")}>{o.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type FundFilterProps = {
  /** Companies in the current mode (active only, or including exits). */
  companies: Company[];
  value: FundId | null;
  onChange: (fund: FundId | null) => void;
};

/** Pre Fund / Fund I / Fund II, as a segmented control. Funds with no companies yet are shown but disabled. */
export function FundFilter({ companies, value, onChange }: FundFilterProps) {
  const options: { id: FundId | null; name: string; count: number }[] = [
    { id: null, name: "All funds", count: companies.length },
    ...portfolioFunds.map((f) => ({ id: f.id, name: f.name, count: companies.filter((c) => c.fund === f.id).length })),
  ];
  return (
    <div className="-mx-5 md:mx-0">
      <div className="no-scrollbar overflow-x-auto px-5 md:px-0">
        <div role="group" aria-label="Filter by fund" className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
          {options.map((o) => {
            const active = value === o.id;
            return (
              <button
                key={o.id ?? "all"}
                type="button"
                aria-pressed={active}
                disabled={o.count === 0 && !active}
                onClick={() => onChange(o.id)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[0.85rem] font-normal transition-colors disabled:cursor-default disabled:opacity-40",
                  active ? "bg-white text-ink shadow-sm" : "text-muted enabled:hover:text-ink"
                )}
              >
                {o.name}
                <span className="hud text-muted">{o.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
