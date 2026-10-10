export type PerspectiveCard = {
  id: string;
  /** Small label above the title, e.g. "Substack" or "The Economic Times · 30 Jul 2026". */
  eyebrow: string;
  title: string;
  teaser?: string;
  href: string;
  /** Call-to-action label at the card foot. */
  action: string;
  /** Related portfolio company name(s), shown as a HUD tag. */
  tag?: string;
  /** Optional cover image (reports, events, essays with artwork). */
  image?: { url: string; alt: string };
};

export type PerspectiveTab = {
  id: string;
  label: string;
  items: PerspectiveCard[];
  /** True when the tab only holds a signpost card (no real items yet) — hides the count. */
  placeholder?: boolean;
};
