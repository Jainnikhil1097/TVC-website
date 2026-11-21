"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { portfolioFundName, portfolioFunds, portfolioSectorName, portfolioSectors } from "@/lib/taxonomy";
import type { Company, FundId, PortfolioSectorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FundFilter, SectorFilter } from "./SectorFilter";
import { PortfolioMap } from "./PortfolioMap";
import { CompanyCard } from "./CompanyCard";
import { buildLayout } from "./geometry";
import type { CompanyEssay } from "./status";

// The profile panel (and GSAP with it) loads only when a company is first opened.
const CompanyPanel = dynamic(() => import("./CompanyPanel").then((m) => m.CompanyPanel), { ssr: false });

const isSector = (s: string | null): s is PortfolioSectorId =>
  s !== null && portfolioSectors.some((p) => p.id === s);
const isFund = (s: string | null): s is FundId => s !== null && portfolioFunds.some((f) => f.id === s);

type DataProps = {
  /** Every visible company, active and exited, in display order. */
  companies: Company[];
  /** Related Substack essay per company slug (matched on the server). */
  essays: Record<string, CompanyEssay>;
};

type ViewProps = DataProps & {
  sector: PortfolioSectorId | null;
  /** Fund filter (from ?fund=). */
  fund?: FundId | null;
  /** Company whose profile is open (from ?company=). */
  company?: string | null;
  onSectorChange?: (sector: PortfolioSectorId | null) => void;
  onFundChange?: (fund: FundId | null) => void;
  onCompanyChange?: (slug: string | null) => void;
};

/**
 * Filter chips + map/list views + company profile panel.
 * The map is desktop-only (≥1024px); phones always get the list. Both views are
 * rendered and toggled with CSS so server and client markup match.
 * Exited/acquired companies are hidden until "Show exits" is switched on.
 */
function ExplorerView({
  companies,
  essays,
  sector,
  fund = null,
  company: companyParam = null,
  onSectorChange,
  onFundChange,
  onCompanyChange,
}: ViewProps) {
  const [view, setView] = useState<"map" | "list">("map");
  const [showExits, setShowExits] = useState(false);
  const hasExits = companies.some((c) => c.status !== "active");

  // Local mirrors so the UI responds instantly while the URL catches up,
  // and re-sync whenever the query params change (back/forward, deep links).
  const [selected, setSelected] = useState<string | null>(companyParam);
  const [lastCompany, setLastCompany] = useState(companyParam);
  if (companyParam !== lastCompany) {
    setLastCompany(companyParam);
    setSelected(companyParam);
    // Deep links to an exited company switch exits on so it's visible behind the panel.
    if (companies.find((c) => c.slug === companyParam)?.status !== "active" && companyParam) setShowExits(true);
  }
  // Map view only: the company whose info card is open beside it.
  const [popover, setPopover] = useState<string | null>(null);
  const [localSector, setLocalSector] = useState(sector);
  const [lastSector, setLastSector] = useState(sector);
  if (sector !== lastSector) {
    setLastSector(sector);
    setLocalSector(sector);
  }

  const [localFund, setLocalFund] = useState(fund);
  const [lastFund, setLastFund] = useState(fund);
  if (fund !== lastFund) {
    setLastFund(fund);
    setLocalFund(fund);
  }
  const changeFund = (f: FundId | null) => {
    setLocalFund(f);
    onFundChange?.(f);
    const open = popover ? companies.find((c) => c.slug === popover) : undefined;
    if (open && f && open.fund !== f) setPopover(null);
  };

  const changeSector = (s: PortfolioSectorId | null) => {
    setLocalSector(s);
    onSectorChange?.(s);
    // Close the map card if its company is filtered out.
    const open = popover ? companies.find((c) => c.slug === popover) : undefined;
    if (open && s && open.sector !== s) setPopover(null);
  };
  const openPanel = (slug: string) => {
    setPopover(null);
    setSelected(slug);
    onCompanyChange?.(slug);
  };
  const closePanel = useCallback(() => {
    setSelected(null);
    onCompanyChange?.(null);
  }, [onCompanyChange]);

  // Exits, then fund: what's in play. The sector filter dims within it (map) or narrows it (list).
  const byStatus = useMemo(
    () => (showExits ? companies : companies.filter((c) => c.status === "active")),
    [companies, showExits]
  );
  const pool = useMemo(() => (localFund ? byStatus.filter((c) => c.fund === localFund) : byStatus), [byStatus, localFund]);
  const layout = useMemo(() => buildLayout(pool), [pool]);

  const visible = localSector ? pool.filter((c) => c.sector === localSector) : pool;
  const company = selected ? companies.find((c) => c.slug === selected) : undefined;
  const exitCount = companies.length - companies.filter((c) => c.status === "active").length;

  return (
    <>
      <FundFilter companies={byStatus} value={localFund} onChange={changeFund} />

      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <SectorFilter companies={pool} value={localSector} onChange={changeSector} />
        <div className="flex shrink-0 items-center gap-3">
          {hasExits && (
            <button
              type="button"
              aria-pressed={showExits}
              onClick={() => {
                // Hiding exits closes an open map card for an exited company.
                if (showExits) setPopover((p) => (p && companies.find((c) => c.slug === p)?.status !== "active" ? null : p));
                setShowExits((v) => !v);
              }}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.85rem] font-normal transition-colors",
                showExits ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-teal-ink/50 hover:text-teal-ink"
              )}
            >
              Show exits <span className={cn("hud", showExits ? "text-white/70" : "text-muted")}>{exitCount}</span>
            </button>
          )}
          <div role="group" aria-label="View" className="hidden rounded-full border border-line bg-surface p-1 lg:flex">
            {(
              [
                { id: "map", label: "Map", Icon: MapIcon },
                { id: "list", label: "List", Icon: LayoutGrid },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[0.85rem] font-normal transition-colors",
                  view === id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="hud mt-6 text-muted" aria-live="polite">
        Showing {visible.length} of {byStatus.length} {showExits ? "companies" : "active companies"}
        {localFund ? ` · ${portfolioFundName(localFund)}` : ""}
        {localSector ? ` · ${portfolioSectorName(localSector)}` : ""}
      </p>

      <div className={cn("mt-6 hidden", view === "map" && "lg:block")}>
        <PortfolioMap
          layout={layout}
          activeSector={localSector}
          selected={selected}
          popover={popover}
          onPopoverChange={setPopover}
          onOpenProfile={openPanel}
          essays={essays}
        />
      </div>

      <ul
        className={cn(
          "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5",
          view === "map" && "lg:hidden"
        )}
      >
        {visible.map((c) => (
          <li key={c.slug}>
            <CompanyCard company={c} onOpen={openPanel} />
          </li>
        ))}
      </ul>

      {company && (
        <CompanyPanel
          key={company.slug}
          company={company}
          essay={essays[company.slug]}
          onClose={closePanel}
        />
      )}
    </>
  );
}

function ExplorerWithParams(data: DataProps) {
  const params = useSearchParams();
  const rawSector = params.get("sector");
  const sector = isSector(rawSector) ? rawSector : null;
  const rawFund = params.get("fund");
  const fund = isFund(rawFund) ? rawFund : null;
  // Unknown slugs are ignored.
  const rawCompany = params.get("company");
  const company = rawCompany && data.companies.some((c) => c.slug === rawCompany) ? rawCompany : null;

  const setParam = useCallback(
    (key: "sector" | "fund" | "company", value: string | null) => {
      // Read the live URL so concurrent updates (e.g. sector + company) never clobber each other.
      const next = new URLSearchParams(window.location.search);
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      // The browser's own history API: Next keeps useSearchParams in sync, with no server
      // round trip (and so no full reload if one fails). location.pathname includes any base path.
      window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    },
    []
  );
  const onSectorChange = useCallback((s: PortfolioSectorId | null) => setParam("sector", s), [setParam]);
  const onFundChange = useCallback((f: FundId | null) => setParam("fund", f), [setParam]);
  const onCompanyChange = useCallback((slug: string | null) => setParam("company", slug), [setParam]);

  return (
    <ExplorerView
      {...data}
      sector={sector}
      fund={fund}
      company={company}
      onSectorChange={onSectorChange}
      onFundChange={onFundChange}
      onCompanyChange={onCompanyChange}
    />
  );
}

export function PortfolioExplorer(data: DataProps) {
  // The fallback is the unfiltered explorer, so the prerendered HTML already
  // contains every active company (good for SEO and first paint).
  return (
    <Suspense fallback={<ExplorerView {...data} sector={null} />}>
      <ExplorerWithParams {...data} />
    </Suspense>
  );
}
