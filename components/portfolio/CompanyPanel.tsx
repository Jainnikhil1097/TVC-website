"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, X } from "lucide-react";
import type { Company } from "@/lib/types";
import { portfolioSectorName } from "@/lib/taxonomy";
import { AccentRule } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { hostname } from "@/lib/utils";
import { CompanyLogo, StatusBadge } from "./CompanyLogo";
import { statusLabel, type CompanyEssay } from "./status";

gsap.registerPlugin(useGSAP);

type CompanyPanelProps = {
  company: Company;
  number: string;
  /** Related Substack essay, if the company links to one. */
  essay?: CompanyEssay;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = () => window.matchMedia("(min-width: 64rem)").matches;

/**
 * Company profile dialog: right-hand sheet on desktop, bottom sheet on mobile.
 * Focus moves to the close button on open, is trapped inside, and returns to
 * the triggering element on close.
 */
export function CompanyPanel({ company, number, essay, onClose }: CompanyPanelProps) {
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  const status = statusLabel(company);
  const titleId = `company-${company.slug}-title`;

  const { contextSafe } = useGSAP(
    () => {
      if (reducedMotion()) return;
      const from = isDesktop() ? { xPercent: 100 } : { yPercent: 100 };
      gsap.from(sheet.current, { ...from, duration: 0.5, ease: "power3.out" });
      gsap.from(backdrop.current, { opacity: 0, duration: 0.4, ease: "power2.out" });
    },
    { scope: root }
  );

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (reducedMotion()) return onClose();
    contextSafe(() => {
      const to = isDesktop() ? { xPercent: 100 } : { yPercent: 100 };
      gsap.to(backdrop.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(sheet.current, { ...to, duration: 0.35, ease: "power3.in", onComplete: onClose });
    })();
  }, [contextSafe, onClose]);

  // Keep the latest close() for the key handler without re-running the mount effect.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  // Focus management, scroll lock, Esc and Tab trapping — once per open.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeBtn.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !sheet.current) return;
      const items = Array.from(sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      trigger?.focus?.({ preventScroll: true });
    };
  }, []);

  const facts = [
    { label: "Stage", value: company.stage === "TBD" ? "Undisclosed" : company.stage },
    { label: "Focus sector", value: portfolioSectorName(company.sector) },
    { label: "Year invested", value: String(company.yearInvested) },
  ];

  // Portalled to <body> so no transformed ancestor (e.g. a Reveal wrapper) can
  // become the containing block for this fixed overlay.
  return createPortal(
    <div ref={root} className="fixed inset-0 z-[70]" data-lenis-prevent>
      <div ref={backdrop} className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={close} aria-hidden />

      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-3xl border-t border-white/10 bg-ink-900 shadow-[0_-24px_80px_rgb(0_0_0/0.5)] lg:inset-y-0 lg:left-auto lg:max-h-none lg:w-[34rem] lg:rounded-none lg:rounded-l-3xl lg:border-t-0 lg:border-l"
      >
        {/* Grab handle (mobile) + header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-4 pb-2 sm:px-8 lg:pt-6">
          <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20 lg:hidden" />
          <p className="hud pt-2 text-teal">Company profile · {number}</p>
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="grid size-11 place-items-center rounded-full border border-white/12 text-white transition-colors hover:border-teal hover:text-teal"
            aria-label="Close company profile"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-6 pb-10 sm:px-8" data-lenis-prevent>
          <CompanyLogo company={company} size="lg" className="mt-4" />
          <h2 id={titleId} className="display mt-4 text-4xl sm:text-5xl">
            {company.name}
          </h2>
          {status && (
            <p className="mt-4 flex flex-wrap items-center gap-3">
              <StatusBadge label={status} />
              {company.exitNote && <span className="text-sm text-ink-300">{company.exitNote}</span>}
            </p>
          )}
          <AccentRule className="mt-6" />

          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-white/8 py-6">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="hud text-ink-400">{f.label}</dt>
                <dd className="mt-2 text-sm font-medium text-white">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <h3 className="eyebrow text-ink-400">About</h3>
            <p className="mt-3 leading-relaxed text-ink-200">{company.summary}</p>
          </section>

          {company.whyWeInvested && (
            <section className="mt-8">
              <h3 className="eyebrow text-ink-400">Why we invested</h3>
              <p className="mt-3 leading-relaxed text-ink-200">{company.whyWeInvested}</p>
            </section>
          )}

          {company.founders && company.founders.length > 0 && (
            <section className="mt-8">
              <h3 className="eyebrow text-ink-400">Founders</h3>
              <ul className="mt-4 space-y-3">
                {company.founders.map((f) => (
                  <li key={f.name} className="flex items-center gap-4">
                    <Avatar name={f.name} photo={f.photo} sizes="48px" className="size-12 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{f.name}</p>
                      {f.title && <p className="text-xs text-ink-400">{f.title}</p>}
                    </div>
                    {f.linkedin && (
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 text-xs text-ink-300 transition-colors hover:text-teal"
                        aria-label={`${f.name} on LinkedIn`}
                      >
                        LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {essay && (
            <section className="mt-8">
              <h3 className="eyebrow text-ink-400">{company.whyWeInvested ? "Read more" : "Why we invested"}</h3>
              <a
                href={essay.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-teal/50"
              >
                <span className="hud text-teal">From our Substack</span>
                <span className="mt-2 block font-serif text-lg font-light text-white">
                  {essay.title ?? "Read our investment note"}
                </span>
                {essay.teaser && <span className="mt-2 block text-sm text-ink-300">{essay.teaser}</span>}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-[0.08em] text-white uppercase group-hover:text-teal">
                  Read the essay <ArrowUpRight className="size-3.5" aria-hidden />
                </span>
              </a>
            </section>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href={company.website}>
              Visit {hostname(company.website)} <ArrowUpRight className="size-4" aria-hidden />
            </ButtonLink>
            {company.videoUrl && (
              <ButtonLink href={company.videoUrl} variant="outline">
                Watch video <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
            )}
            <ButtonLink href="/contact?type=startup" variant="ghost">
              Building something similar?
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
