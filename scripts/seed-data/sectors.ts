import type { PortfolioSectorId } from "./types";

/** The eight investment themes — these are the "planets" in the home hero. */
export type InvestmentSector = {
  id: string;
  name: string;
  /** One-line description shown under the planet name. Draft copy — confirm with TVC. */
  line: string;
  /** Portfolio filter the planet's CTA deep-links to, if one maps cleanly. */
  portfolioSector?: PortfolioSectorId;
};

export const investmentSectors: InvestmentSector[] = [
  {
    id: "mobility",
    name: "Mobility",
    line: "Motors, drivetrains and batteries that make electric the default for how India moves.",
    portfolioSector: "mobility",
  },
  {
    id: "industrial",
    name: "Industrial",
    line: "Decarbonising heat, cooling and process — the hardest emissions in Indian industry.",
    portfolioSector: "industrial",
  },
  {
    id: "renewable-tech",
    name: "Renewable Tech",
    line: "Technology that makes wind and solar assets generate more, for longer.",
    portfolioSector: "renewables",
  },
  {
    id: "alt-fuels",
    name: "Alt Fuels",
    line: "Hydrogen and alternative fuels, produced and used where industry needs them.",
    portfolioSector: "hydrogen",
  },
  {
    id: "energy-storage",
    name: "Energy Storage",
    line: "Safer, longer-lasting storage for vehicles, the grid and critical backup.",
  },
  {
    id: "power-electronics",
    name: "Power Electronics",
    line: "Converters, substrates and control that sit between every source and every load.",
  },
  {
    id: "buildings",
    name: "Buildings",
    line: "Efficient cooling, lighting and energy management for the buildings India is yet to build.",
  },
  {
    id: "sustainability",
    name: "Sustainability",
    line: "Data, carbon and ESG platforms that make climate outcomes measurable and investable.",
    portfolioSector: "platforms",
  },
];

/** Filters used on the portfolio page (as on the current site, spelling fixed). */
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
