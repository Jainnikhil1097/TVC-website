import type { Person } from "./types";

// Starting team list. Names and titles follow the team's "Website Ideas and Link
// (About Us)" sheet (Nov 2026), grouped into the About page's teams. Photos are
// matched by name: scripts/seed-data/team-photos/<slug>.webp (see
// scripts/prepare-team-photos.mjs).

const li = (path: string) => `https://www.linkedin.com/in/${path}/`;

const founding: Person[] = [
  {
    name: "Raiyaan Shingati",
    title: "Managing Partner",
    linkedin: li("raiyaan-shingati-02099077"),
    bio: "Raiyaan leads Transition VC's strategy, fundraising, investor relations and operations, and sits on the boards of Fitsol, Matel, EMO Energy, Comminent and Hydgen. A Chartered Accountant with over a decade in private equity and venture capital, he led cross-border M&A at Black Dragon Capital and co-developed the energy-transition thesis at Mount Judi Ventures. He is also the founder and trustee of Limitless Education & Charitable Trust.",
    highlights: [
      "Backing hard energy and industrial infrastructure at the post-product, pre-PMF inflection",
      "Underwriting engineering feasibility before market validation",
      "Building complementary portfolios across the energy-transition stack",
    ],
  },
  {
    name: "Mohammed Shoeb Ali",
    title: "Managing Partner",
    linkedin: li("mohammed-shoeb-ali-1a814a184"),
    bio: "Shoeb leads investment strategy and portfolio construction, with 14+ years in portfolio management, investment strategy and deal execution across hardware-led industrial systems. He sits on the boards of Protonas, Dynolt, Promethean, CIMware, Comminent, Hydgen, GreenTech and GreenFi, working with founders on manufacturing ramp-ups, cost curves and institutional adoption. A mechanical engineer with an MBA in Finance & Marketing, he previously held senior investment and advisory roles across India and the Middle East.",
    highlights: [
      "Backing hardware-led energy companies at the post-product, pre-PMF stage",
      "Underwriting technical and execution risk ahead of scale",
      "Hands-on with founders on manufacturing, scale and governance",
    ],
  },
  {
    name: "Shantanu Chaturvedi",
    title: "Partner",
    linkedin: li("shantanu-chaturvedi-vc"),
    bio: "Shantanu leads investment thesis development and end-to-end deal execution across decarbonisation, electrification, mobility and energy storage. He works closely with founders as products move from prototype to manufacturing, early customers and commercial scale. He previously supported early-stage hard-tech founders at iCreate, and holds a B.Tech in Electrical & Electronics Engineering from DTU.",
    highlights: [
      "Leading end-to-end execution on climate-tech and hard-tech investments",
      "Assessing technical readiness and execution risk in capital-intensive systems",
      "Turning engineering performance into commercially viable operating models",
    ],
  },
];

// The teams, in the sheet's order ("Joining Soon" roles left out).
// The sheet spells Stenson's surname "Sanjee"; LinkedIn and the previous site say "Sajee".
const investments: Person[] = [
  { name: "Gaurav Patil", title: "VP Investments", linkedin: li("gauravpatil03") },
  { name: "Vishvas Shah", title: "Investment Analyst", linkedin: li("vishvas-shah1") },
  { name: "Vaibhav Shrivastav", title: "Investment Analyst", linkedin: li("vaibhav-shrivastav-2xu") },
  { name: "Riddhim Sehgal", title: "Investment Analyst", linkedin: li("riddhim-sehgal-487960201") },
  { name: "Bhoomika Jain", title: "Sourcing Specialist", linkedin: li("bhoomika-jain1") },
];
const investorRelations: Person[] = [
  { name: "Stenson Sajee", title: "Director Investor Relations", linkedin: li("stenson-sajee") },
  { name: "Dristi Kedia", title: "Investor Relations Analyst", linkedin: li("dristi-kedia") },
];
const capitalFormation: Person[] = [
  { name: "Venkata Krishna", title: "VP Capital Formation", linkedin: li("venkatankrishna") },
  { name: "Leelesh Gholkar", title: "Capital Formation Analyst", linkedin: li("leelesh-gholkar-ab7237264") },
];
const portfolioInvestments: Person[] = [
  { name: "Yashodhara Bakliwal", title: "VP Portfolio Investments", linkedin: li("yashodharabakliwal") },
  { name: "Anavi Panjwani", title: "Portfolio Investments Analyst", linkedin: li("anavi-panjwani") },
];
const marketing: Person[] = [
  { name: "Aditi Manjunath", title: "Marketing & Events", linkedin: li("aditimanjunath") },
  { name: "Navi Sharma", title: "VP Corporate Engagements & Partnership", linkedin: li("navi-s-17633956") },
];
const finance: Person[] = [
  { name: "Bharat Takhtani", title: "VP Finance & Compliance", linkedin: li("bharat-takhtani") },
  { name: "Harsh Bihani", title: "VP Finance & Operations", linkedin: li("harsh-bihani-672b27113") },
  { name: "Simran Panwar", title: "Manager - Compliance (GIFT City)", linkedin: li("cs-simran-panwar") },
  { name: "Usman Pasha", title: "Senior Accountant", linkedin: li("usman-pasha-k-3818b1151") },
];
const hr: Person[] = [
  { name: "Anchit Donthi", title: "Managing Partner - House of Talent", linkedin: li("anchit-anil-14243364") },
  { name: "Ashrita Ashwin", title: "Chief of Staff", linkedin: li("ashrita-ashwin") },
  { name: "Saloni Pattnaik", title: "HR Manager", linkedin: li("sushree-saloni-pattnaik") },
  { name: "Anjali Devakumar", title: "HR Executive", linkedin: li("anjali-devakumar-72ba4334b") },
  { name: "Padmashree P", title: "Executive Assistant", linkedin: li("padmashree-priyadarshini-843374242") },
];

const advisors: Person[] = [
  { name: "Anuj Khanna", linkedin: li("anuj-khanna-1a040a22") },
  { name: "Dr Arvind Parthasarathy", linkedin: li("arvind-parthasarathy-0338b711") },
  { name: "Dr Ingolf Gröning", linkedin: li("ingolf-gr%C3%B6ning-3396905") },
  { name: "Mustafa Wajid", linkedin: li("mustafa-wajid-05075345") },
  { name: "Naresh V Narasimhan", linkedin: li("naresh-v-narasimhan-3324521") },
  { name: "Ravin Mirchandani", linkedin: li("ravinmirchandani") },
  { name: "Tejas Goenka", linkedin: li("tejas-goenka-3ab25244") },
];

/** Group ids match `teamGroupOptions` in lib/taxonomy.ts. */
export const teamGroups = [
  { id: "founding", people: founding },
  { id: "investments", people: investments },
  { id: "investor-relations", people: investorRelations },
  { id: "capital-formation", people: capitalFormation },
  { id: "portfolio-investments", people: portfolioInvestments },
  { id: "marketing", people: marketing },
  { id: "finance", people: finance },
  { id: "hr", people: hr },
  { id: "advisors", people: advisors },
] as const;
