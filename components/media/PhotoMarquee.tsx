import Image from "next/image";
import type { Image as CmsImage } from "@/lib/types";
import { cn } from "@/lib/utils";

type Photo = { image: CmsImage; caption?: string };

/**
 * A row of photos drifting slowly sideways, on a loop (the row is drawn twice so it never
 * runs out). Every photo keeps its own shape at one height. Pauses on hover or focus; with
 * reduced motion it stands still and scrolls by hand. CSS only (globals.css: .photo-marquee).
 */
export function PhotoMarquee({
  photos,
  className,
  height = "h-72 sm:h-96",
  secondsPerPhoto = 14,
  sizes = "600px",
}: {
  photos: Photo[];
  className?: string;
  /** Tailwind height classes for the row. */
  height?: string;
  /** Loop speed: higher is slower. */
  secondsPerPhoto?: number;
  sizes?: string;
}) {
  if (!photos.length) return null;
  const ratio = (img: CmsImage) => (img.width && img.height ? img.width / img.height : 1.5);
  const row = (copy: number) =>
    photos.map((p, i) => (
      <figure
        key={`${copy}-${i}`}
        aria-hidden={copy > 0 || undefined}
        className={cn("relative shrink-0 overflow-hidden rounded-3xl bg-surface", height)}
        style={{ aspectRatio: ratio(p.image) }}
      >
        <Image src={p.image.url} alt={copy > 0 ? "" : p.image.alt} fill sizes={sizes} className="object-cover" />
        {p.caption && (
          <figcaption className="hud absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-ink">{p.caption}</figcaption>
        )}
      </figure>
    ));

  return (
    <div className={cn("photo-marquee overflow-hidden", className)} role="region" tabIndex={0} aria-label="Team photos">
      <div className="photo-marquee-track flex w-max gap-4 pr-4" style={{ animationDuration: `${photos.length * secondsPerPhoto}s` }}>
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
