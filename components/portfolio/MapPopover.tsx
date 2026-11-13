"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioSectorName } from "@/lib/taxonomy";
import { hostname } from "@/lib/utils";
import { CompanyLogo, StatusBadge } from "./CompanyLogo";
import { statusLabel, type CompanyEssay } from "./status";

type Props = {
  company: Company;
  number: string;
  essay?: CompanyEssay;
  /** Where the company's label sits, as fractions (0–1) of the map's width and height. */
  anchor: { fx: number; fy: number };
  onClose: () => void;
  onOpenProfile: (slug: string) => void;
};

/** Id of the label button for a company, so focus can return to it when the card closes. */
export const mapLabelId = (slug: string) => `map-label-${slug}`;
export const MAP_POPOVER_ID = "map-popover";

const GAP = 12;
const EDGE = 16;

/**
 * Info card that opens beside a company on the portfolio map (like a map pin's info
 * window), so the map stays visible. It sits next to the company's label — to the
 * right, or to the left when there isn't room on the right — aligned to the label's
 * top in the upper half of the map and to its bottom in the lower half.
 */
export function MapPopover({ company, number, essay, anchor, onClose, onOpenProfile }: Props) {
  const card = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; openLeft: boolean } | null>(null);
  const openDown = anchor.fy < 0.5;

  // Place the card beside the label's actual box (labels vary in width), and keep it
  // there if the window is resized.
  useLayoutEffect(() => {
    const place = () => {
      const el = card.current;
      const label = document.getElementById(mapLabelId(company.slug));
      const box = el?.offsetParent?.getBoundingClientRect();
      if (!el || !label || !box) return;
      const l = label.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      // The map frame gives ~1.5rem of room either side of this box, ~5rem above and below.
      const minLeft = -EDGE;
      const maxLeft = box.width + EDGE - w;
      const spaceRight = maxLeft - (l.right - box.left + GAP);
      const spaceLeft = l.left - box.left - GAP - w - minLeft;
      // Open towards whichever side has room (right by default); then keep it inside.
      const openLeft = spaceRight < 0 && spaceLeft > spaceRight;
      const rawLeft = openLeft ? l.left - box.left - GAP - w : l.right - box.left + GAP;
      const rawTop = openDown ? l.top - box.top : l.bottom - box.top - h;
      setPos({
        left: Math.min(Math.max(rawLeft, minLeft), maxLeft),
        top: Math.min(Math.max(rawTop, -64), box.height - h + 64),
        openLeft,
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [company.slug, openDown]);

  // Move focus into the card so keyboard and screen-reader users land on it.
  useEffect(() => {
    card.current?.focus({ preventScroll: true });
  }, [company.slug]);

  // Esc closes and returns focus to the company's label; a click elsewhere closes.
  useEffect(() => {
    const close = (returnFocus: boolean) => {
      onClose();
      if (returnFocus) document.getElementById(mapLabelId(company.slug))?.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target || card.current?.contains(target)) return;
      // Clicking another company's label switches the card; that label handles it.
      if (target.closest("[data-map-label]")) return;
      close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [company.slug, onClose]);

  const status = statusLabel(company);
  const founders = company.founders?.map((f) => f.name).join(", ");

  return (
    <div
      ref={card}
      id={MAP_POPOVER_ID}
      role="dialog"
      data-theme="light"
      aria-labelledby="map-popover-title"
      tabIndex={-1}
      className="map-popover absolute z-[200] w-[21rem] rounded-2xl border border-line bg-white p-5 text-left shadow-[0_18px_50px_rgb(11_22_38/0.16)] outline-none"
      style={{
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        // Hidden for the one frame before it's measured, so it never flashes in the wrong place.
        visibility: pos ? "visible" : "hidden",
        transformOrigin: `${pos?.openLeft ? "right" : "left"} ${openDown ? "top" : "bottom"}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {company.logo ? (
            <CompanyLogo company={company} className="h-10 w-40" />
          ) : (
            <span aria-hidden className="grid size-10 place-items-center rounded-lg bg-surface font-serif text-sm text-ink">
              {company.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            document.getElementById(mapLabelId(company.slug))?.focus({ preventScroll: true });
          }}
          aria-label={`Close ${company.name}`}
          className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <p className="hud mt-4 text-teal-ink">
        {number} · {portfolioSectorName(company.sector)}
      </p>
      <h3 id="map-popover-title" className="mt-1.5 font-serif text-2xl leading-tight text-ink">
        {company.name}
      </h3>
      {status && <StatusBadge label={status} className="mt-2" />}
      <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">{company.summary}</p>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Stage</dt>
          <dd className="mt-0.5 font-medium text-ink">{company.stage}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Invested</dt>
          <dd className="mt-0.5 font-medium text-ink">{company.yearInvested}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted">Website</dt>
          <dd className="mt-0.5 truncate">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-teal-ink underline-offset-2 hover:underline"
            >
              {hostname(company.website)}
            </a>
          </dd>
        </div>
      </dl>
      {founders && <p className="mt-3 text-sm text-muted">Founded by {founders}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenProfile(company.slug)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-ink"
        >
          Full profile <ArrowRight className="size-3.5" aria-hidden />
        </button>
        {essay && (
          <Link
            href={essay.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ink/20 px-4 text-sm font-semibold text-ink transition-colors hover:border-teal-ink hover:text-teal-ink"
          >
            Investment note <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
