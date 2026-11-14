import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metric } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { formatDate } from "@/lib/utils";

type Props = {
  positioning: string;
  about: string;
  /** Headline figures (Fund metrics marked "Show on home page"). */
  figures: Metric[];
  asOf?: string;
  disclaimer: string;
};

/** One claim (revealed word by word), a short paragraph and 3–4 headline figures — straight after the hero. */
export function PositioningBand({ positioning, about, figures, asOf, disclaimer }: Props) {
  return (
    <section aria-labelledby="positioning-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <Reveal>
          <p className="eyebrow text-teal-ink">About Transition VC</p>
          <WordReveal
            as="h2"
            id="positioning-title"
            text={positioning}
            className="display mt-5 text-3xl text-ink sm:text-4xl lg:text-[2.75rem]"
          />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{about}</p>
          <Link
            href="/about"
            className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline decoration-line decoration-2 underline-offset-8 transition-colors hover:text-teal-ink hover:decoration-teal-ink"
          >
            Meet the team <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>

        {figures.length > 0 && (
          <div>
            <Reveal as="ul" stagger={0.08} className="grid grid-cols-2 border-t border-l border-line">
              {figures.map((m) => (
                <li key={m.label} data-reveal className="border-r border-b border-line p-6 sm:p-8">
                  <p className="display text-4xl text-ink sm:text-5xl">{m.value}</p>
                  <p className="mt-3 text-sm font-medium text-ink">{m.label}</p>
                  {m.note && <p className="mt-1 text-xs text-muted">{m.note}</p>}
                </li>
              ))}
            </Reveal>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              {asOf && <>Figures as of {formatDate(asOf.slice(0, 10))}. </>}
              {disclaimer}{" "}
              <Link href="/funds" className="underline underline-offset-2 hover:text-teal-ink">
                All fund figures
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
