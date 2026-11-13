// Fixed lists shared by the CMS (dropdown options) and the site. Changing these is
// a developer task: the portfolio map is laid out around these 8 sectors.
import type { PortfolioSectorId, Stage } from "./types";

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

export const teamGroupOptions = [
  { value: "founding", label: "Founding Team" },
  { value: "executive", label: "Executive Team" },
  { value: "advisors", label: "Sector Experts & Advisors" },
] as const;

export const pageKeys = [
  { key: "home", label: "Home", path: "/" },
  { key: "about", label: "About", path: "/about" },
  { key: "portfolio", label: "Portfolio", path: "/portfolio" },
  { key: "perspectives", label: "Perspectives", path: "/perspectives" },
  { key: "impact", label: "Impact", path: "/impact" },
  { key: "giftCity", label: "GIFT City", path: "/gift-city" },
  { key: "funds", label: "Funds", path: "/funds" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;

export type PageKey = (typeof pageKeys)[number]["key"];
