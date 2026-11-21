import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";

type Props = {
  positioning: string;
  about: string;
};

/**
 * Straight after the hero: one claim (revealed word by word) on the left, a short
 * paragraph and a link to the team on the right. No fund figures here.
 */
export function PositioningBand({ positioning, about }: Props) {
  return (
    <section aria-labelledby="positioning-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
        <Reveal>
          <p className="eyebrow text-teal-ink">About Transition VC</p>
          <WordReveal
            as="h2"
            id="positioning-title"
            text={positioning}
            className="display mt-5 text-3xl text-ink sm:text-4xl lg:text-[2.75rem]"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{about}</p>
          <Link
            href="/about"
            className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold text-ink underline decoration-line decoration-2 underline-offset-8 transition-colors hover:text-teal-ink hover:decoration-teal-ink"
          >
            Meet the team <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
