import type { Company } from "@/lib/types";

/** "Exited 2027" / "Acquired" — null for active companies. */
export function statusLabel(company: Company): string | null {
  if (company.status === "active") return null;
  const word = company.status === "acquired" ? "Acquired" : "Exited";
  return company.exitYear ? `${word} ${company.exitYear}` : word;
}

/** Related Substack essay for a company, matched on the server (see the portfolio page). */
export type CompanyEssay = { url: string; title?: string; teaser?: string };
