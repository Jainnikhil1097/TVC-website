"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Site } from "@/lib/cms";
import { cn } from "@/lib/utils";

type Office = Site["contact"]["offices"][number];

/**
 * Real, interactive Google Map of our offices, with a switch between them when there
 * is more than one. The pin is placed by Google from the street address (so it's
 * exact and follows any address change in the CMS). Shown muted to sit with the
 * site's palette, returning to full colour when the visitor interacts with it.
 * Lazy-loaded, so it costs nothing until it's scrolled into view.
 */
export function OfficeMap({ offices }: { offices: Office[] }) {
  const [index, setIndex] = useState(0);
  const office = offices[index] ?? offices[0];
  if (!office) return null;
  const query = encodeURIComponent(office.address.join(", "));
  const embed = `https://www.google.com/maps?q=${query}&z=16&output=embed`;
  return (
    <div className="group overflow-hidden rounded-3xl border border-line bg-white transition-colors focus-within:border-teal-ink/40 hover:border-teal-ink/40">
      {offices.length > 1 && (
        <div role="group" aria-label="Show office on the map" className="flex gap-1 border-b border-line p-1.5">
          {offices.map((o, i) => (
            <button
              key={o.name}
              type="button"
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "min-h-10 flex-1 rounded-full px-4 text-sm transition-colors",
                i === index ? "bg-ink text-white" : "text-muted hover:text-ink"
              )}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[16/10] border-b border-line bg-surface">
        <iframe
          key={office.name}
          src={embed}
          title={`Map showing the Transition VC office in ${office.name}, Bengaluru`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 size-full border-0 [filter:saturate(0.25)_contrast(1.04)] transition-[filter] duration-500 group-hover:[filter:none] group-focus-within:[filter:none]"
        />
      </div>
      <a
        href={office.mapUrl || `https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-between px-5 py-3 text-sm font-normal text-ink hover:text-teal-ink"
      >
        Open in Google Maps <ArrowUpRight className="size-4" aria-hidden />
      </a>
    </div>
  );
}
