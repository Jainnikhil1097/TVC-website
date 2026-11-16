"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { Callout, Company } from "@/lib/types";
import { cn } from "@/lib/utils";

// Annotated product renders, shared by the home page spotlight and the company profile.
// The render sits on a light "datasheet" plate (white backgrounds disappear into it via
// multiply), with numbered hotspots. The active hotspot shows a label on a leader line
// (sm and up); the numbered legend below is the accessible control on every screen size.

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Light plate with a faint navy grid, used for product renders and their fallbacks. */
function Plate({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl bg-surface", className)}
      style={{
        backgroundImage:
          "linear-gradient(rgb(10 30 63 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(10 30 63 / 0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {children}
    </div>
  );
}

type StageProps = {
  company: Company;
  active: number;
  onActive: (i: number) => void;
  /** Image `sizes` hint. */
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * The product image with hotspots, or — without a product render — the cover photo, or
 * the company's logo or name on the plate.
 */
export function ProductStage({ company, active, onActive, sizes, priority, className }: StageProps) {
  const image = company.productImage;
  const callouts = image ? (company.callouts ?? []) : [];

  if (!image) {
    if (company.coverImage) {
      const focal = company.coverImage.focal;
      return (
        <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-800", className)}>
          <Image
            src={company.coverImage.url}
            alt={company.coverImage.alt || company.name}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
            style={focal ? { objectPosition: `${focal.x}% ${focal.y}%` } : undefined}
          />
        </div>
      );
    }
    return (
      <Plate className={cn("grid aspect-[4/3] place-items-center", className)}>
        {company.logo ? (
          <span className="relative block h-20 w-3/5">
            <Image src={company.logo.url} alt={company.logo.alt || company.name} fill sizes="320px" className="object-contain" />
          </span>
        ) : (
          <span className="display px-8 text-center text-4xl text-ink/85 sm:text-5xl">{company.name}</span>
        )}
      </Plate>
    );
  }

  const ratio = image.width && image.height ? image.width / image.height : 4 / 3;
  return (
    <Plate className={cn("aspect-[4/3]", className)}>
      {/* Inner box sized to the render's own aspect ratio, so callout x/y map exactly. */}
      <div className="absolute inset-[6%] grid place-items-center [container-type:size]">
        <div
          className="relative"
          style={{ width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: String(ratio) } as CSSProperties}
        >
          <Image
            src={image.url}
            alt={image.alt || `${company.name} product`}
            fill
            priority={priority}
            sizes={sizes}
            className="object-contain mix-blend-multiply"
          />
          {callouts.map((c, i) => (
            <Hotspot key={i} callout={c} index={i} active={i === active} onActive={() => onActive(i)} />
          ))}
        </div>
      </div>
    </Plate>
  );
}

function Hotspot({ callout, index, active, onActive }: { callout: Callout; index: number; active: boolean; onActive: () => void }) {
  // Labels open away from the nearer edge so they stay on the plate.
  const toLeft = callout.x > 55;
  return (
    <div
      className="absolute"
      style={{ left: `${callout.x}%`, top: `${callout.y}%`, zIndex: active ? 2 : 1 }}
    >
      {/* Pointer target only; the legend is the keyboard and screen-reader control. */}
      <span
        aria-hidden
        onPointerEnter={onActive}
        onClick={onActive}
        className={cn(
          "absolute top-0 left-0 grid size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full font-mono text-[0.625rem] font-semibold transition-colors",
          active ? "bg-ink text-aqua" : "bg-white text-ink shadow-[0_2px_10px_rgb(10_30_63/0.18)] ring-1 ring-ink/15 hover:bg-ink hover:text-aqua"
        )}
      >
        {!active && <span className="callout-ping absolute inset-0 rounded-full ring-2 ring-teal/60" />}
        {pad(index)}
      </span>

      {active && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute top-0 hidden -translate-y-1/2 items-center sm:flex", toLeft ? "right-0 flex-row-reverse" : "left-0")}
        >
          <span className={cn("callout-line block h-px w-12 bg-ink", toLeft ? "mr-3.5 origin-right" : "ml-3.5 origin-left")} />
          <span className="callout-label block w-max max-w-[13rem] rounded-xl bg-white px-3.5 py-2.5 text-left shadow-[0_10px_30px_rgb(10_30_63/0.16)] ring-1 ring-ink/10">
            <span className="block text-[0.8125rem] leading-snug font-semibold text-ink">{callout.label}</span>
            {callout.detail && <span className="mt-0.5 block text-xs leading-snug text-muted">{callout.detail}</span>}
          </span>
        </span>
      )}
    </div>
  );
}

type LegendProps = {
  callouts: Callout[];
  active: number;
  onActive: (i: number) => void;
  tone?: "light" | "dark";
  className?: string;
};

/** Numbered list of callouts; hovering or focusing one highlights its hotspot. */
export function CalloutLegend({ callouts, active, onActive, tone = "light", className }: LegendProps) {
  if (!callouts.length) return null;
  const dark = tone === "dark";
  const current = callouts[Math.min(active, callouts.length - 1)];
  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-2" aria-label="Inside the product">
        {callouts.map((c, i) => {
          const on = i === active;
          return (
            <li key={i}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onActive(i)}
                onPointerEnter={() => onActive(i)}
                onFocus={() => onActive(i)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-left text-[0.8125rem] transition-colors",
                  dark
                    ? on
                      ? "border-teal bg-teal/10 text-white"
                      : "border-white/15 text-ink-200 hover:border-white/40 hover:text-white"
                    : on
                      ? "border-ink bg-ink text-white"
                      : "border-line text-ink/80 hover:border-ink/40"
                )}
              >
                <span className={cn("font-mono text-[0.625rem]", dark ? "text-teal" : on ? "text-aqua" : "text-teal-ink")}>{pad(i)}</span>
                {c.label}
              </button>
            </li>
          );
        })}
      </ul>
      {/* Phones don't show the floating label, so the active detail is spelled out here. */}
      {current.detail && (
        <p aria-live="polite" className={cn("mt-3 text-sm sm:hidden", dark ? "text-ink-200" : "text-muted")}>
          {current.detail}
        </p>
      )}
    </div>
  );
}

/** Stage + legend with their own state — for places that show a single company. */
export function ProductCallouts({ company, sizes, tone = "light" }: { company: Company; sizes: string; tone?: "light" | "dark" }) {
  const [active, setActive] = useState(0);
  if (!company.productImage) return null;
  return (
    <div>
      <ProductStage company={company} active={active} onActive={setActive} sizes={sizes} />
      <CalloutLegend callouts={company.callouts ?? []} active={active} onActive={setActive} tone={tone} className="mt-4" />
    </div>
  );
}
