// PLACEHOLDER COPY — the current site has no GIFT City page.
// Replace with approved text from Transition VC before launch.

export const giftCity = {
  eyebrow: "GIFT City · IFSC",
  headline: "Global capital for India's energy transition",
  intro:
    "Our GIFT City platform gives international and NRI investors a regulated, tax-efficient route to back India's most promising energy-transition companies — alongside the same team and thesis behind Fund I.",
  highlights: [
    {
      title: "Structure",
      body: "An IFSC-domiciled fund regulated by the International Financial Services Centres Authority (IFSCA). [Placeholder]",
    },
    {
      title: "Who can invest",
      body: "Accredited international investors, family offices, institutions and NRIs. [Placeholder]",
    },
    {
      title: "Strategy",
      body: "Pre-Seed to Series A energy-transition companies across mobility, industrial decarbonisation, storage and alternate fuels.",
    },
    {
      title: "Governance",
      body: "Dedicated GIFT City compliance function and independent administration. [Placeholder]",
    },
  ],
  cta: { label: "Investor enquiries", href: "/contact?type=investor" },
};

/**
 * IFSCA disclosures for the GIFT City fund manager, from "Annexure 1" (Nov 2026).
 * Shown at the bottom of the GIFT City page; edited in CMS → GIFT City page → IFSCA disclosures.
 */
const GIFT_ADDRESS =
  "Office No. SI – M- 1038, Shilp Incubation Centre, Unit B, First Floor, Plot 11T3 & 11T5, Block – 11, GIFT SEZ, GIFT City, Gandhinagar, Gujarat 382050";

export const giftCityDisclosures = {
  show: true,
  fme: {
    name: "Transition Global Asset Manager LLP",
    legalForm: "Limited Liability Partnership (LLP)",
    category: "Registered FME (Non-Retail)",
    registrationNumber: "FDM2026FNR1168",
    registrationDate: "23-10-2026",
  },
  contact: {
    registeredOffice: GIFT_ADDRESS,
    correspondence: GIFT_ADDRESS,
    telephone: "9829999540",
    email: "simran@transitionventurecapital.com",
  },
  funds: [{ name: "Transition VC Gift Fund I", registrationNumber: "FDM2026FNR1168", category: "Category II" }],
  serviceProviders: [
    {
      role: "Trustee",
      name: "Orbis Trusteeship Services Private Limited",
      address: "604, Hiranandani Signature Building Block 13B, Zone 1, GIFT SEZ, GIFT City Gandhinagar 382355, Gujarat, India",
      telephone: "",
    },
    { role: "Statutory Auditor", name: "(to be appointed)", address: "(to be appointed)", telephone: "(to be appointed)" },
    { role: "Custodian", name: "Not applicable", address: "–", telephone: "–" },
  ],
  grievance: {
    text: "Please refer to the Policy on Complaint Handling and Grievance Redressal for any queries related to investor grievance redressal mechanism, contact details of the Grievance Redressal Officer, the escalation matrix and the timelines for redressal.",
    complaints: [] as { quarterEnded: string; pendingStart: string; received: string; disposed: string; pendingEnd: string }[],
    complaintsNote: "Not applicable",
  },
  officers: [
    { designation: "Principal Officer", name: "Ms. Yashodhara", email: "Yashodhara@transitionventurecapital.com", telephone: "9874455444" },
    { designation: "Compliance Officer", name: "Ms. Simran Panwar", email: "simran@transitionventurecapital.com", telephone: "9829999540" },
  ],
  actions: { action: "Nil", status: "Not applicable" },
  disclaimer:
    "Registration with the International Financial Services Centres Authority (IFSCA) does not imply approval or endorsement by IFSCA of Transition Global Asset Manager LLP, of any scheme managed by it, or of the financial soundness or performance thereof.",
};
