// The fixed set of line icons editors can pick for "Why founders choose us"
// pillars. Kept small and on-brand; the component maps each id to an icon.
export const pillarIcons = [
  { value: "engineering", label: "Engineering (cog)" },
  { value: "research", label: "Research (microscope)" },
  { value: "india", label: "India (map pin)" },
  { value: "capital", label: "Capital (coins)" },
  { value: "long-term", label: "Long-term (hourglass)" },
  { value: "partnership", label: "Partnership (handshake)" },
  { value: "network", label: "Network" },
  { value: "speed", label: "Speed (lightning)" },
  { value: "industry", label: "Industry (factory)" },
  { value: "energy", label: "Energy (plug)" },
  { value: "growth", label: "Growth (sprout)" },
  { value: "focus", label: "Focus (target)" },
] as const;

export type PillarIcon = (typeof pillarIcons)[number]["value"];
