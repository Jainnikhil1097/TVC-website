// Site-facing content shapes. lib/cms.ts maps CMS documents (payload-types.ts)
// onto these, so components never depend on the CMS's internal structure.

export type Link = { label: string; href: string };

export type Image = { url: string; alt: string; width?: number; height?: number };

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

export type Stage = "Pre-Seed" | "Seed" | "Pre-Series A" | "Series A" | "TBD";

export type CompanyStatus = "active" | "exited" | "acquired";

export type Company = {
  slug: string;
  name: string;
  summary: string;
  sector: PortfolioSectorId;
  stage: Stage;
  yearInvested: number;
  website: string;
  status: CompanyStatus;
  exitYear?: number;
  exitNote?: string;
  featured?: boolean;
  founders?: Person[];
  /** Falls back to a serif wordmark. */
  logo?: Image;
  /** Product/team photo for the home page's featured tabs. */
  coverImage?: Image;
  whyWeInvested?: string;
  /** Substack post about this company; links the company and the essay. */
  essayUrl?: string;
  videoUrl?: string;
};

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

