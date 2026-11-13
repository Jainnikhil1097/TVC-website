import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline Substack signup with no third-party script: a plain form that opens
 * Substack's own subscribe page with the email pre-filled (Substack sends the
 * confirmation email, so there's no list to manage here).
 */
export function NewsletterForm({ substackUrl, className }: { substackUrl: string; className?: string }) {
  const action = new URL("/subscribe", substackUrl).toString();
  return (
    <form action={action} method="get" target="_blank" className={cn("flex w-full max-w-md flex-col gap-3 sm:flex-row", className)}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-5 text-[0.95rem] text-white placeholder:text-white/40 focus:border-teal focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[0.9rem] font-semibold text-ink transition-colors hover:bg-teal-soft"
      >
        Subscribe <ArrowRight className="size-4" aria-hidden />
      </button>
    </form>
  );
}
