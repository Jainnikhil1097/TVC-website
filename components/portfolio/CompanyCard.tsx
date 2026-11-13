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
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-teal-ink/40 hover:shadow-[0_8px_30px_rgb(11_22_38/0.06)] sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="hud text-muted">
          <span className="text-teal-ink">{number}</span> · {portfolioSectorName(company.sector)}
        </p>
        {status ? <StatusBadge label={status} /> : <p className="hud text-muted">{company.yearInvested}</p>}
      </div>

      <CompanyLogo company={company} className="mt-6" />

      <h3
        className={
          company.logo
            ? "mt-4 text-base font-semibold text-ink"
            : "mt-6 font-serif text-2xl font-light text-ink"
        }
      >
        {/* The stretched button makes the whole card open the profile. */}
        <button
          type="button"
          onClick={() => onOpen(company.slug)}
          className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-teal-ink"
        >
          {company.name}
          <span className="sr-only"> — view company profile</span>
        </button>
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{company.summary}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="rounded-full border border-line bg-surface px-3 py-1 text-[0.72rem] font-medium text-ink">
          {company.stage === "TBD" ? "Stage undisclosed" : company.stage}
        </span>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex min-h-11 items-center gap-1 text-xs text-muted transition-colors hover:text-teal-ink"
        >
          {hostname(company.website)} <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}
