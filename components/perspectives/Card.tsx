import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PerspectiveCard } from "./types";
import { cn } from "@/lib/utils";

type CardProps = {
  item: PerspectiveCard;
  /** When false the card is visible but not interactive. */
  interactive?: boolean;
  className?: string;
};

/** A single perspective card. The title link is stretched over the whole card. */
export function Card({ item, interactive = true, className }: CardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[box-shadow,border-color] duration-300",
        interactive && "hover:border-ink/15 hover:shadow-[0_12px_32px_-12px_rgb(11_22_38/0.18)]",
        className
      )}
    >
      {item.image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-surface">
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

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <p className="hud text-teal-ink">{item.eyebrow}</p>
          <ArrowUpRight
            className="size-4 shrink-0 text-muted transition-colors group-hover:text-teal-ink"
            aria-hidden
          />
        </div>

        <h3 className={cn("font-serif text-xl leading-snug font-light text-ink sm:text-[1.4rem]", item.image ? "mt-3" : "mt-6")}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={interactive ? undefined : -1}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-teal-ink"
          >
            {item.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>

        {item.teaser && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{item.teaser}</p>}

        <div className="mt-auto flex items-center justify-between gap-4 pt-7">
          <span className="text-sm font-semibold text-ink transition-colors group-hover:text-teal-ink">{item.action}</span>
          {item.tag && (
            <span className="truncate rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink">{item.tag}</span>
          )}
        </div>
      </div>
    </article>
  );
}
