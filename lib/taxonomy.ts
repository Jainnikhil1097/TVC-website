// Fixed lists shared by the CMS (dropdown options) and the site. Changing these is
// a developer task: the portfolio map is laid out around these 8 sectors.
import type { FundId, PortfolioSectorId, Stage } from "./types";

export const portfolioSectors: { id: PortfolioSectorId; name: string }[] = [
  { id: "drone", name: "Drone" },
  { id: "industrial", name: "Industrial" },
  { id: "platforms", name: "Platforms" },
  { id: "utility-grid", name: "Utility / Grid" },
  { id: "renewables", name: "Renewables" },
  { id: "hydrogen", name: "Hydrogen" },
  { id: "mobility", name: "Mobility" },
  { id: "data-centers", name: "Data Centers" },
];

export const portfolioSectorName = (id: PortfolioSectorId) =>
  portfolioSectors.find((s) => s.id === id)?.name ?? id;

/** Which of our funds a portfolio company was backed from (the Portfolio page's fund filter). */
export const portfolioFunds: { id: FundId; name: string }[] = [
  { id: "pre-fund", name: "Pre Fund" },
  { id: "fund-1", name: "Fund I" },
  { id: "fund-2", name: "Fund II" },
];

export const portfolioFundName = (id: FundId) => portfolioFunds.find((f) => f.id === id)?.name ?? id;

export const stages: Stage[] = ["Pre-Seed", "Seed", "Pre-Series A", "Series A", "TBD"];

export const companyStatuses = [
  { value: "active", label: "Active" },
  { value: "exited", label: "Exited" },
  { value: "acquired", label: "Acquired" },
] as const;

export const fundStatuses = [
  { value: "raising", label: "Raising" },
  { value: "investing", label: "Investing" },
  { value: "deployed", label: "Fully deployed" },
  { value: "closed", label: "Closed" },
] as const;

// Teams on the About page, in display order (the team's order, Nov 2026).
// Capital Formation sits within Investor Relations (their titles say so).
// "executive" is the old catch-all, kept so older entries stay valid until re-sorted.
export const teamGroupOptions = [
  { value: "founding", label: "Founding Team" },
  { value: "advisors", label: "Sector Advisors & Experts" },
  { value: "investments", label: "Investments" },
  { value: "investor-relations", label: "Investor Relations" },
  { value: "portfolio-investments", label: "Portfolio Investments & Engagements" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "marketing", label: "PR, Marketing & Events" },
  { value: "executive", label: "Executive Team (unsorted)" },
] as const;

/**
 * The colour square behind each team's portraits on the About page: one colour per team
 * (from the team, Nov 2026). Unlisted teams fall back to white.
 */
export const teamColours: Record<string, string> = {
  founding: "#ffffff",
  advisors: "#ffffff",
  investments: "#8ec5ff", // blue
  "investor-relations": "#ffa24c", // orange (the brand spectrum's amber)
  "portfolio-investments": "#7fd3a8", // green
  finance: "#0ed5c2", // Signal Teal
  hr: "#cbbcf6", // light purple
  marketing: "#ffffff",
};

export const pageKeys = [
  { key: "home", label: "Home", path: "/" },
  { key: "about", label: "About", path: "/about" },
  { key: "portfolio", label: "Portfolio", path: "/portfolio" },
  { key: "perspectives", label: "Perspectives", path: "/perspectives" },
  { key: "impact", label: "Impact", path: "/impact" },
  { key: "giftCity", label: "GIFT City", path: "/gift-city" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;

export type PageKey = (typeof pageKeys)[number]["key"];
