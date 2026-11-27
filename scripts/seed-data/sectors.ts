import type { PortfolioSectorId } from "./types";

/** The investment themes (the home "Where we invest" grid), in display order. */
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
    line: "Decarbonising heat, cooling and process: the hardest emissions in Indian industry.",
    portfolioSector: "industrial",
  },
  {
    id: "built-environment",
    name: "Built Environment",
    line: "Efficient cooling, lighting and energy management for the buildings and cities India is yet to build.",
  },
  {
    id: "semiconductors",
    name: "Semiconductors",
    line: "Chips, wide-bandgap devices and substrates that make power conversion and sensing more efficient.",
  },
  {
    id: "power-electronics",
    name: "Power Electronics",
    line: "Converters, chargers and control that sit between every source and every load.",
  },
  {
    id: "renewable-tech",
    name: "Renewable Tech",
    line: "Technology that makes wind and solar assets generate more, for longer.",
    portfolioSector: "renewables",
  },
  {
    id: "energy-storage",
    name: "Energy Storage",
    line: "Safer, longer-lasting storage for vehicles, the grid and critical backup.",
  },
  {
    id: "alt-fuels",
    name: "Alt Fuels",
    line: "Hydrogen and alternative fuels, produced and used where industry needs them.",
    portfolioSector: "hydrogen",
  },
];
