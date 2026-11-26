import type { Person } from "./types";

// Starting team list. Names and titles follow the team's "Website Ideas and Link
// (About Us)" sheet (Nov 2026), grouped into the About page's teams. Photos are
// matched by name: scripts/seed-data/team-photos/<slug>.webp (see
// scripts/prepare-team-photos.mjs).

const li = (path: string) => `https://www.linkedin.com/in/${path}/`;

// Bios as approved by the team (Nov 2026). Logo rows: previous firms (no heading), then
// their investment track record, cropped from the team's profile cards.
const founding: Person[] = [
  {
    name: "Raiyaan Shingati",
    title: "Co-Founder & Managing Partner",
    linkedin: li("raiyaan-shingati-02099077"),
    bio: "Raiyaan Shingati is the Co-Founder and Managing Partner of Transition VC, bringing over a decade of experience across private equity and venture capital. He leads the firm's strategic vision, institutional engagement and portfolio development, with a focus on backing engineering-led businesses shaping India's energy future.\n\nA Chartered Accountant by training, Raiyaan combines financial expertise with a deep understanding of fund structuring, cross-border transactions and long-term value creation. He plays an active role in guiding portfolio companies, working closely with founders and institutional partners to scale transformative energy and industrial technologies.",
    previousBio: "Raiyaan leads Transition VC's strategy, fundraising, investor relations and operations, and sits on the boards of Fitsol, Matel, EMO Energy, Comminent and Hydgen. A Chartered Accountant with over a decade in private equity and venture capital, he led cross-border M&A at Black Dragon Capital and co-developed the energy-transition thesis at Mount Judi Ventures. He is also the founder and trustee of Limitless Education & Charitable Trust.",
    logoRows: [
      { file: "raiyaan-shingati-row-1.png" },
      { heading: "Private Equity Investments and Exits", file: "raiyaan-shingati-row-2.png" },
      { heading: "Early-stage Investments", file: "raiyaan-shingati-row-3.png" },
    ],
  },
  {
    name: "Mohammed Shoeb Ali",
    title: "Co-Founder & Managing Partner",
    linkedin: li("mohammed-shoeb-ali-1a814a184"),
    bio: "Mohammed Shoeb Ali is the Co-Founder and Managing Partner of Transition VC, bringing over 14 years of experience in portfolio management, investment strategy and deal execution. He leads the firm's investment strategy and portfolio construction, with a focus on hardware-led energy and industrial technologies.\n\nWith a background in Mechanical Engineering and an MBA in Finance & Marketing, Shoeb combines technical understanding with financial discipline. He works closely with founders to navigate manufacturing scale-up, operational challenges and commercial growth, backing infrastructure-grade technologies that are critical to India's energy transition.",
    previousBio: "Shoeb leads investment strategy and portfolio construction, with 14+ years in portfolio management, investment strategy and deal execution across hardware-led industrial systems. He sits on the boards of Protonas, Dynolt, Promethean, CIMware, Comminent, Hydgen, GreenTech and GreenFi, working with founders on manufacturing ramp-ups, cost curves and institutional adoption. A mechanical engineer with an MBA in Finance & Marketing, he previously held senior investment and advisory roles across India and the Middle East.",
    logoRows: [
      { file: "mohammed-shoeb-ali-row-1.png" },
      { heading: "Private Equity Investments and Exits", file: "mohammed-shoeb-ali-row-2.png" },
      { heading: "Early-stage Investments", file: "mohammed-shoeb-ali-row-3.png" },
    ],
  },
  {
    name: "Shantanu Chaturvedi",
    title: "Partner",
    linkedin: li("shantanu-chaturvedi-vc"),
    bio: "Shantanu Chaturvedi is a Partner at Transition VC, where he leads investment thesis development and end-to-end deal execution across engineering-led climate and energy transition technologies. His focus spans decarbonisation, electrification, mobility and energy storage, with an emphasis on technologies built for real-world deployment.\n\nAn Electrical and Electronics Engineering graduate from Delhi Technological University (DTU), Shantanu brings a strong technical foundation to investment evaluation. He works closely with founders to assess product readiness, navigate manufacturing transitions and drive early customer adoption, helping businesses move from validated technology to commercial scale.",
    previousBio: "Shantanu leads investment thesis development and end-to-end deal execution across decarbonisation, electrification, mobility and energy storage. He works closely with founders as products move from prototype to manufacturing, early customers and commercial scale. He previously supported early-stage hard-tech founders at iCreate, and holds a B.Tech in Electrical & Electronics Engineering from DTU.",
    logoRows: [
      { file: "shantanu-chaturvedi-row-1.png" },
      { heading: "Successful Investments and Exits", file: "shantanu-chaturvedi-row-2.png" },
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
  // Capital Formation sits within Investor Relations.
  { name: "Venkata Krishna", title: "VP Capital Formation", linkedin: li("venkatankrishna") },
  { name: "Leelesh Gholkar", title: "Capital Formation Analyst", linkedin: li("leelesh-gholkar-ab7237264") },
];
const portfolioInvestments: Person[] = [
  { name: "Yashodhara Bakliwal", title: "VP Portfolio Investments", linkedin: li("yashodharabakliwal") },
  { name: "Anavi Panjwani", title: "Portfolio Investments Analyst", linkedin: li("anavi-panjwani") },
  { name: "Navi Sharma", title: "VP Corporate Engagements & Partnership", linkedin: li("navi-s-17633956") },
];
const marketing: Person[] = [
  { name: "Aditi Manjunath", title: "Marketing & Events", linkedin: li("aditimanjunath") },
];
const finance: Person[] = [
  { name: "Bharat Takhtani", title: "VP Finance & Compliance", linkedin: li("bharat-takhtani") },
  { name: "Harsh Bihani", title: "VP Finance & Operations", linkedin: li("harsh-bihani-672b27113") },
  { name: "Simran Panwar", title: "Manager - Compliance (GIFT City)", linkedin: li("cs-simran-panwar") },
  { name: "Usman Pasha", title: "Senior Accountant", linkedin: li("usman-pasha-k-3818b1151") },
  // Joined Nov 2026.
  { name: "Richa Tewari", title: "Fund Operations Associate", linkedin: li("richa-tewari-889139279") },
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
  { name: "Ravin Mirchandani", linkedin: li("ravinmirchandani") },
  { name: "Tejas Goenka", linkedin: li("tejas-goenka-3ab25244") },
];

/** Group ids match `teamGroupOptions` in lib/taxonomy.ts. */
export const teamGroups = [
  { id: "founding", people: founding },
  { id: "advisors", people: advisors },
  { id: "investments", people: investments },
  { id: "investor-relations", people: investorRelations },
  { id: "portfolio-investments", people: portfolioInvestments },
  { id: "finance", people: finance },
  { id: "hr", people: hr },
  { id: "marketing", people: marketing },
] as const;
