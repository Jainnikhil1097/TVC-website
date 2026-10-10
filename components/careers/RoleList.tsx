"use client";

import { useMemo, useState } from "react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RoleCard } from "./RoleCard";

const TVC = "Transition VC";
const companyOf = (role: Role) => role.company ?? TVC;

/**
 * Open roles with a company filter ("All", "Transition VC", then each portfolio
 * company hiring). The filter only appears when roles span more than one company.
 */
export function RoleList({ roles, email }: { roles: Role[]; email: string }) {
  const [active, setActive] = useState<string>("All");

  const companies = useMemo(() => {
    const names = [...new Set(roles.map(companyOf))];
    return names.sort((a, b) => (a === TVC ? -1 : b === TVC ? 1 : a.localeCompare(b)));
  }, [roles]);

  const visible = active === "All" ? roles : roles.filter((r) => companyOf(r) === active);

  if (roles.length === 0) {
    return (
      <p className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-ink-200">
        There are no open roles right now — share your CV below and we&rsquo;ll be in touch when something fits.
      </p>
    );
  }

  return (
    <>
      {companies.length > 1 && (
        <div role="group" aria-label="Filter roles by company" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5">
          {["All", ...companies].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={active === name}
              onClick={() => setActive(name)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors",
                active === name
                  ? "border-teal bg-teal/10 text-white"
                  : "border-white/12 text-ink-200 hover:border-white/30 hover:text-white"
              )}
            >
              {name}
              <span className="ml-2 text-xs text-ink-400">
                {name === "All" ? roles.length : roles.filter((r) => companyOf(r) === name).length}
              </span>
            </button>
          ))}
        </div>
      )}
      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visible.map((role) => (
          <li key={`${role.title}-${companyOf(role)}`}>
            <RoleCard role={role} email={email} />
          </li>
        ))}
      </ul>
    </>
  );
}
