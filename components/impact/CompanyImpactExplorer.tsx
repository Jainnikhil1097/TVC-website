"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioFundName } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/portfolio/CompanyLogo";

type ImpactCompany = Company & { impact: NonNullable<Company["impact"]> };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One company at a time: its impact area, tagline, evidence stage and up to four measures,
 * each with its evidence label, then the evidence boundary and sources. Quick chips for the
 * featured companies, the full list under "All companies", and prev/next.
 */
export function CompanyImpactExplorer({ companies }: { companies: ImpactCompany[] }) {
  const [index, setIndex] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const c = companies[index];
  if (!c) return null;
  const go = (i: number) => {
    setIndex((i + companies.length) % companies.length);
    setListOpen(false);
  };
  const chips = companies.map((x, i) => ({ x, i })).filter(({ x }) => x.impact.featured);
  const imp = c.impact;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map(({ x, i }) => (
          <button
            key={x.slug}
            type="button"
            aria-pressed={index === i}
            onClick={() => go(i)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm transition-colors",
              index === i ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-teal-ink/50 hover:text-teal-ink"
            )}
          >
            {x.name}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={listOpen}
          aria-controls="impact-company-list"
          onClick={() => setListOpen((v) => !v)}
          className={cn(
            "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
            listOpen || !chips.some(({ i }) => i === index) ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-teal-ink/50"
          )}
        >
          All companies <ChevronDown className={cn("size-4 transition-transform", listOpen && "rotate-180")} aria-hidden />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <p className="hud text-muted" aria-live="polite">
            {pad(index + 1)} / {pad(companies.length)}
          </p>
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => go(index + d)}
              aria-label={d < 0 ? "Previous company" : "Next company"}
              className="grid size-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-teal-ink hover:text-teal-ink"
            >
              {d < 0 ? <ArrowLeft className="size-4" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      </div>

      {listOpen && (
        <ul id="impact-company-list" className="mt-4 grid gap-1 rounded-2xl border border-line bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((x, i) => (
            <li key={x.slug}>
              <button
                type="button"
                onClick={() => go(i)}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm transition-colors", i === index ? "bg-ink text-white" : "text-ink hover:bg-surface")}
              >
                {x.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <article key={c.slug} className="impact-fade mt-8 grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
        {/* Picture */}
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-3xl bg-surface p-6 lg:min-h-full">
          {imp.image ? (
            <Image
              src={imp.image.url}
              alt={imp.image.alt || `${c.name}`}
              width={imp.image.width ?? 800}
              height={imp.image.height ?? 500}
              sizes="(min-width: 1024px) 352px, 90vw"
              className="h-auto max-h-96 w-full rounded-xl object-contain"
              // Fill the panel, but never more than 1.25× the file's size (no blur).
              style={{ maxWidth: imp.image.width ? Math.round(imp.image.width * 1.25) : undefined }}
            />
          ) : c.logo ? (
            <span className="rounded-2xl bg-white px-8 py-6">
              <CompanyLogo company={c} size="lg" />
            </span>
          ) : (
            <span className="font-display text-3xl text-ink">{c.name}</span>
          )}
        </div>

        {/* Measures */}
        <div className="min-w-0">
          <p className="eyebrow text-teal-ink">
            {portfolioFundName(c.fund)}
            {imp.sectorLabel && <> · {imp.sectorLabel}</>}
          </p>
          <h3 className="display mt-3 text-4xl text-ink sm:text-5xl">
            <Link href={`/portfolio?company=${c.slug}`} className="hover:text-teal-ink">
              {c.name}
            </Link>
          </h3>
          {imp.tagline && <p className="mt-3 text-xl leading-snug text-ink">{imp.tagline}</p>}
          {(imp.period || imp.stage) && <p className="hud mt-3 text-muted">{[imp.stage, imp.period].filter(Boolean).join(" · ")}</p>}

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {imp.metrics.map((m) => (
              <li key={m.label} className="flex flex-col rounded-2xl border border-line bg-white p-5">
                <p className="font-bold text-ink">{m.label}</p>
                {m.value ? (
                  <p className="display mt-4 text-4xl text-ink">{m.value}</p>
                ) : (
                  <p aria-hidden className="mt-4 text-4xl leading-none text-line">—</p>
                )}
                {m.unit && <p className="mt-1 text-teal-ink">{m.unit}</p>}
                <p className={cn("hud mt-3", m.value ? "text-teal-ink" : "text-muted")}>{m.evidence || (m.value ? "" : "Reporting field")}</p>
                {m.note && <p className="mt-2 text-xs leading-relaxed text-muted">{m.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <div className="mt-8 grid gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
        <div>
          {imp.closer && (
            <>
              <p className="eyebrow text-teal-ink">A closer look</p>
              <p className="display mt-3 text-3xl text-ink">{imp.closer.value}</p>
              {imp.closer.text && <p className="mt-2 text-sm leading-relaxed text-muted">{imp.closer.text}</p>}
            </>
          )}
        </div>
        <div>
          <p className="eyebrow text-teal-ink">Evidence &amp; boundary</p>
          {imp.evidence && <p className="mt-3 leading-relaxed text-ink/80">{imp.evidence}</p>}
          {imp.sources && <p className="mt-3 text-sm leading-relaxed text-muted">Sources: {imp.sources}</p>}
        </div>
      </div>
    </div>
  );
}
