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
};

const statusLabel = (status: Fund["status"]) => fundStatuses.find((s) => s.value === status)?.label ?? status;

/** Funds marked "Show on home and About pages" in the CMS. Renders nothing if none are. */
export function FundsSection({
  funds,
  eyebrow = "Our funds",
  title = "Capital for India's energy transition",
  intro,
  className,
}: FundsSectionProps) {
  const shown = funds.filter((f) => f.showOnHome);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="funds-heading" className={cn("border-t border-white/8 py-20 sm:py-28", className)}>
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={<span id="funds-heading">{title}</span>} intro={intro} />
        </Reveal>
        <Reveal
          stagger={0.08}
          as="ul"
          className={cn("mt-12 grid gap-4", shown.length > 1 && "md:grid-cols-2", shown.length > 2 && "lg:grid-cols-3")}
        >
          {shown.map((f) => (
            <li
              key={f.sebiRegistration}
              data-reveal
              className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-xl leading-snug font-light text-white">{f.name}</h3>
                <span
                  className={cn(
                    "hud shrink-0 rounded-full border px-2.5 py-1 text-[0.6rem]",
                    f.status === "raising" ? "border-teal/40 text-teal" : "border-white/15 text-ink-300"
                  )}
                >
                  {statusLabel(f.status)}
                </span>
              </div>
              {f.size && <p className="display mt-6 text-4xl text-white sm:text-5xl">{f.size}</p>}
              {f.description && <p className="mt-5 text-sm leading-relaxed text-ink-300">{f.description}</p>}
              <p className="hud mt-auto pt-8 text-[0.6rem] text-ink-400">
                {f.category} · SEBI {f.sebiRegistration}
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
