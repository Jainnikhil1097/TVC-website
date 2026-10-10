import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PerspectiveCard } from "./types";
import { cn } from "@/lib/utils";

type CardProps = {
  item: PerspectiveCard;
  /** When false the card is visible but not interactive (off-centre in the 3D carousel). */
  interactive?: boolean;
  className?: string;
};

/** A single perspective card. The title link is stretched over the whole card. */
export function Card({ item, interactive = true, className }: CardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-3xl border border-white/10 bg-ink-900/75 p-6 backdrop-blur-md transition-colors duration-500 sm:p-7",
        interactive && "hover:border-teal/40",
        className
      )}
    >
      {item.image && (
        <div className="relative -mx-2 -mt-2 mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-ink-800 sm:-mx-3 sm:-mt-3">
          <Image
            src={item.image.url}
            alt={item.image.alt}
            fill
            sizes="(min-width: 1024px) 420px, 85vw"
            className="object-cover"
            // Substack/YouTube artwork comes from third-party CDNs; serve it as-is.
            unoptimized={/^https?:/.test(item.image.url) && !item.image.url.includes(".blob.vercel-storage.com")}
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <p className="hud text-ink-300">{item.eyebrow}</p>
        <ArrowUpRight className="size-4 shrink-0 text-ink-300" aria-hidden />
      </div>

      <h3
        className={cn(
          "font-serif text-xl leading-snug font-light text-white sm:text-2xl",
          item.image ? "mt-4" : "mt-8"
        )}
      >
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={interactive ? undefined : -1}
          className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-teal"
        >
          {item.title}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </h3>

      {item.teaser && <p className="mt-4 text-sm leading-relaxed text-ink-300">{item.teaser}</p>}

      <div className="mt-auto flex items-center justify-between gap-4 pt-8">
        <span className="eyebrow text-[0.66rem] text-white">{item.action}</span>
        {item.tag && (
          <span className="hud rounded-full border border-teal/30 px-2.5 py-1 text-[0.6rem] text-teal">
            {item.tag}
          </span>
        )}
      </div>
    </article>
  );
}
