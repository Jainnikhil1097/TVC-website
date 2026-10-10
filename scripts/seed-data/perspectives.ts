import type { Essay, NewsItem } from "./types";

export const substackUrl = "https://transitionventurecapital.substack.com";
export const youtubeUrl = "https://www.youtube.com/@TransitionVentureCapital";

// Newest first. Individual Substack URLs aren't on the current site — add `url` when known;
// until then cards link to the Substack home.
export const essays: Essay[] = [
  {
    slug: "drone-without-pilot",
    title: "What Happens When a Drone Stops Needing a Pilot?",
    teaser: "Why vision-based autonomy changes the economics of drones — and why we backed SUIND.",
    company: "suind",
  },
  {
    slug: "drone-story-part-2",
    title: "The Drone Story That Nobody Gets Right, Part II",
    teaser: "Localisation is the next bottleneck in the drone stack.",
  },
  {
    slug: "cooling-bottleneck",
    title: "The Cooling Bottleneck Inside Industrial India",
    teaser: "The winners will move heat, humidity and air more intelligently than today's HVAC.",
  },
  {
    slug: "helionis-hottest-layer",
    title: "Helionis Labs: Fixing the Hottest Layer in Modern Lighting",
    teaser: "Our investment note on printed insulated-metal substrates.",
    company: "helionis-labs",
  },
  {
    slug: "thermal-bottleneck-lighting",
    title: "The Thermal Bottleneck Inside Modern Lighting",
    teaser: "LEDs solved the energy-efficiency problem in lighting — and intensified the heat problem.",
  },
  {
    slug: "drone-huawei-moment",
    title: "The Drone Industry Just Hit Its Huawei Moment",
    teaser: "The case for full-stack, non-Chinese UAV avionics — and ZeroDrag.",
    company: "zerodrag",
  },
  {
    slug: "drone-story-part-1",
    title: "The Drone Story That Nobody Gets Right, Part I",
    teaser: "The drone market will be won at the electronics layer, not the airframe.",
  },
  {
    slug: "why-we-backed-prithu",
    title: "From India's Fields to Global Credits: Why We Backed Prithu",
    teaser: "Regenerative agriculture, digital MRV, and our ₹10 Cr seed investment.",
    company: "prithu",
  },
  {
    slug: "carbon-verifiable-supply",
    title: "The Missing Layer in Carbon Markets: Verifiable Supply",
    teaser: "Part 2 of 2 — what it takes to make carbon credits underwriteable.",
  },
  {
    slug: "carbon-data-crisis",
    title: "Carbon Credits' Data Crisis: Why Trust Broke and Demand Didn't",
    teaser: "Part 1 of 2 — measurement, baselines and the collapse of trust.",
  },
  {
    slug: "rewiring-the-grid",
    title: "Rewiring the Grid: The System Behind the Energy Transition",
    teaser: "Utility software as the orchestration layer of the grid — and WorkOnGrid.",
    company: "workongrid",
  },
  {
    slug: "engineering-carbon-economy",
    title: "Engineering the Carbon Economy",
    teaser: "Algae-based CO₂ utilisation, and the thesis behind Intrinsic Foundries.",
    company: "intrinsic-foundries",
  },
  {
    slug: "cooling-as-infrastructure",
    title: "Cooling as Energy Infrastructure: The Case for Albatross Energetics",
    teaser: "Non-toxic liquid-desiccant cooling for Indian factories.",
    company: "albatross-energetics",
  },
];

export const news: NewsItem[] = [
  {
    date: "2026-07-30",
    title: "Drone startup SUIND raises Rs 20.5 crore funding from Transition VC, IIMA Ventures",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/startups/drone-startup-suind-raises-rs-20-5-crore-funding-from-transition-vc-iima-ventures/articleshow/132730252.cms",
  },
  {
    date: "2026-07-21",
    title: "Transition VC launches Rs 1,500 Cr Fund II to back energy tech startups",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/startups/transition-vc-opens-rs-1500-crore-fund-ii-for-energy-tech-firms/articleshow/132522882.cms",
  },
  {
    date: "2026-07-02",
    title: "Albatross Energetics secures $1.05 million funding for energy-efficient cooling solutions",
    source: "ET Entrepreneur",
    url: "https://entrepreneur.economictimes.indiatimes.com/news/funding/albatross-energetics-secures-105-million-funding-for-revolutionary-energy-efficient-cooling-solutions/132106174",
  },
];

/** YouTube videos / podcast episodes — none listed on the current site yet. */
export const videos: { title: string; url: string; thumbnail?: string }[] = [];
export const podcasts: { title: string; url: string }[] = [];
