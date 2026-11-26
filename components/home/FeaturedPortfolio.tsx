"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioFundName, portfolioSectorName } from "@/lib/taxonomy";
import { cn, hostname } from "@/lib/utils";

type Props = {
  companies: Company[];
  /** Investment note per company slug (Substack essay or the company's essay link). */
  notes: Record<string, string | undefined>;
  totalActive: number;
};

/**
 * Fills the panel: the cover photo if there is one, else the product image on white, else
 * the company's logo, large, on white (logos are made for white), else the company name.
 */
function Cover({ company, priority }: { company: Company; priority?: boolean }) {
  if (company.coverImage) {
    return (
      <Image
        src={company.coverImage.url}
        alt={company.coverImage.alt || company.name}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    );
  }
  if (company.productImage) {
    // The product image, whole, on a soft studio surface: multiply drops the image's own
    // white background into it, so there's no hard white box; its dark labels stay legible
    // (on the black section itself they'd disappear).
    return (
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,#ffffff_0%,#eef2f5_55%,#dfe5ea_100%)]">
        <Image
          src={company.productImage.url}
          alt={company.productImage.alt || `${company.name} product`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-[4%] mix-blend-multiply"
        />
      </div>
    );
  }
  if (company.logo) {
    return (
      <div aria-hidden className="absolute inset-0 grid place-items-center bg-white">
        {/* Large, but never wider than the file itself, so a small logo isn't blown up and blurred. */}
        <div className="relative h-[64%] w-[76%]" style={company.logo.width ? { maxWidth: company.logo.width } : undefined}>
          <Image src={company.logo.url} alt="" fill priority={priority} sizes="(min-width: 1024px) 40vw, 80vw" className="object-contain" />
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center bg-[#161616]">
      <span className="font-display text-4xl text-white/85">{company.name}</span>
    </div>
  );
}

function Details({ company, note }: { company: Company; note?: string }) {
  const founders = company.founders?.map((f) => f.name).join(", ");
  return (
    <div className="flex flex-col">
      <p className="hud text-teal">
        {portfolioSectorName(company.sector)} · {company.stage} · {portfolioFundName(company.fund)}
      </p>
      <h3 className="display mt-4 text-3xl text-white sm:text-4xl">{company.name}</h3>
      <p className="mt-4 max-w-lg leading-relaxed text-ink-200">{company.summary}</p>
      {founders && <p className="mt-4 text-sm text-ink-300">Founded by {founders}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        {note && (
          <a
            href={note}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9rem] font-bold text-ink hover:bg-teal-soft"
          >
            Read our investment note <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
        <Link
          href={`/portfolio?company=${company.slug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-[0.9rem] font-bold text-white hover:border-teal hover:text-teal"
        >
          Company profile <ArrowRight className="size-4" aria-hidden />
        </Link>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[0.9rem] text-ink-300 hover:text-white"
        >
          {hostname(company.website)} <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

/**
 * Featured portfolio companies in a dark band (echoing the globe). Desktop: tabs
 * on the left, detail on the right. Mobile: swipeable cards. Every link goes to
 * that company's own profile and investment note.
 */
export function FeaturedPortfolio({ companies, notes, totalActive }: Props) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!companies.length) return null;
  const current = companies[Math.min(index, companies.length - 1)];

  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
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
    <section data-theme="dark" aria-labelledby="featured-title" className="bg-ink py-20 text-white sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-teal">Portfolio</p>
            <h2 id="featured-title" className="display mt-4 text-3xl sm:text-4xl lg:text-[2.75rem]">
              Companies we&rsquo;ve backed
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-white hover:text-teal"
          >
            All {totalActive} companies <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Desktop: tabs + panel */}
        <div className="mt-12 hidden gap-10 lg:grid lg:grid-cols-[18rem_1fr]">
          <div role="tablist" aria-label="Featured companies" aria-orientation="vertical" onKeyDown={onKeyDown} className="flex flex-col">
            {companies.map((c, i) => {
              const selected = i === index;
              return (
                <button
                  key={c.slug}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`featured-tab-${c.slug}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="featured-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "border-l-2 py-4 pl-5 text-left transition-colors",
                    selected ? "border-teal text-white" : "border-white/10 text-ink-300 hover:text-white"
                  )}
                >
                  <span className="block font-display text-lg">{c.name}</span>
                  <span className="hud mt-1 block text-ink-400">{portfolioSectorName(c.sector)}</span>
                </button>
              );
            })}
          </div>

          <div
            id="featured-panel"
            role="tabpanel"
            aria-labelledby={`featured-tab-${current.slug}`}
            className="grid grid-cols-[1.05fr_1fr] gap-10"
          >
            <div key={current.slug} className="spot-portrait relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Cover company={current} />
            </div>
            <div key={`d-${current.slug}`} className="spot-text self-center">
              <Details company={current} note={notes[current.slug]} />
            </div>
          </div>
        </div>

        {/* Mobile / tablet: swipeable cards */}
        <ul className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:hidden">
          {companies.map((c) => (
            <li key={c.slug} className="w-[85%] shrink-0 snap-start sm:w-[60%]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Cover company={c} />
              </div>
              <div className="mt-6">
                <Details company={c} note={notes[c.slug]} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
