// Line icons for the home page's "Where we invest" sectors. Editors can pick one per
// sector in the CMS; when none is picked, it's chosen from the sector's name.
export const sectorIcons = [
  { value: "mobility", label: "Mobility (car)", match: /mobility|vehicle|transport|ev\b/i },
  { value: "industrial", label: "Industrial (factory)", match: /industr|manufactur/i },
  { value: "built", label: "Built environment (building)", match: /built|building|cit(y|ies)|real estate/i },
  { value: "semiconductors", label: "Semiconductors (chip)", match: /semiconductor|chip/i },
  { value: "electronics", label: "Power electronics (circuit board)", match: /electronic|converter|power/i },
  { value: "renewables", label: "Renewables (wind turbine)", match: /renewable|solar|wind/i },
  { value: "storage", label: "Energy storage (battery)", match: /storage|batter/i },
  { value: "fuels", label: "Alternative fuels (flask)", match: /fuel|hydrogen/i },
  { value: "general", label: "General (layers)", match: /$^/ },
] as const;

export type SectorIcon = (typeof sectorIcons)[number]["value"];

/** The picked icon, or the first one whose keywords match the sector's name. */
export function sectorIconFor(name: string, picked?: string | null): SectorIcon {
  if (picked && sectorIcons.some((i) => i.value === picked)) return picked as SectorIcon;
  return sectorIcons.find((i) => i.match.test(name))?.value ?? "general";
}
