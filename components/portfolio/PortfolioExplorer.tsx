"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { portfolioSectorName, portfolioSectors } from "@/lib/taxonomy";
import type { Company, PortfolioSectorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectorFilter } from "./SectorFilter";
import { PortfolioMap } from "./PortfolioMap";
import { CompanyCard } from "./CompanyCard";
import { buildLayout, companyNumbers } from "./geometry";
import type { CompanyEssay } from "./status";

// The profile panel (and GSAP with it) loads only when a company is first opened.
const CompanyPanel = dynamic(() => import("./CompanyPanel").then((m) => m.CompanyPanel), { ssr: false });

const isSector = (s: string | null): s is PortfolioSectorId =>
  s !== null && portfolioSectors.some((p) => p.id === s);

type DataProps = {
  /** Every visible company, active and exited, in display order. */
  companies: Company[];
  /** Related Substack essay per company slug (matched on the server). */
  essays: Record<string, CompanyEssay>;
};

type ViewProps = DataProps & {
  sector: PortfolioSectorId | null;
  /** Company whose profile is open (from ?company=). */
  company?: string | null;
  onSectorChange?: (sector: PortfolioSectorId | null) => void;
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
  company: companyParam = null,
  onSectorChange,
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
  const [localSector, setLocalSector] = useState(sector);
  const [lastSector, setLastSector] = useState(sector);
  if (sector !== lastSector) {
    setLastSector(sector);
    setLocalSector(sector);
  }

  const changeSector = (s: PortfolioSectorId | null) => {
    setLocalSector(s);
    onSectorChange?.(s);
  };
  const openPanel = (slug: string) => {
    setSelected(slug);
    onCompanyChange?.(slug);
  };
  const closePanel = useCallback(() => {
    setSelected(null);
    onCompanyChange?.(null);
  }, [onCompanyChange]);

  const numbers = useMemo(() => companyNumbers(companies), [companies]);
  const pool = useMemo(
    () => (showExits ? companies : companies.filter((c) => c.status === "active")),
    [companies, showExits]
  );
  const layout = useMemo(() => buildLayout(pool, numbers), [pool, numbers]);

  const visible = localSector ? pool.filter((c) => c.sector === localSector) : pool;
  const company = selected ? companies.find((c) => c.slug === selected) : undefined;
  const exitCount = companies.length - companies.filter((c) => c.status === "active").length;

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <SectorFilter companies={pool} value={localSector} onChange={changeSector} />
        <div className="flex shrink-0 items-center gap-3">
          {hasExits && (
            <button
              type="button"
              aria-pressed={showExits}
              onClick={() => setShowExits((v) => !v)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.78rem] font-medium tracking-wide transition-colors",
                showExits ? "border-white bg-white text-ink-950" : "border-white/15 text-ink-200 hover:border-teal/60 hover:text-white"
              )}
            >
              Show exits <span className={cn("hud", showExits ? "text-ink-600" : "text-ink-400")}>{exitCount}</span>
            </button>
          )}
          <div role="group" aria-label="View" className="hidden rounded-full border border-white/12 p-1 lg:flex">
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
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[0.78rem] font-medium tracking-wide transition-colors",
                  view === id ? "bg-white/10 text-white" : "text-ink-300 hover:text-white"
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="hud mt-6 text-ink-400" aria-live="polite">
        Showing {visible.length} of {pool.length} {showExits ? "companies" : "active companies"}
        {localSector ? ` · ${portfolioSectorName(localSector)}` : ""}
      </p>

      <div className={cn("mt-6 hidden", view === "map" && "lg:block")}>
        <PortfolioMap layout={layout} activeSector={localSector} selected={selected} onSelect={openPanel} />
      </div>

      <ul
        className={cn(
          "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5",
          view === "map" && "lg:hidden"
        )}
      >
        {visible.map((c) => (
          <li key={c.slug}>
            <CompanyCard company={c} number={numbers[c.slug]} onOpen={openPanel} />
          </li>
        ))}
      </ul>

      {company && (
        <CompanyPanel
          key={company.slug}
          company={company}
          number={numbers[company.slug]}
          essay={essays[company.slug]}
          onClose={closePanel}
        />
      )}
    </>
  );
}

function ExplorerWithParams(data: DataProps) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawSector = params.get("sector");
  const sector = isSector(rawSector) ? rawSector : null;
  // Unknown slugs are ignored.
  const rawCompany = params.get("company");
  const company = rawCompany && data.companies.some((c) => c.slug === rawCompany) ? rawCompany : null;

  const setParam = useCallback(
    (key: "sector" | "company", value: string | null) => {
      // Read the live URL so concurrent updates (e.g. sector + company) never clobber each other.
      const next = new URLSearchParams(window.location.search);
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );
  const onSectorChange = useCallback((s: PortfolioSectorId | null) => setParam("sector", s), [setParam]);
  const onCompanyChange = useCallback((slug: string | null) => setParam("company", slug), [setParam]);

  return (
    <ExplorerView
      {...data}
      sector={sector}
      company={company}
      onSectorChange={onSectorChange}
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
