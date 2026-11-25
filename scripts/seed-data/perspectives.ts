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
  // From the team's "In the media" list on the previous website (25 Nov 2026). Photos:
  // seed-data/news-photos/<photo>, fetched from photoUrl by npm run news:photos. Dates the
  // list didn't record are estimated from the article's ID; correct them in the CMS.
  {
    date: "2026-01-27",
    title: "Transition VC closes debut fund of ₹700 Cr",
    source: "CNBC-TV18",
    url: "https://www.youtube.com/watch?v=R499hzgb4r8",
    photo: "cnbc-fund-close.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/697871ca311d3f02c3c69020_Screenshot%202026-01-27%20at%201.35.25%E2%80%AFPM.png",
  },
  {
    date: "2025-12-09",
    title: "Early-stage investor Transition VC announces close of debut fund at Rs 700 crore",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/funding/early-stage-investor-transition-vc-announces-close-of-debut-fund-at-rs-700-crore/articleshow/125887053.cms",
    photo: "et-fund-close.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/69394c261fe54f6764f986c8_181A9219%201%20(1).png",
  },
  {
    date: "2025-11-15",
    title: "AI startup GreenFi secures USD 2 Mn from Transition VC",
    source: "Entrepreneur India",
    url: "https://www.entrepreneur.com/en-in/news-and-trends/ai-startup-greenfi-secures-usd-2-mn-from-transition-vc/499441",
    photo: "greenfi.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693174491b6e5cd24b4e0cd1_Greenfi.webp",
  },
  {
    date: "2025-10-28",
    title: "Green hydrogen startup Hydgen raises $5 million from Transition Venture Capital, others",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/funding/green-hydrogen-startup-hydgen-raises-5-million-from-transition-venture-capital-others/articleshow/124840361.cms",
    photo: "hydgen.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693174a10f6456c901015e2e_hydgen.webp",
  },
  {
    date: "2025-08-12",
    title: "Deeptech startup Comminent raises $2 million from Transition VC",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/funding/deeptech-startup-comminent-raises-2-million-from-transition-vc/articleshow/123273861.cms",
    photo: "comminent.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/69316ef33066d65bb53da35f_amarjeet_kumar_and_vikas_kashyap_co-founders_comminent.webp",
  },
  {
    date: "2025-07-02",
    title: "CIMware raises $2.3 m in round led by Transition VC",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/funding/cimware-raises-2-3-m-in-round-led-by-transition-vc/articleshow/122190613.cms",
    photo: "cimware.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693174db3f25e687a1f460e0_cimware.webp",
  },
  {
    date: "2025-05-15",
    title: "Promethean Energy raises USD 2 Mn funding to advance industrial decarbonisation",
    source: "Entrepreneur India",
    url: "https://www.entrepreneur.com/en-in/news-and-trends/promethean-energy-raises-usd-2-mn-funding-to-advance/492050",
    photo: "promethean.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/69317502e02542a61b004791_Promethean.webp",
  },
  {
    date: "2025-02-21",
    title: "Transition VC invests $1.7 million in deep-tech start-up Dynolt",
    source: "The Hindu",
    url: "https://www.thehindu.com/news/cities/bangalore/transition-vc-invests-17-million-in-deep-tech-start-up-dynolt-to-revolutionise-power-semiconductor-products/article69235535.ece",
    photo: "dynolt.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/69439faf928f4d5c7a1c7a43_Dynolt.jpg",
  },
  {
    date: "2025-01-15",
    title: "EMO Energy raises $6.2M in Series A funding",
    source: "YourStory",
    url: "https://yourstory.com/2025/01/emo-energy-raises-usd-62m-in-series-a-funding-",
    photo: "emo-energy.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/69317a8e12ccf708343775d2_Screenshot%202025-12-04%20at%205.41.54%E2%80%AFPM.png",
  },
  {
    date: "2024-12-18",
    title: "Fitsol secures $1 million seed funding to decarbonise manufacturing with AI",
    source: "ET Manufacturing",
    url: "https://manufacturing.economictimes.indiatimes.com/news/industry/fitsol-secures-1-million-seed-funding-to-decarbonise-manufacturing-with-ai/116473239",
    photo: "fitsol.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/6931785db4ff2a141cfa9242_Screenshot%202025-12-04%20at%205.32.32%E2%80%AFPM.png",
  },
  {
    date: "2024-10-08",
    title: "VC fund Transition, T-Hub, IEEE to collaborate for energy transition-focused startup accelerator",
    source: "The Hindu",
    url: "https://www.thehindu.com/news/national/telangana/vc-fund-transition-t-hub-ieee-to-collaborate-for-energy-transition-focused-startup-accelerator/article68731638.ece",
    photo: "t-hub-ieee.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693178f7a6ef586a75058b74_08.10.2024%20Transition%20T-Hub%20IEEE%20MoU.jpeg",
  },
  {
    date: "2024-07-17",
    title: "Low-cost hydrogen cell startup Protonas bags funding in round led by Transition VC",
    source: "The Economic Times",
    url: "https://economictimes.indiatimes.com/tech/funding/low-cost-hydrogen-cell-startup-protonas-bags-funding-in-round-led-by-transition-vc/articleshow/111815713.cms",
    photo: "protonas.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693179255e35c2a38a7241c9_david-devries-founder-ceo-protonas.avif",
  },
  {
    date: "2024-05-16",
    title: "Pune-based EV startup Matel raises $4 million in Series A to propel expansion",
    source: "Business Standard",
    url: "https://www.business-standard.com/companies/news/electric-vehicle-components-maker-matel-raises-4-million-in-funding-124051601521_1.html",
    photo: "matel.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/69317990f00e8d0dad663a1e_Untitled-design-2024-05-16T102620.556.webp",
  },
  {
    date: "2024-03-01",
    title: "Kerala Startup Mission invests INR 15 Cr in Transition VC to drive clean energy goals",
    source: "Inc42",
    url: "https://inc42.com/buzz/kerala-startup-mission-invests-inr-15-cr-in-transition-vc-to-fuel-energy/",
    photo: "ksum.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693178a18699564a5b1a8907_Kerala-Startup-Mission_ftr-1-760x570.jpeg",
  },
  {
    date: "2024-01-15",
    title: "Transition VC and IEEE unite global energy leaders at hydrogen economy summit",
    source: "MediaBrief",
    url: "https://mediabrief.com/transition-vc-and-ieee-partnered-and-hosted-the-marquee-summit/",
    photo: "ieee-summit.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693177b3db9a6a740287460a_IEEE.jpeg",
  },
  {
    date: "2023-07-19",
    title: "Transition VC and IEEE sign MoU to launch ‘Net Zero Warriors’",
    source: "The Hindu",
    url: "https://www.thehindu.com/news/cities/bangalore/transition-vc-and-ieee-sign-mou-to-launch-net-zero-warriors/article67079692.ece",
    photo: "ieee-mou.jpg",
    photoUrl: "https://cdn.prod.website-files.com/692fdbe9534a65a1347c5890/693179b8344bab84e4d1d70e_MOU.jpg",
  },
];

/** YouTube videos / podcast episodes — none listed on the current site yet. */
export const videos: { title: string; url: string; thumbnail?: string }[] = [];
export const podcasts: { title: string; url: string }[] = [];
