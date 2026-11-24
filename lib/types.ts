// Site-facing content shapes. lib/cms.ts maps CMS documents (payload-types.ts)
// onto these, so components never depend on the CMS's internal structure.

export type Link = { label: string; href: string };

export type Image = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  /** Focal point set in the CMS, as percentages (for object-position). */
  focal?: { x: number; y: number };
};

export type Metric = {
  value: string;
  label: string;
  note?: string;
  /** Picked as a headline figure for the home page. */
  showOnHome?: boolean;
};

export type Person = {
  name: string;
  title?: string;
  linkedin?: string;
  /** Image URL. Falls back to initials. */
  photo?: string;
  bio?: string;
  /** "Known for" points (no longer shown). */
  highlights?: string[];
  /** Founders: logo strips under the bio, each with an optional heading. */
  logoRows?: { heading?: string; image: Image }[];
};

export type PortfolioSectorId =
  | "drone"
  | "industrial"
  | "platforms"
  | "utility-grid"
  | "renewables"
  | "hydrogen"
  | "mobility"
  | "data-centers";

export type FundId = "pre-fund" | "fund-1" | "fund-2";

export type Stage = "Pre-Seed" | "Seed" | "Pre-Series A" | "Series A" | "TBD";

export type CompanyStatus = "active" | "exited" | "acquired";

export type Company = {
  slug: string;
  name: string;
  summary: string;
  sector: PortfolioSectorId;
  stage: Stage;
  yearInvested: number;
  /** The fund it was backed from. */
  fund: FundId;
  website: string;
  status: CompanyStatus;
  exitYear?: number;
  exitNote?: string;
  featured?: boolean;
  /** Position among the featured companies on the home page (1 first). */
  homeOrder?: number;
  founders?: Person[];
  /** Falls back to a serif wordmark. */
  logo?: Image;
  /** Product/team photo for the home page's featured tabs. */
  coverImage?: Image;
  whyWeInvested?: string;
  /** Substack post about this company; links the company and the essay. */
  essayUrl?: string;
  videoUrl?: string;
  // One-pager (public-safe subset: no revenue, fundraising or return figures).
  /** Clean product render, annotated with callouts. */
  productImage?: Image;
  callouts?: Callout[];
  /** Headline number for the home page proof band. */
  proof?: { value: string; label: string };
  deployment?: string;
  customers?: string;
  marketGap?: string;
  breakthrough?: string;
  traction?: string[];
  marketOpportunity?: string;
  whyTheyWin?: string;
  /** Impact page view (CMS → company → Impact tab), when shown there. */
  impact?: CompanyImpact;
};

export type ImpactMetric = { label: string; value?: string; unit?: string; evidence?: string; note?: string };

export type CompanyImpact = {
  featured: boolean;
  order: number;
  sectorLabel?: string;
  stage?: string;
  period?: string;
  tagline?: string;
  image?: Image;
  metrics: ImpactMetric[];
  closer?: { value: string; text?: string };
  evidence?: string;
  sources?: string;
};

/** A label pointing at part of a product image; x/y are percentages of the image. */
export type Callout = { label: string; detail?: string; x: number; y: number };

export type FundStatus = "raising" | "investing" | "deployed" | "closed";

export type Fund = {
  name: string;
  size?: string;
  status: FundStatus;
  description?: string;
  showOnHome?: boolean;
  category: string;
  sebiRegistration: string;
  manager: string;
};

export type Essay = {
  title: string;
  teaser: string;
  url: string;
  /** ISO date. */
  date?: string;
  image?: string;
  /** Portfolio company slug, when a company links to this essay. */
  company?: string;
};

export type Video = { title: string; url: string; date?: string; thumbnail?: string };

export type NewsItem = {
  date: string; // ISO
  title: string;
  source: string;
  url: string;
};

export type EventItem = {
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  image?: Image;
  link?: string;
};

export type Report = {
  title: string;
  date: string;
  summary?: string;
  cover?: Image;
  /** PDF download or external link. */
  href?: string;
  isPdf: boolean;
  companies: string[];
};

