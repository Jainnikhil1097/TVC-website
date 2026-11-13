import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Fund } from "@/lib/types";
import { fundStatuses } from "@/lib/taxonomy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type FundsSectionProps = {
  funds: Fund[];
  eyebrow?: string;
  title?: string;
  intro?: string;
  className?: string;
  /** Show every fund (the Funds page) instead of only those marked "Show on home and About pages". */
  showAll?: boolean;
  /** Render just the cards, without the section heading (for pages that provide their own). */
  bare?: boolean;
};

const statusLabel = (status: Fund["status"]) => fundStatuses.find((s) => s.value === status)?.label ?? status;

export function FundCards({ funds }: { funds: Fund[] }) {
  return (
    <Reveal
      stagger={0.08}
      as="ul"
      className={cn("grid gap-4", funds.length > 1 && "md:grid-cols-2", funds.length > 2 && "lg:grid-cols-3")}
    >
      {funds.map((f) => (
        <li key={f.sebiRegistration} data-reveal className="flex flex-col rounded-2xl border border-line bg-white p-7 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl leading-snug font-light text-ink">{f.name}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                f.status === "raising" ? "bg-teal-ink text-white" : "bg-surface text-muted"
              )}
            >
              {statusLabel(f.status)}
            </span>
          </div>
          {f.size && <p className="display mt-6 text-4xl text-ink sm:text-5xl">{f.size}</p>}
          {f.description && <p className="mt-5 text-sm leading-relaxed text-muted">{f.description}</p>}
          <div className="mt-auto pt-8">
            <p className="border-t border-line pt-4 text-xs text-muted">
              {f.category} · SEBI reg. {f.sebiRegistration}
              <span className="block">Manager: {f.manager}</span>
            </p>
          </div>
        </li>
      ))}
    </Reveal>
  );
}

/** Fund cards. By default only funds marked "Show on home and About pages"; renders nothing if none. */
export function FundsSection({
  funds,
  eyebrow = "Our funds",
  title = "Capital for India's energy transition",
  intro,
  className,
  showAll = false,
  bare = false,
}: FundsSectionProps) {
  const shown = showAll ? funds : funds.filter((f) => f.showOnHome);
  if (shown.length === 0) return null;
  if (bare) return <FundCards funds={shown} />;

  return (
    <section aria-labelledby="funds-heading" className={cn("border-t border-line py-20 sm:py-28", className)}>
      <div className="container-site">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={eyebrow} title={<span id="funds-heading">{title}</span>} intro={intro} />
          {/* On the home page (featured funds only), point to the full Funds page. */}
          {!showAll && (
            <Link
              href="/funds"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-ink hover:text-teal-ink"
            >
              All funds and track record <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </Reveal>
        <div className="mt-12">
          <FundCards funds={shown} />
        </div>
      </div>
    </section>
  );
}
