import { cn } from "@/lib/utils";
import { BrandSymbol } from "@/components/ui/BrandSymbol";

/**
 * Stand-in for the Brand Book's primary logo (aqua symbol + "TRANSITION" wordmark)
 * until the official SVG is supplied. Replace the contents with it, keeping the props.
 * The wordmark inherits the text colour (black on light, white on dark bands).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 leading-none", className)} aria-label="Transition VC">
      <BrandSymbol className="size-[1.35rem] shrink-0 text-aqua" />
      <span aria-hidden className="font-display text-[1.15rem] font-bold tracking-[0.02em] uppercase">
        Transition
      </span>
    </span>
  );
}
