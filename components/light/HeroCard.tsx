import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed dark hero for the Impact and GIFT City pages, in the same ink as every
 * other page's top band. Marked `data-nav-dark` so the fixed nav switches to its
 * transparent, white-text style while it sits over it.
 */
export function HeroCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section>
      <div
        data-theme="dark"
        data-nav-dark
        className={cn(
          "relative isolate flex min-h-[34rem] flex-col overflow-hidden bg-ink text-white sm:min-h-[40rem] lg:min-h-[44rem]",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}
