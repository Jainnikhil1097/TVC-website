import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Image as CmsImage } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { PhotoMarquee } from "@/components/media/PhotoMarquee";

type Props = {
  positioning: string;
  about: string;
  /** The team's group photos (CMS → About page → Group photos), drifting slowly. */
  photos: { image: CmsImage; caption?: string }[];
  /** Stage, cheque size, portfolio: value first, label under it. */
  facts: { label: string; value: string; icon?: LucideIcon }[];
};

/** Keeps "₹20 Cr" or "$2.3M" in one piece, so a range only breaks at its dash. */
const keepAmounts = (v: string) => v.replace(/([₹$]\s?[\d.,]+)\s(Cr|Mn|M|L|Lakh)\b/g, "$1\u00a0$2").replace(/ – /g, "\u00a0– ");

/**
 * Straight after the hero: the claim (revealed word by word), a short paragraph and a link
 * to the team, beside the team's group photos drifting slowly past; underneath, the facts
 * founders ask first (stage, cheque size, portfolio). No fund figures here.
 */
export function PositioningBand({ positioning, about, photos, facts }: Props) {
  const photo = photos.length > 0;
  return (
    <section aria-labelledby="positioning-title" className="py-20 sm:py-28">
      <div className="container-site">
        <div className={photo ? "grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16" : "max-w-4xl"}>
          <Reveal>
            <p className="eyebrow text-teal-ink">About Transition VC</p>
            <WordReveal
              as="h2"
              id="positioning-title"
              text={positioning}
              className="display mt-5 text-3xl text-balance text-ink sm:text-4xl lg:text-[2.75rem]"
            />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{about}</p>
            <Link
              href="/about"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 font-bold text-white transition-colors hover:bg-teal-ink"
            >
              Meet the team <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
          {photo && (
            <Reveal delay={0.1} className="min-w-0">
              <PhotoMarquee photos={photos} className="rounded-3xl" height="h-72 sm:h-[26rem]" secondsPerPhoto={14} sizes="(min-width: 1024px) 640px, 90vw" />
            </Reveal>
          )}
        </div>

        {facts.length > 0 && (
          <Reveal
            as="ul"
            stagger={0.06}
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-ink-600 sm:mt-16 lg:grid-cols-3"
          >
            {facts.map((f, i) => {
              const Icon = f.icon;
              return (
                <li
                  key={f.label}
                  data-reveal
                  className={cn(
                    "flex gap-4 bg-ink p-5 text-white sm:p-7",
                    // Phones: the first fact spans the card; the two below stack icon over text.
                    i === 0 ? "col-span-2 items-start lg:col-span-1" : "flex-col gap-3 sm:flex-row sm:items-start sm:gap-4"
                  )}
                >
                  {Icon && (
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-teal">
                      <Icon className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-xl leading-tight font-bold text-balance sm:text-2xl lg:text-[1.75rem]">{keepAmounts(f.value)}</p>
                    <p className="hud mt-1.5 text-white/60">{f.label}</p>
                  </div>
                </li>
              );
            })}
          </Reveal>
        )}
      </div>
    </section>
  );
}
