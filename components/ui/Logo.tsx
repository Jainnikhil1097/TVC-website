import { cn } from "@/lib/utils";

/**
 * Placeholder wordmark until the official SVG logo is supplied.
 * Replace the contents with the supplied SVG, keeping the same props.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 leading-none", className)} aria-label="Transition VC">
      <span aria-hidden className="font-serif text-[1.05rem] font-normal tracking-[0.14em] uppercase">
        Transition
      </span>
      <span aria-hidden className="text-[0.95rem] font-bold tracking-[0.1em] text-teal">
        VC
      </span>
    </span>
  );
}
