"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The cheque size with an INR / USD switch (About page hero). Both figures come from
 * CMS → Settings → Site settings; without a USD figure it's plain text.
 */
export function ChequeSize({ inr, usd, label }: { inr: string; usd: string; label: string }) {
  const [currency, setCurrency] = useState<"inr" | "usd">("inr");
  return (
    <>
      <dt className="flex items-center justify-between gap-4 text-sm text-ink-300">
        {label}
        {usd && (
          <span role="group" aria-label="Currency" className="-my-2 inline-flex rounded-full border border-white/20 p-0.5">
            {(["inr", "usd"] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={currency === c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "min-h-7 rounded-full px-2.5 text-xs font-bold tracking-wide transition-colors",
                  currency === c ? "bg-white text-ink" : "text-ink-300 hover:text-white"
                )}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </span>
        )}
      </dt>
      <dd className="mt-1 font-display text-xl text-white" aria-live="polite">
        {currency === "usd" && usd ? usd : inr}
        {currency === "usd" && usd && <span className="ml-2 align-middle text-xs font-normal text-ink-300">approx.</span>}
      </dd>
    </>
  );
}
