// Default wording for the page-copy globals (CMS → Pages). Used as the fields' default
// values in the CMS and as the site's fallback while a field is empty, so the two
// never drift apart.

export const portfolioPageDefaults = {
  eyebrow: "Portfolio",
  headline: "The companies engineering India's energy future",
  intro: "Engineering-led companies we back across India's energy transition. Building in energy? We'd like to hear from you.",
  ctaLabel: "Pitch to us",
  ctaHref: "/contact?type=startup",
  activeLabel: "Active companies",
  sectorsLabel: "Sectors",
  stagesLabel: "Stages",
};

export const aboutPageDefaults = {
  eyebrow: "About us",
  headline: "India's first energy-transition venture fund",
  approachEyebrow: "Our approach",
  teamEyebrow: "The team",
  teamHeading: "The people behind the fund",
  nextSteps: [
    { eyebrow: "Founders", title: "Pitch to us", body: "Building in energy? Share your deck. We read every one.", href: "/contact?type=startup" },
    { eyebrow: "Impact", title: "Our impact", body: "How our portfolio is decarbonising industry, mobility and the grid.", href: "/impact" },
    { eyebrow: "Contact", title: "Get in touch", body: "Investors, partners and press: we'd like to hear from you.", href: "/contact" },
  ],
};

export const perspectivesPageDefaults = {
  eyebrow: "Perspectives",
  headline: "Ideas behind the investments",
  intro: "Perspectives on India’s energy transition, straight from our newsletter.",
  substackLabel: "Subscribe on Substack",
  youtubeLabel: "Watch on YouTube",
  indexEyebrow: "Index",
  indexHeading: "Everything we’ve published",
};
