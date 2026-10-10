"use client";

import { ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioSectorName } from "@/lib/taxonomy";
import { hostname } from "@/lib/utils";
import { CompanyLogo, StatusBadge } from "./CompanyLogo";
import { statusLabel } from "./status";

type CompanyCardProps = {
  company: Company;
  number: string;
  onOpen: (slug: string) => void;
};

export function CompanyCard({ company, number, onOpen }: CompanyCardProps) {
  const status = statusLabel(company);
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-teal/40 hover:bg-white/[0.035] sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="hud text-teal">
          {number} · {portfolioSectorName(company.sector)}
        </p>
        {status ? <StatusBadge label={status} /> : <p className="hud text-ink-400">{company.yearInvested}</p>}
      </div>

      <CompanyLogo company={company} className="mt-6" />

      <h3
        className={
          company.logo
            ? "mt-4 text-base font-semibold tracking-wide text-white"
            : "mt-6 font-serif text-2xl font-light tracking-wide text-white"
        }
      >
        {/* The stretched button makes the whole card open the profile. */}
        <button
          type="button"
          onClick={() => onOpen(company.slug)}
          className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-teal"
        >
          {company.name}
          <span className="sr-only"> — view company profile</span>
        </button>
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-300">{company.summary}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="rounded-full border border-white/12 px-3 py-1 text-[0.7rem] font-medium tracking-wide text-ink-200">
          {company.stage === "TBD" ? "Stage undisclosed" : company.stage}
        </span>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex min-h-11 items-center gap-1 text-xs text-ink-300 transition-colors hover:text-teal"
        >
          {hostname(company.website)} <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}
