import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Image as CmsImage } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/motion/WordReveal";
import { PhotoMarquee } from "@/components/media/PhotoMarquee";

type Props = {
  positioning: string;
  about: string;
  /** The team's group photos (CMS → About page → Group photos), drifting slowly. */
  photos: { image: CmsImage; caption?: string }[];
  facts: { label: string; value: string }[];
};

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
          <Reveal as="ul" stagger={0.06} className="mt-12 grid border-y border-line sm:mt-16 sm:grid-cols-3">
            {facts.map((f, i) => (
              <li
                key={f.label}
                data-reveal
                className={i > 0 ? "border-t border-line py-5 sm:border-t-0 sm:border-l sm:py-6 sm:pl-8" : "py-5 sm:py-6 sm:pr-8"}
              >
                <p className="hud text-muted">{f.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink">{f.value}</p>
              </li>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
