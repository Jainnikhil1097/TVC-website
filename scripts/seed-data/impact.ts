// Impact page copy, from the team's Impact design handoff (TVC_Impact_Handoff, 23 Nov 2026).
// Seeds CMS → Pages → Impact page. Company views and the SDG explorer are in impact-content.ts.

export const impact = {
  hero: {
    eyebrow: "Impact",
    headline: "Impact, engineered.",
    statement: "Backing the technologies that decarbonise energy and industry.",
    intro: "Early capital and industrial expertise to help companies move from technical validation to commercial scale.",
    primaryLabel: "Explore portfolio progress",
    secondaryLabel: "How we measure",
    tiles: [
      { company: "promethean-energy", caption: "Promethean / Industrial heat", image: "opening-promethean.webp" },
      { company: "emo-energy", caption: "EMO Energy / Batteries", image: "opening-emo.webp" },
      { company: "intrinsic-foundries", caption: "Intrinsic / Carbon utilisation", image: "opening-intrinsic.webp" },
    ],
  },
  pathways: [
    {
      title: "Use less energy",
      subtitle: "Industrial efficiency",
      body: "Less energy for the same useful output, from industrial heat and cooling to motors and computing.",
      companies: ["promethean-energy", "albatross-energetics", "matel-motion"],
    },
    {
      title: "Enable cleaner energy",
      subtitle: "Electrification and renewables",
      body: "Keep renewable assets productive and build the systems that support electrification.",
      companies: ["greentech-mw", "emo-energy", "earthen"],
    },
    {
      title: "Use resources better",
      subtitle: "Carbon and material productivity",
      body: "Reuse materials and improve how carbon, land and water are managed.",
      companies: ["fitsol", "intrinsic-foundries", "prithu"],
    },
  ],
  outcomes: {
    eyebrow: "Fund I outcomes",
    headline: "A portfolio view of progress.",
    intro: "Operating outcomes, clear reporting coverage and a view of where our companies are active.",
    status: "Portfolio totals: first consolidated release in preparation",
    measures: [
      { label: "Estimated emissions avoided", value: "", unit: "tCO₂e / year", definition: "Baseline emissions less solution emissions; each asset counted once." },
      { label: "Renewable electricity", value: "", unit: "GWh of electricity", definition: "Generation at supported operating assets, with the role of each company stated." },
      { label: "Net energy saved", value: "", unit: "GWh of final energy", definition: "Electricity and thermal savings shown separately within the total." },
      { label: "Direct portfolio employment", value: "", unit: "FTE at period end", definition: "Employees under one definition; contract workers reported separately." },
    ],
    coverageTitle: "The context behind every total.",
    coverageText: "Companies reporting / eligible companies. Share of invested cost represented.",
    coverageNote: "Coverage accompanies each measure.",
    footnote: "Portfolio results use eligible operating evidence. Technical tests and future scenarios stay in company detail.",
  },
  footprint: {
    eyebrow: "Global portfolio footprint",
    headline: "Where our portfolio builds and operates.",
    intro: "Explore company bases, facilities and customer activity. Select a country to see the evidence.",
    cardText: "Headquarters, facilities and customer operations.",
    footnote: "Source dates vary. Country markers show documented presence; environmental outcomes are reported by company and application.",
    countries: [
      {
        name: "India", lat: 22.5, lon: 79, presence: ["hq", "manufacturing", "deployments"], companies: [],
        value: "", valueLabel: "",
        detail: "Most of the portfolio is headquartered, builds and deploys in India.",
        source: "Company websites and Fund I one-pagers.",
      },
      {
        name: "Singapore", lat: 1.35, lon: 103.82, presence: ["hq"], companies: ["hydgen", "greenfi"],
        value: "", valueLabel: "Headquarters and registered office",
        detail: "Hydgen: headquarters. GreenFi: registered office. Country-level outcomes are not assigned to company addresses.",
        source: "Hydgen contact page and investment memo; GreenFi terms and conditions.",
      },
      {
        name: "United States", lat: 39.5, lon: -98.5, presence: ["deployments"], companies: ["earthen"],
        value: "", valueLabel: "Pilot deployment",
        detail: "EarthEn reports Heat Battery pilots underway in the US.",
        source: "EarthEn official website; dates not stated.",
      },
      { name: "Netherlands", lat: 52.2, lon: 5.3, presence: ["deployments"], companies: [], value: "", valueLabel: "", detail: "", source: "" },
      { name: "Switzerland", lat: 46.8, lon: 8.2, presence: ["deployments"], companies: [], value: "", valueLabel: "", detail: "", source: "" },
      {
        name: "Sri Lanka", lat: 7.9, lon: 80.8, presence: ["deployments"], companies: ["greentech-mw"],
        value: "~40 MW", valueLabel: "Wind capacity under O&M",
        detail: "Wind-turbine maintenance and SCADA operations.",
        source: "GreenTech investment memo, p. 8. Historical snapshot; the country figure is not separately dated.",
      },
      {
        name: "Oman", lat: 21.5, lon: 56, presence: ["deployments"], companies: ["workongrid"],
        value: "75%", valueLabel: "Investigation time reduction, water-utility case",
        detail: "Water-utility analytics deployment.",
        source: "Fund I one-pager, p. 18; source period not stated.",
      },
      { name: "Australia", lat: -25.3, lon: 133.8, presence: ["deployments"], companies: [], value: "", valueLabel: "", detail: "", source: "" },
    ],
  },
  sdgs: {
    eyebrow: "Where we seek impact",
    headline: "Our impact thesis. Our SDG alignment.",
    intro: "Backing technologies that use less energy, enable cleaner energy and use resources better.",
    note: "Intended contribution; results reported by company and application.",
  },
  carousel: {
    eyebrow: "Portfolio impact",
    headline: "See the contribution behind each company.",
    intro: "Explore outcomes, operating progress and the evidence behind them.",
    footnote: "Validation, deployment and operating results retain their own evidence labels. Unreported values are not zero.",
  },
  contribution: {
    eyebrow: "Our role as an investor",
    headline: "Support that moves beyond the cheque.",
    intro: "We connect capital, industrial capability and governance to help companies progress towards deployment.",
    pillars: [
      { label: "Capital", title: "Fund technical and commercial milestones.", text: "Stage-specific capital and follow-on planning." },
      { label: "Customers", title: "Help technologies reach relevant industrial users.", text: "Customer introductions and commercialisation support." },
      { label: "Scale", title: "Build the capability to deliver and repeat.", text: "Talent, operating discipline and business development." },
      { label: "Governance", title: "Make progress and risks visible.", text: "Board engagement, reporting and corrective actions." },
    ],
    caseLabel: "GreenTech / Documented investor contribution",
    caseTitle: "Operating capability. Financial discipline. Growth capacity.",
    casePoints: [
      { title: "Finance capability", text: "Support for audit and finance systems, including an experienced CFO." },
      { title: "Operating discipline", text: "Project-level profitability and cash-flow planning." },
      { title: "Access to growth capital", text: "Support in securing growth financing." },
    ],
    caseSource: "Source: GreenTech Impact Summary, p. 3. These actions describe Transition VC's contribution; company outcomes have wider causes.",
    footnote: "A recorded action, a company milestone and a dated outcome form the evidence trail for investor contribution.",
  },
  women: {
    eyebrow: "Women in leadership",
    headline: "Leadership across the investment lifecycle.",
    intro: "Women lead portfolio growth, corporate partnerships, marketing and people operations at Transition VC.",
    leaders: [
      { area: "Corporate engagement", name: "Navi Sharma", role: "VP, Corporate Partnerships" },
      { area: "Portfolio development", name: "Yashodhara Bakliwal", role: "VP, Portfolio Growth" },
    ],
    functions: [
      { title: "Marketing", text: "Women-led brand and communications." },
      { title: "People & Operations", text: "Women-led HR, administration and operations." },
    ],
    footnote: "This section recognises leadership within Transition VC. Portfolio workforce and leadership indicators are reported separately.",
  },
  perspectives: {
    eyebrow: "Portfolio perspectives",
    headline: "The transition, in practice.",
    intro: "Selected writing on the technologies, applications and industrial challenges behind our investments.",
    footnote: "Published by Transition VC. Technology perspectives explain the investment thesis; performance claims link to the relevant reporting evidence.",
  },
  measurement: {
    eyebrow: "Measurement & accountability",
    headline: "Clear evidence. Clear boundaries.",
    intro: "Read what sits behind a number: its period, source, method, coverage and limitations.",
    // The handoff gives text for the first item only; the others are drafts from its evidence rules.
    items: [
      { title: "Evidence stage, period & coverage", body: "Each result identifies whether it is a technical test, pilot or operating result, alongside its period and reporting boundary." },
      { title: "Sources & review", body: "Every figure cites its source. Unless it is labelled otherwise, a figure is company reported and has not been independently verified." },
      { title: "Carbon & energy", body: "Emissions avoided compare a stated baseline with the solution, counting each asset once. Electricity and thermal energy are reported separately, with the grid factor stated." },
      { title: "Aggregation & attribution", body: "Company results are enterprise-level outcomes with wider causes; they are not attributed solely to Transition VC. Portfolio totals add only comparable, deduplicated operating results." },
      { title: "Updates & limitations", body: "Values with no stated cutoff are source snapshots, not current totals. Unreported values are not zero, and technical tests and future scenarios stay in company detail." },
    ],
    reports: [
      { title: "Annual impact report", status: "First consolidated report in preparation" },
      { title: "ESG policy", status: "Public edition in preparation" },
      { title: "Methodology notes", status: "Definitions and reporting boundaries" },
    ],
    processTitle: "Responsible investment is part of the process.",
    process: [
      { step: "Screen", text: "Exclusions and material risks." },
      { step: "Assess", text: "Technical, commercial and ESG diligence." },
      { step: "Decide", text: "IC considers material ESG findings." },
      { step: "Monitor", text: "Reporting and agreed actions." },
      { step: "Exit", text: "ESG progress informs exit planning." },
    ],
  },
};
