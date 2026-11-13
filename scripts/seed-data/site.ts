// Original content from the first build, imported into the CMS by scripts/seed.ts.
// The website never reads these files — edit content in the CMS at /admin instead.
import type { Fund, Link, Metric } from "./types";

export const site = {
  name: "Transition VC",
  legalName: "Transition Venture Capital",
  title: "Transition VC | India's First Energy-Transition Venture Fund",
  description:
    "Investing early, catalytic capital in the future of energy for India. India's first energy-transition focused venture capital fund.",
  url: "https://www.transitionventurecapital.com",
  tagline: "Engineering India's Future of Energy",
  hero: "Investing early, catalytic capital in the future of energy for India.",
  about:
    "India's first energy-transition focused venture capital fund. We back engineering-led startups building across storage, mobility, industrial decarbonisation and alternate fuels — because climate-aligned companies win, on impact and returns.",
  approach:
    "We underwrite the engineering, choose the outliers, and back the ones building what India actually needs.",
  thesis:
    "We look for platforms that own a specific layer of the stack, are built on India-first cost structures, and do not depend solely on subsidies, sentiment, or regulatory timing.",
  footerHeadline: "Join the builders of India's energy future",
  newsletterBlurb: "Insights from India's energy-transition venture fund.",

  /** External investor portal. TODO: confirm URL with Transition VC. */
  investorLoginUrl: "",

  contact: {
    email: "info@transitionventurecapital.com",
    address: ["117, 1st B Cross Rd, Domlur", "Bengaluru, Karnataka 560071"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=117+1st+B+Cross+Rd+Domlur+Bengaluru+560071",
  },

  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/transition-vc/" },
    { label: "YouTube", href: "https://www.youtube.com/@TransitionVentureCapital" },
    { label: "Instagram", href: "https://www.instagram.com/transition_vc/" },
    { label: "Substack", href: "https://transitionventurecapital.substack.com" },
  ] satisfies Link[],

  /** Policy PDFs go in /public/docs. TODO: obtain files from Transition VC. */
  policies: [
    { label: "Cookies", href: "/docs/cookies.pdf" },
    { label: "Disclaimer", href: "/docs/disclaimer.pdf" },
    { label: "Privacy Policy", href: "/docs/privacy-policy.pdf" },
    { label: "Copyright", href: "/docs/copyright.pdf" },
  ] satisfies Link[],

  nav: [
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Perspectives", href: "/perspectives" },
    { label: "Impact", href: "/impact" },
    { label: "GIFT City", href: "/gift-city" },
    { label: "Contact", href: "/contact" },
  ] satisfies Link[],
} as const;

export const metrics: Metric[] = [
  { value: "₹723 Cr", label: "Fund I raised", note: "Oversubscribed, closed" },
  { value: "57%", label: "Capital deployed" },
  { value: "19", label: "Active portfolio companies" },
  { value: "0", label: "Write-offs" },
  { value: "57%", label: "Gross IRR", note: "As of 31-03-2026 · top 5% globally" },
  { value: "3X", label: "MOIC", note: "Expected in year 3 of fund life" },
];

export const investmentCriteria = {
  stage: "Pre-Seed to Series A",
  cheque: "$0.5M – $5M",
};

export const funds: Fund[] = [
  {
    name: "Transition Venture Capital Fund I",
    category: "CAT II AIF",
    sebiRegistration: "IN/AIF2/22-23/1174",
    manager: "Transition Investment Manager LLP",
  },
  {
    name: "Transition Venture Capital Fund II",
    category: "CAT II AIF",
    sebiRegistration: "IN/AIF2/26-27/2146",
    manager: "Transition Asset Management LLP",
  },
  {
    name: "Transition VC Angel Fund",
    category: "CAT I Angel Fund",
    sebiRegistration: "IN/AIF1/23-24/1335",
    manager: "Flux Investment Manager LLP",
  },
  {
    name: "Transition VC Opportunities Fund I",
    category: "CAT II AIF",
    sebiRegistration: "IN/AIF2/26-27/2289",
    manager: "Transition Asset Management LLP",
  },
];
