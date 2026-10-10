import type { Person } from "./types";

const li = (path: string) => `https://www.linkedin.com/in/${path}/`;

export const foundingTeam: Person[] = [
  { name: "Mohammed Shoeb Ali", title: "Co-Founder & Managing Partner", linkedin: li("mohammed-shoeb-ali-1a814a184") },
  { name: "Raiyaan Shingati", title: "Co-Founder & Managing Partner", linkedin: li("raiyaan-shingati-02099077") },
  { name: "Shantanu Chaturvedi", title: "Partner", linkedin: li("shantanu-chaturvedi-vc") },
];

export const executiveTeam: Person[] = [
  { name: "Stenson Sajee", title: "Director - Investor Relations", linkedin: li("stenson-sajee") },
  { name: "Gaurav Patil", title: "VP - Investments", linkedin: li("gauravpatil03") },
  { name: "Yashodhara Bakliwal", title: "VP - Portfolio Investments", linkedin: li("yashodharabakliwal") },
  { name: "Venkata Krishna", title: "VP - Capital Formation", linkedin: li("venkatankrishna") },
  { name: "Bharat Takhtani", title: "VP - Finance & Compliance", linkedin: li("bharat-takhtani") },
  { name: "Aishwarya Ramesh", title: "VP - Marketing and Communication", linkedin: li("aishwarya-ramesh77") },
  { name: "Navi Sharma", title: "VP - Ecosystem Engagement & Strategic Partnerships", linkedin: li("navi-s-17633956") },
  { name: "Simran Panwar", title: "Manager - Compliance (GIFT City)", linkedin: li("cs-simran-panwar") },
  { name: "Saloni Pattnaik", title: "HR Manager", linkedin: li("sushree-saloni-pattnaik") },
  { name: "Riddhim Sehgal", title: "Investment Analyst", linkedin: li("riddhim-sehgal-487960201") },
  { name: "Vaibhav Shrivastav", title: "Investment Analyst", linkedin: li("vaibhav-shrivastav-2xu") },
  { name: "Vishvas Shah", title: "Investment Analyst", linkedin: li("vishvas-shah1") },
  { name: "Dristi Kedia", title: "Investor Relations Analyst", linkedin: li("dristi-kedia") },
  { name: "Anavi Panjwani", title: "Portfolio - Investments Fellow", linkedin: li("anavi-panjwani") },
  { name: "Bhoomika Jain", title: "Sourcing Specialist", linkedin: li("bhoomika-jain1") },
  { name: "Usman Pasha", title: "Senior Accountant", linkedin: li("usman-pasha-k-3818b1151") },
  { name: "Aditi Manjunath", title: "Marketing & Events Associate", linkedin: li("aditimanjunath") },
  { name: "Anjali Devakumar", title: "HR Executive", linkedin: li("anjali-devakumar-72ba4334b") },
  { name: "Padmashree P", title: "Executive Assistant", linkedin: li("padmashree-priyadarshini-843374242") },
];

export const advisors: Person[] = [
  { name: "Anuj Khanna", linkedin: li("anuj-khanna-1a040a22") },
  { name: "Dr Arvind Parthasarathy", linkedin: li("arvind-parthasarathy-0338b711") },
  { name: "Dr Ingolf Gröning", linkedin: li("ingolf-gr%C3%B6ning-3396905") },
  { name: "Mustafa Wajid", linkedin: li("mustafa-wajid-05075345") },
  { name: "Naresh V Narasimhan", linkedin: li("naresh-v-narasimhan-3324521") },
  { name: "Ravin Mirchandani", linkedin: li("ravinmirchandani") },
  { name: "Tejas Goenka", linkedin: li("tejas-goenka-3ab25244") },
];

export const teamGroups = [
  { id: "founding", label: "Founding Team", people: foundingTeam },
  { id: "executive", label: "Executive Team", people: executiveTeam },
  { id: "advisors", label: "Sector Experts & Advisors", people: advisors },
] as const;
