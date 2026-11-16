"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioSectorName } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { CalloutLegend, ProductStage } from "@/components/portfolio/ProductCallouts";

type Props = {
  companies: Company[];
  /** Investment note per company slug (Substack essay or the company's essay link). */
  notes: Record<string, string | undefined>;
};

const stageLabel = (c: Company) => (c.stage === "TBD" ? "Undisclosed stage" : c.stage);

/**
 * Featured companies, one at a time: the annotated product render on the left, what
 * they built and the proof on the right. A horizontal tablist switches company.
 */
export function ProductSpotlight({ companies, notes }: Props) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!companies.length) return null;
  const current = companies[Math.min(index, companies.length - 1)];

  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next: number | undefined;
    if (step) next = (index + step + companies.length) % companies.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = companies.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Featured companies"
        onKeyDown={onKeyDown}
        className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-white/10 px-5 sm:mx-0 sm:px-0"
      >
        {companies.map((c, i) => {
          const selected = i === index;
          return (
            <button
              key={c.slug}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`spotlight-tab-${c.slug}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="spotlight-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setIndex(i)}
              className={cn(
                "-mb-px flex min-h-12 shrink-0 items-baseline gap-2 border-b-2 px-4 pt-2 pb-3 text-left transition-colors first:pl-0",
                selected ? "border-teal text-white" : "border-transparent text-ink-300 hover:text-white"
              )}
            >
              <span className={cn("font-mono text-[0.625rem]", selected ? "text-teal" : "text-ink-400")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-base sm:text-lg">{c.name}</span>
            </button>
          );
        })}
      </div>

      <div
        id="spotlight-panel"
        role="tabpanel"
        aria-labelledby={`spotlight-tab-${current.slug}`}
        className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14"
      >
        {/* Keyed so the hotspot state resets and the crossfade replays per company. */}
        <Stage key={current.slug} company={current} />
        <div key={`d-${current.slug}`} className="spot-text flex flex-col self-center">
          <Details company={current} note={notes[current.slug]} />
        </div>
      </div>
    </div>
  );
}

function Stage({ company }: { company: Company }) {
  const [active, setActive] = useState(0);
  return (
    <div className="spot-portrait">
      <ProductStage
        company={company}
        active={active}
        onActive={setActive}
        sizes="(min-width: 1024px) 640px, 100vw"
      />
      {company.productImage && (
        <CalloutLegend callouts={company.callouts ?? []} active={active} onActive={setActive} tone="dark" className="mt-5" />
      )}
    </div>
  );
}

function Details({ company, note }: { company: Company; note?: string }) {
  const facts = [
    { label: "Deployment", value: company.deployment },
    { label: "Customers", value: company.customers },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <>
      <p className="hud text-teal">
        {portfolioSectorName(company.sector)} · {stageLabel(company)}
      </p>
      <h3 className="display mt-4 text-3xl text-white sm:text-4xl">{company.name}</h3>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-200">{company.summary}</p>

      {company.breakthrough && (
        <div className="mt-6 max-w-xl">
          <p className="eyebrow text-ink-300">The breakthrough</p>
          <p className="mt-2 line-clamp-3 leading-relaxed text-ink-200">{company.breakthrough}</p>
        </div>
      )}

      {facts.length > 0 && (
        <dl className="mt-7 max-w-xl divide-y divide-white/10 border-y border-white/10">
          {facts.map((f) => (
            <div key={f.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3">
              <dt className="hud pt-0.5 text-ink-300">{f.label}</dt>
              <dd className="text-sm text-white">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/portfolio?company=${company.slug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9rem] font-semibold text-ink hover:bg-teal-soft"
        >
          Company profile <ArrowRight className="size-4" aria-hidden />
        </Link>
        {note && (
          <a
            href={note}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-[0.9rem] font-semibold text-white hover:border-teal hover:text-teal"
          >
            Read our investment note <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
      </div>
    </>
  );
}
