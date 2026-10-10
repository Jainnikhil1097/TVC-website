import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Rounded, near-full-bleed hero card for the light pages (Arkitect / Nilsson references).
 * It starts just below the top edge so the fixed dark nav sits over the card, keeping
 * the nav's white text legible on a light page.
 */
export function HeroCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className="px-2 pt-2 sm:px-3 sm:pt-3">
      <div
        className={cn(
          "relative isolate flex min-h-[34rem] flex-col overflow-hidden rounded-[1.75rem] text-white sm:min-h-[40rem] lg:min-h-[44rem]",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}
