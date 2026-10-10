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
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Perspectives", href: "/perspectives" },
  { label: "Impact", href: "/impact" },
  { label: "GIFT City", href: "/gift-city" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];
