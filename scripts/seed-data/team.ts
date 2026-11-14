import type { Person } from "./types";

// Starting team list. Names and titles follow the team's "Website Ideas and Link
// (About Us)" sheet (Nov 2026), shown in the About page's three sections. Photos are
// matched by name: scripts/seed-data/team-photos/<slug>.webp (see
// scripts/prepare-team-photos.mjs).

const li = (path: string) => `https://www.linkedin.com/in/${path}/`;

const founding: Person[] = [
  { name: "Raiyaan Shingati", title: "Managing Partner", linkedin: li("raiyaan-shingati-02099077") },
  { name: "Mohammed Shoeb Ali", title: "Managing Partner", linkedin: li("mohammed-shoeb-ali-1a814a184") },
  { name: "Shantanu Chaturvedi", title: "Partner", linkedin: li("shantanu-chaturvedi-vc") },
];

// Most senior first, as on the previous site; the sheet's new joiners slotted in by role.
const executive: Person[] = [
  // The sheet spells the surname "Sanjee"; LinkedIn and the previous site say "Sajee".
  { name: "Stenson Sajee", title: "Director Investor Relations", linkedin: li("stenson-sajee") },
  { name: "Gaurav Patil", title: "VP Investments", linkedin: li("gauravpatil03") },
  { name: "Yashodhara Bakliwal", title: "VP Portfolio Investments", linkedin: li("yashodharabakliwal") },
  { name: "Venkata Krishna", title: "VP Capital Formation", linkedin: li("venkatankrishna") },
  { name: "Bharat Takhtani", title: "VP Finance & Compliance", linkedin: li("bharat-takhtani") },
  { name: "Harsh Bihani", title: "VP Finance & Operations", linkedin: li("harsh-bihani-672b27113") },
  { name: "Navi Sharma", title: "VP Corporate Engagements & Partnership", linkedin: li("navi-s-17633956") },
  { name: "Anchit Donthi", title: "Managing Partner - House of Talent", linkedin: li("anchit-anil-14243364") },
  { name: "Ashrita Ashwin", title: "Chief of Staff", linkedin: li("ashrita-ashwin") },
  { name: "Simran Panwar", title: "Manager - Compliance (GIFT City)", linkedin: li("cs-simran-panwar") },
  { name: "Saloni Pattnaik", title: "HR Manager", linkedin: li("sushree-saloni-pattnaik") },
  { name: "Riddhim Sehgal", title: "Investment Analyst", linkedin: li("riddhim-sehgal-487960201") },
  { name: "Vaibhav Shrivastav", title: "Investment Analyst", linkedin: li("vaibhav-shrivastav-2xu") },
  { name: "Vishvas Shah", title: "Investment Analyst", linkedin: li("vishvas-shah1") },
  { name: "Dristi Kedia", title: "Investor Relations Analyst", linkedin: li("dristi-kedia") },
  { name: "Leelesh Gholkar", title: "Capital Formation Analyst", linkedin: li("leelesh-gholkar-ab7237264") },
  { name: "Anavi Panjwani", title: "Portfolio Investments Analyst", linkedin: li("anavi-panjwani") },
  { name: "Bhoomika Jain", title: "Sourcing Specialist", linkedin: li("bhoomika-jain1") },
  { name: "Usman Pasha", title: "Senior Accountant", linkedin: li("usman-pasha-k-3818b1151") },
  { name: "Aditi Manjunath", title: "Marketing & Events", linkedin: li("aditimanjunath") },
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
  { id: "executive", people: executive },
  { id: "advisors", people: advisors },
] as const;
