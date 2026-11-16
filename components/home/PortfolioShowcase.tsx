import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioSectorName } from "@/lib/taxonomy";
import { Reveal } from "@/components/motion/Reveal";
import { CompanyLogo } from "@/components/portfolio/CompanyLogo";
import { ProductSpotlight } from "./ProductSpotlight";

type Props = {
  /** Featured companies, shown one at a time in the product spotlight. */
  spotlight: Company[];
  /** Companies with a headline number, for the proof band. */
  proofs: Company[];
  /** A few more companies as datasheet cards. */
  others: Company[];
  notes: Record<string, string | undefined>;
  totalActive: number;
};

const profileHref = (c: Company) => `/portfolio?company=${c.slug}`;

/**
 * The home page's portfolio band (dark, echoing the hero): real deployment numbers,
 * then a featured company's annotated product, then datasheet cards for a few more.
 * Everything links to the company's own profile.
 */
export function PortfolioShowcase({ spotlight, proofs, others, notes, totalActive }: Props) {
  if (!spotlight.length && !others.length) return null;
  return (
    <section data-theme="dark" aria-labelledby="showcase-title" className="bg-ink py-20 text-white sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-teal">Portfolio</p>
            <h2 id="showcase-title" className="display mt-4 text-3xl sm:text-4xl lg:text-[2.75rem]">
              What our companies are building
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-white hover:text-teal"
          >
            All {totalActive} companies <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {proofs.length > 0 && <ProofBand companies={proofs} />}

        {spotlight.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <ProductSpotlight companies={spotlight} notes={notes} />
          </div>
        )}

        {others.length > 0 && (
          <div className="mt-20 sm:mt-24">
            <div className="flex items-end justify-between gap-6">
              <h3 className="eyebrow text-ink-300">Across the portfolio</h3>
              <Link href="/portfolio" className="hidden text-sm font-semibold text-white hover:text-teal sm:inline-flex sm:items-center sm:gap-1.5">
                See every company <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <Reveal
              as="ul"
              stagger={0.06}
              className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3"
            >
              {others.map((c) => (
                <li key={c.slug} data-reveal className="w-[82%] shrink-0 snap-start sm:w-auto">
                  <DatasheetCard company={c} />
                </li>
              ))}
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}

// Desktop shows every stat in one row (written out so Tailwind sees each class).
const LG_COLS = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4", "lg:grid-cols-5", "lg:grid-cols-6"];

/** Real-world numbers from the portfolio, each linking to the company behind it. */
function ProofBand({ companies }: { companies: Company[] }) {
  return (
    // Hairlines come from the 1px gaps showing the list's background through.
    <Reveal
      as="ul"
      className={`mt-12 grid grid-cols-2 gap-px overflow-hidden border-y border-white/10 bg-white/10 ${LG_COLS[companies.length]}`}
    >
      {companies.map((c) => (
        <li key={c.slug} className="bg-ink max-lg:last:odd:col-span-2">
          <Link href={profileHref(c)} className="group flex h-full flex-col px-4 py-6 sm:px-6 lg:py-7">
            <span className="display text-3xl text-white tabular-nums sm:text-[2.5rem]">{c.proof!.value}</span>
            <span className="mt-2 text-sm leading-snug text-ink-200">{c.proof!.label}</span>
            <span className="hud mt-auto inline-flex items-center gap-1 pt-4 text-teal">
              {c.name}
              <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </Reveal>
  );
}

/** A company as a compact technical datasheet. */
function DatasheetCard({ company }: { company: Company }) {
  const rows = [
    { label: "Sector", value: portfolioSectorName(company.sector) },
    { label: "Stage", value: company.stage === "TBD" ? "Undisclosed" : company.stage },
    { label: "Deployed", value: company.deployment },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value));

  return (
    <Link
      href={profileHref(company)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-teal/50 hover:bg-white/[0.05]"
    >
      <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-teal/70 via-teal/30 to-transparent" />
      <div className="flex min-h-10 items-center">
        {company.logo ? (
          <CompanyLogo company={company} tone="dark" />
        ) : (
          <span className="font-display text-xl text-white">{company.name}</span>
        )}
      </div>
      {company.logo && <span className="mt-4 font-display text-lg text-white">{company.name}</span>}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-300">{company.summary}</p>
      <dl className="mt-6 divide-y divide-white/[0.08] border-t border-white/[0.08]">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[5.5rem_1fr] gap-3 py-2.5">
            <dt className="hud pt-px text-ink-400">{r.label}</dt>
            <dd className="text-[0.8125rem] leading-snug text-ink-200">{r.value}</dd>
          </div>
        ))}
      </dl>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-white group-hover:text-teal">
        Company profile <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
