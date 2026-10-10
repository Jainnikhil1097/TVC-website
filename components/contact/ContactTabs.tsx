"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { enquiryTypes, type EnquiryType } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { StartupForm } from "./StartupForm";
import { InvestorForm } from "./InvestorForm";
import { PartnerForm } from "./PartnerForm";

const forms: Record<EnquiryType, () => React.JSX.Element> = {
  startup: StartupForm,
  investor: InvestorForm,
  partner: PartnerForm,
};

const isEnquiryType = (v: string | null): v is EnquiryType => enquiryTypes.some((t) => t.id === v);

/** Accessible tablist switching between the three enquiry forms. Panels stay mounted to keep input. */
export function ContactTabs({ initial = "startup" }: { initial?: EnquiryType }) {
  const [active, setActive] = useState<EnquiryType>(initial);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = enquiryTypes.findIndex((t) => t.id === active);
    const last = enquiryTypes.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(enquiryTypes[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Enquiry type"
        onKeyDown={onKeyDown}
        className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1"
      >
        {enquiryTypes.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cn(
                "min-h-11 flex-1 rounded-full px-4 text-[0.8rem] font-semibold whitespace-nowrap transition-colors",
                selected ? "bg-white text-ink-950" : "text-ink-200 hover:text-white"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {enquiryTypes.map((t) => {
        const Form = forms[t.id];
        return (
          <div
            key={t.id}
            id={`panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.id}`}
            hidden={t.id !== active}
            className="pt-7"
          >
            <p className="mb-6 text-sm leading-relaxed text-ink-300">{t.blurb}</p>
            <Form />
          </div>
        );
      })}
    </div>
  );
}

/** Reads ?type= so other pages can deep-link to a specific form. Wrap in <Suspense>. */
export function ContactTabsFromParams() {
  const type = useSearchParams().get("type");
  const initial = isEnquiryType(type) ? type : "startup";
  return <ContactTabs key={initial} initial={initial} />;
}
