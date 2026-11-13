// Fixed site identity and navigation — structural, so kept in code rather than the CMS.
import type { Link } from "./types";

export const siteIdentity = {
  name: "Transition VC",
  legalName: "Transition Venture Capital",
  title: "Transition VC | India's First Energy-Transition Venture Fund",
  description:
    "Investing early, catalytic capital in the future of energy for India. India's first energy-transition focused venture capital fund.",
  url: "https://www.transitionventurecapital.com",
} as const;

export const nav: Link[] = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Perspectives", href: "/perspectives" },
  { label: "Impact", href: "/impact" },
  { label: "Contact", href: "/contact" },
];

/** Secondary pages linked from the footer (and from the home page / About). */
export const footerLinks: Link[] = [
  { label: "Funds", href: "/funds" },
  { label: "GIFT City", href: "/gift-city" },
];

export const pitchHref = "/contact?type=startup";
