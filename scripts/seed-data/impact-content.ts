// Impact page content, from the team's Impact design handoff (TVC_Impact_Handoff, 23 Nov 2026)
// and its SDG explorer. Seeds CMS → Pages → Impact page, and each company's Impact tab.
// Public-safe: no financial, funding or return figures; lender names left out; internal
// instructions from the handoff dropped. Edited in the CMS from here on.

export type ImpactMetric = { label: string; value: string; unit: string; evidence: string; note: string };
export type CompanyImpact = {
  sectorLabel: string; tagline: string; period?: string; stage: string; metrics: ImpactMetric[];
  closerValue?: string; closerText?: string; evidence: string; sources: string;
  order: number; featured: boolean; image?: string;
};

/** Per company (by slug): the 19 company views. Images in seed-data/impact-photos/. */
export const companyImpact: Record<string, CompanyImpact> = {
  "greentech-mw": {
    "sectorLabel": "Renewable asset productivity",
    "tagline": "Keeping wind assets productive for longer.",
    "period": "FY2025-26 · Company reported",
    "stage": "Operating results",
    "metrics": [
      {
        "label": "Wind electricity generated",
        "value": "398",
        "unit": "GWh",
        "evidence": "Reported operation",
        "note": "Client-owned turbines under O&M; FY2025-26."
      },
      {
        "label": "Estimated emissions avoided",
        "value": "262.5k",
        "unit": "tCO₂e",
        "evidence": "Company estimate",
        "note": "Exact reported value: 262,544 tCO₂e; grid factor requires validation."
      },
      {
        "label": "Wind capacity under O&M",
        "value": "305",
        "unit": "MW",
        "evidence": "Reported deployment",
        "note": "261 turbines; capacity, not energy generated."
      },
      {
        "label": "Full-fleet availability",
        "value": "87.2",
        "unit": "%",
        "evidence": "Reported operation",
        "note": "FY26: 87.2%; FY25: 92.2%. Whole fleet, not the recovering cohort."
      }
    ],
    "closerValue": "56.3% → 89.0%",
    "closerText": "Availability of 33 turbines taken over in April 2025. A defined cohort; not the whole fleet.",
    "evidence": "Generation and avoided emissions relate to client-owned turbines. These are enterprise-level results; they are not attributed solely to Transition VC. Workforce context: 214 employees + 62 contract workers, reported separately from these operating measures.",
    "sources": "GreenTech Impact Summary, November 2026, pp. 1–2. Company reported; not independently verified.",
    "order": 10,
    "featured": true,
    "image": "company-greentech.webp"
  },
  "emo-energy": {
    "sectorLabel": "Electric mobility",
    "tagline": "Battery systems built for demanding electric fleets.",
    "stage": "Commercial deployments",
    "metrics": [
      {
        "label": "Battery packs deployed",
        "value": "20,000+",
        "unit": "packs",
        "evidence": "Reported deployment",
        "note": "Cumulative reported deployment; cutoff not stated."
      },
      {
        "label": "Charge time to about 80%",
        "value": "~20",
        "unit": "minutes",
        "evidence": "Product performance claim",
        "note": "ZenPac 2 kWh only; the starting state of charge is not given in the source."
      },
      {
        "label": "Tested cycle life",
        "value": "",
        "unit": "cycles to 80% capacity",
        "evidence": "Test evidence to be confirmed",
        "note": ""
      },
      {
        "label": "Electric distance enabled",
        "value": "",
        "unit": "vehicle-km",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Current evidence supports deployed battery packs and a specified charging capability. Durability must distinguish matched lab tests from accumulated field use.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 5. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 20,
    "featured": true,
    "image": "company-emo.webp"
  },
  "matel-motion": {
    "sectorLabel": "Efficient electrification",
    "tagline": "Efficient motors and integrated drivetrains for mobility and industry.",
    "stage": "Commercial deployments",
    "metrics": [
      {
        "label": "Motors deployed",
        "value": "200,000+",
        "unit": "motors",
        "evidence": "Reported deployment",
        "note": "Mobility and pump applications; cutoff not stated."
      },
      {
        "label": "Drive-cycle efficiency gain",
        "value": "",
        "unit": "%",
        "evidence": "Test evidence to be confirmed",
        "note": ""
      },
      {
        "label": "Rare-earth-free units delivered",
        "value": "",
        "unit": "% of motor units",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Electricity saved at monitored sites",
        "value": "",
        "unit": "MWh",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Motors are reported in deployed mobility and pump applications. Performance and rare-earth content must be model- and application-specific.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 6. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 30,
    "featured": true,
    "image": "company-matel.webp"
  },
  "protonas": {
    "sectorLabel": "Hydrogen systems",
    "tagline": "Fuel-cell systems for backup power and specialist mobility.",
    "stage": "Prototype design / qualification",
    "metrics": [
      {
        "label": "Prototype design output",
        "value": "500",
        "unit": "W",
        "evidence": "Design milestone",
        "note": "500 W prototype designed; not commercial capacity."
      },
      {
        "label": "Engineering partner MoUs",
        "value": "1",
        "unit": "agreements",
        "evidence": "Partner commitment",
        "note": "One aerospace-company MoU reported; not an operating pilot."
      },
      {
        "label": "Net electrical efficiency",
        "value": "",
        "unit": "% on H₂ LHV",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Continuous run demonstrated",
        "value": "",
        "unit": "hours",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "The reviewed one-pager reports a 500 W prototype designed and scaling to 2 kW; it does not establish 500 W of commercial operating capacity.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 7. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 40,
    "featured": false,
    "image": "company-protonas.webp"
  },
  "dynolt": {
    "sectorLabel": "Power electronics",
    "tagline": "Power conversion for charging and distributed energy.",
    "stage": "Commercial deployments",
    "metrics": [
      {
        "label": "Chargers deployed",
        "value": "100,000+",
        "unit": "chargers",
        "evidence": "Reported deployment",
        "note": "Cutoff not stated; deployed versus shipped scope to be confirmed."
      },
      {
        "label": "Charging cycles recorded",
        "value": "50M+",
        "unit": "cycles",
        "evidence": "Reported field use",
        "note": "Company deck reports 50M+ charging cycles; no reporting cutoff."
      },
      {
        "label": "Weighted conversion efficiency",
        "value": "",
        "unit": "%",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Energy delivered in service",
        "value": "",
        "unit": "MWh",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Reported charger deployment provides scale evidence. Field cycles and conversion performance can be assessed before a complete device lifetime.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 8; Dynolt company deck, p. 1. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 50,
    "featured": false,
    "image": "company-dynolt.webp"
  },
  "promethean-energy": {
    "sectorLabel": "Industrial heat",
    "tagline": "Recovering waste heat for useful industrial heating.",
    "stage": "Commercial industrial deployments",
    "metrics": [
      {
        "label": "Heat pumps deployed",
        "value": "50+",
        "unit": "systems",
        "evidence": "Reported deployment",
        "note": "Cutoff not stated; heat pumps and heat-recovery units to be distinguished."
      },
      {
        "label": "Heat recovery capacity",
        "value": "20+",
        "unit": "MW thermal",
        "evidence": "Reported capacity claim",
        "note": "The source uses MW for heat recovered; capacity definition to be confirmed."
      },
      {
        "label": "Useful heat delivered",
        "value": "",
        "unit": "MWh thermal",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Net purchased energy saved",
        "value": "",
        "unit": "MWh final energy",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Deployed systems and a capacity-type proof point exist. Useful heat and net purchased energy can be metered during normal operation; lifetime savings can follow separately.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 9. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 60,
    "featured": true,
    "image": "company-promethean.webp"
  },
  "fitsol": {
    "sectorLabel": "Low-carbon supply chains",
    "tagline": "Lower-emission logistics and reusable packaging.",
    "period": "Source: FY2025-26",
    "stage": "Commercial services",
    "metrics": [
      {
        "label": "Customers served",
        "value": "80+",
        "unit": "customers",
        "evidence": "Reported adoption",
        "note": "FY2025-26; includes logistics, software and allied services."
      },
      {
        "label": "Freight emissions intensity",
        "value": "",
        "unit": "gCO₂e / tonne-km",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Packaging reuse cycles",
        "value": "",
        "unit": "completed cycles",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Single-use material displaced",
        "value": "",
        "unit": "tonnes",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "The portfolio has a dated FY26 customer-reach figure. Logistics and packaging benefits should be reported as distinct, measurable service outcomes.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 10. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 70,
    "featured": true
  },
  "cimware": {
    "sectorLabel": "Efficient digital infrastructure",
    "tagline": "Pooling compute resources to reduce wasted capacity.",
    "stage": "Prototype / first-pilot preparation",
    "metrics": [
      {
        "label": "First customer pilot",
        "value": "In delivery",
        "unit": "milestone",
        "evidence": "Pilot preparation",
        "note": "First pilot project delivery in progress in FY27."
      },
      {
        "label": "Energy per matched workload",
        "value": "",
        "unit": "kWh / workload",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Productive resource utilisation",
        "value": "",
        "unit": "%",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Compute delivered per rack",
        "value": "",
        "unit": "workloads / rack",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "The source mixes internal testing and cost modelling for its power-saving claim, and says the first pilot is being delivered. This is not commercial field-saving evidence.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 11. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 80,
    "featured": false,
    "image": "company-cimware.webp"
  },
  "comminent": {
    "sectorLabel": "Grid intelligence",
    "tagline": "Reliable connectivity for smarter electricity networks.",
    "stage": "Commercial enabling hardware",
    "metrics": [
      {
        "label": "NIC cards shipped",
        "value": "1.5M+",
        "unit": "cards",
        "evidence": "Reported shipment",
        "note": "Shipment proof point; active endpoint count is a separate measure."
      },
      {
        "label": "Endpoints communicating",
        "value": "",
        "unit": "endpoints",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Successful meter-read rate",
        "value": "",
        "unit": "%",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Manual field visits avoided",
        "value": "",
        "unit": "visits",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "The reviewed source reports shipped NIC cards. Network availability and avoided service visits are more proximate measures than an assumed grid-energy reduction.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 12. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 90,
    "featured": false,
    "image": "company-comminent.webp"
  },
  "hydgen": {
    "sectorLabel": "Hydrogen systems",
    "tagline": "Modular electrolysers for on-site hydrogen production.",
    "stage": "Early industrial deployments",
    "metrics": [
      {
        "label": "Electrolyser capacity live",
        "value": "90",
        "unit": "kW",
        "evidence": "Reported deployment",
        "note": "Live customer systems."
      },
      {
        "label": "System electricity intensity",
        "value": "",
        "unit": "kWh / kg H₂",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Hydrogen purity delivered",
        "value": "99.99",
        "unit": "% H₂",
        "evidence": "Product performance claim",
        "note": "Purity is product quality; it is not proof that hydrogen is low carbon."
      },
      {
        "label": "Operating hours recorded",
        "value": "5,000+",
        "unit": "hours",
        "evidence": "Reported field use",
        "note": "Operating hours to date; cutoff and aggregation basis not stated."
      }
    ],
    "evidence": "90 kW is reported live. Capacity, purity and operating experience are distinct from hydrogen climate intensity, which depends on actual energy and feedstock use.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 13; Hydgen company deck, p. 6. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 100,
    "featured": false,
    "image": "company-hydgen.webp"
  },
  "greenfi": {
    "sectorLabel": "Sustainability intelligence",
    "tagline": "Turning ESG information into actionable risk decisions.",
    "stage": "Enterprise pilots / early commercial",
    "metrics": [
      {
        "label": "Signed institutional contracts",
        "value": "3+",
        "unit": "contracts",
        "evidence": "Reported adoption",
        "note": "Signed contracts; active use to be confirmed with usage records."
      },
      {
        "label": "Enterprise pilots secured",
        "value": "16",
        "unit": "pilots",
        "evidence": "Reported pilot engagement",
        "note": "Secured pilots; not 16 additional live paying customers."
      },
      {
        "label": "Assessment turnaround",
        "value": "",
        "unit": "hours / assessment",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Risks with recorded action",
        "value": "",
        "unit": "% of flagged risks",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "ESG decision software is an enabling service. Customer and pilot reach and documented user actions are more appropriate measures than a carbon-output claim.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 14. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 110,
    "featured": false
  },
  "intrinsic-foundries": {
    "sectorLabel": "Carbon utilisation",
    "tagline": "Converting industrial CO₂ into useful biomaterials.",
    "period": "Source: July 2026 company deck",
    "stage": "Industrial pilot validation",
    "metrics": [
      {
        "label": "Pilot reactor validated",
        "value": "1,000",
        "unit": "litres",
        "evidence": "Company-reported pilot",
        "note": "1 kL power-plant pilot; not the 10 kL system under commissioning."
      },
      {
        "label": "Continuous pilot operation",
        "value": "120+",
        "unit": "days",
        "evidence": "Company-reported pilot",
        "note": "Pilot duration; not annual plant availability."
      },
      {
        "label": "Pilot CO₂ conversion",
        "value": "~90",
        "unit": "%",
        "evidence": "Company-reported pilot",
        "note": "Conversion is not net avoided emissions or permanent removal."
      },
      {
        "label": "Pilot biomass density",
        "value": "~3",
        "unit": "g / litre",
        "evidence": "Company-reported pilot",
        "note": "Peak density in the source headline; the stable cohort is reported at 3.4 g/L."
      }
    ],
    "evidence": "Pilot performance is available, while net lifecycle climate benefit and carbon fate are not yet established. Capture and use are not durable removal.",
    "sources": "Intrinsic Foundries company deck, p. 7. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 120,
    "featured": false,
    "image": "company-intrinsic.webp"
  },
  "earthen": {
    "sectorLabel": "Long-duration storage",
    "tagline": "Storing renewable energy for industrial heat and power.",
    "stage": "Pilot demonstration",
    "metrics": [
      {
        "label": "Heat Battery readiness",
        "value": "6",
        "unit": "TRL",
        "evidence": "Reported prototype stage",
        "note": "Heat Battery; not commercial operating history."
      },
      {
        "label": "Pilots underway",
        "value": "India + US",
        "unit": "pilot locations",
        "evidence": "Company-reported pilots",
        "note": "Official website; commissioned asset count and dates are not stated."
      },
      {
        "label": "Specified heat delivery",
        "value": "200–500",
        "unit": "°C",
        "evidence": "Design specification",
        "note": "Specified heat range; not a fleet operating average."
      },
      {
        "label": "Thermal round-trip efficiency",
        "value": "",
        "unit": "%",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "The one-pager reports the Heat Battery at TRL 6; the official site reports pilots underway in India and the US. Annual output and long-term field durability are not yet established.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 17; EarthEn official website. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 130,
    "featured": false,
    "image": "company-earthen.webp"
  },
  "workongrid": {
    "sectorLabel": "Grid intelligence",
    "tagline": "Utility data that supports more reliable services.",
    "stage": "Commercial enabling platform",
    "metrics": [
      {
        "label": "Meters on platform",
        "value": "10M+",
        "unit": "meters",
        "evidence": "Reported platform reach",
        "note": "The source describes live and onboarded meters; the active unique count is to be confirmed."
      },
      {
        "label": "Utility deployments",
        "value": "20+",
        "unit": "deployments",
        "evidence": "Reported adoption",
        "note": "Cutoff not stated; not a count of avoided-emissions projects."
      },
      {
        "label": "Investigation time reduction",
        "value": "75",
        "unit": "%",
        "evidence": "Company-reported case",
        "note": "Oman water-utility case only; source period not stated."
      },
      {
        "label": "Issues resolved within service target",
        "value": "",
        "unit": "%",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "The software has material reported reach and a named operational case. Operational workflow changes are measured before inferring physical electricity or water savings.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 18; WorkonGrid investment memo, p. 17. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 140,
    "featured": false
  },
  "prithu": {
    "sectorLabel": "Regenerative agriculture",
    "tagline": "Connecting regenerative farming with credible carbon markets.",
    "stage": "Field implementation / pre-issuance",
    "metrics": [
      {
        "label": "Farmers enrolled",
        "value": "35,000+",
        "unit": "farmers",
        "evidence": "Reported participation",
        "note": "Enrolment, not proof of verified practice adoption or income increase."
      },
      {
        "label": "Land enrolled",
        "value": "43,000",
        "unit": "hectares",
        "evidence": "Reported programme reach",
        "note": "Onboarded area; separate from verified practice hectares."
      },
      {
        "label": "Verified practice adoption",
        "value": "",
        "unit": "hectares",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Payments made to farmers",
        "value": "",
        "unit": "INR paid",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Farmer and land enrolment is reported. First registry registration is a future milestone, so credit issuance or carbon removal is not presented as achieved.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 19. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 150,
    "featured": false,
    "image": "company-prithu.webp"
  },
  "zerodrag": {
    "sectorLabel": "Enabling electronics",
    "tagline": "Avionics and control systems for drone applications.",
    "stage": "Commercial components / end-use review",
    "metrics": [
      {
        "label": "Avionics units sold",
        "value": "2,000+",
        "unit": "units",
        "evidence": "Reported sales output",
        "note": "Not a count of climate-qualified deployments."
      },
      {
        "label": "Documented climate-use share",
        "value": "",
        "unit": "% of deployed units",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Task energy intensity",
        "value": "",
        "unit": "Wh / task",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Modules repaired or reused",
        "value": "",
        "unit": "modules",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Avionics sales are real commercial activity, but the climate contribution depends on the eventual application and measured task-level benefit.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 20. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 160,
    "featured": false,
    "image": "company-zerodrag.webp"
  },
  "albatross-energetics": {
    "sectorLabel": "Efficient cooling",
    "tagline": "Lower-energy cooling and humidity control.",
    "stage": "Operating field pilots",
    "metrics": [
      {
        "label": "Pilots deployed",
        "value": "2",
        "unit": "pilots",
        "evidence": "Reported pilot deployment",
        "note": "Commercial and industrial warehouse pilots; cutoff not stated."
      },
      {
        "label": "Pilot energy saving",
        "value": "~25",
        "unit": "%",
        "evidence": "Company-reported pilot",
        "note": "Versus cooling-plus-reheat, including regeneration and auxiliary energy."
      },
      {
        "label": "Demonstrated supply airflow",
        "value": "1,500",
        "unit": "CFM",
        "evidence": "Reported pilot performance",
        "note": "Disclosed alongside 40–50% relative humidity."
      },
      {
        "label": "Demonstrated humidity range",
        "value": "40–50",
        "unit": "% RH",
        "evidence": "Reported pilot performance",
        "note": "A pilot operating range, not a guaranteed all-site claim."
      }
    ],
    "evidence": "Two pilots have a bounded reported energy comparison and service-performance envelope, reported here as pilot results.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 21. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 170,
    "featured": false,
    "image": "company-albatross.webp"
  },
  "helionis-labs": {
    "sectorLabel": "Efficient electronics",
    "tagline": "Thermal substrates for higher-performing power electronics.",
    "stage": "Materials prototype / qualification",
    "metrics": [
      {
        "label": "Thermal conductivity measured",
        "value": "2.52",
        "unit": "W/m·K",
        "evidence": "In-house test",
        "note": "Not third-party certified; measured at 2.52 ± 0.09 W/m·K."
      },
      {
        "label": "Junction-temperature reduction",
        "value": "",
        "unit": "°C",
        "evidence": "Test evidence to be confirmed",
        "note": ""
      },
      {
        "label": "Working prototype",
        "value": "Built",
        "unit": "milestone",
        "evidence": "Reported prototype",
        "note": "Working prototype built; materials tested in-house."
      },
      {
        "label": "OEM qualification",
        "value": "PoC samples requested",
        "unit": "milestone",
        "evidence": "Qualification stage",
        "note": "OEM sample requests reported; independent validation is next."
      }
    ],
    "evidence": "Source evidence is bench validation and a working prototype; independent validation and OEM qualification are still to follow.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 22; Helionis Labs company deck, p. 6. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 180,
    "featured": false,
    "image": "company-helionis.webp"
  },
  "suind": {
    "sectorLabel": "Precision agriculture",
    "tagline": "Autonomous crop care with precise field application.",
    "stage": "Commercial field deployments",
    "metrics": [
      {
        "label": "Area covered, reported",
        "value": "3,000+",
        "unit": "acres",
        "evidence": "Reported field activity",
        "note": "Repeat passes may be counted; not unique land."
      },
      {
        "label": "Flight hours recorded",
        "value": "2,000+",
        "unit": "hours",
        "evidence": "Reported field use",
        "note": "Cumulative flight exposure."
      },
      {
        "label": "Seasonal agrochemical intensity",
        "value": "",
        "unit": "kg active / ha / season",
        "evidence": "Reporting field",
        "note": ""
      },
      {
        "label": "Seasonal spray-water intensity",
        "value": "",
        "unit": "L / ha / season",
        "evidence": "Reporting field",
        "note": ""
      }
    ],
    "evidence": "Reported field activity and flight experience are available. Resource-use comparisons must cover a full matched crop season rather than one spray pass.",
    "sources": "Transition VC Fund I One Page Portfolio Overview, p. 23. Values with no stated cutoff are source snapshots, not current-quarter totals.",
    "order": 190,
    "featured": false,
    "image": "company-suind.webp"
  }
};

/** SDG explorer: entries name a portfolio company (slug) or carry a label (Transition VC, a team). */
export const sdgGoals: { number: number; title: string; summary: string; entries: { company?: string; label?: string; connection: string; measures: string }[] }[] = [
  {
    "number": 6,
    "title": "Clean Water and Sanitation",
    "summary": "Enabling smarter water management through utility analytics and precise crop spraying.",
    "entries": [
      {
        "connection": "Water-utility analytics enabling faster investigation of losses and service issues.",
        "measures": "Investigation time reduction, Issues resolved within service target",
        "company": "workongrid"
      },
      {
        "connection": "Precision crop spraying targeting lower seasonal water use per hectare.",
        "measures": "Seasonal spray-water intensity, Area covered, reported",
        "company": "suind"
      },
      {
        "connection": "Planned smart-water applications extending communications beyond current electricity-meter deployments.",
        "measures": "Endpoints communicating, Successful meter-read rate",
        "company": "comminent"
      }
    ]
  },
  {
    "number": 7,
    "title": "Affordable and Clean Energy",
    "summary": "Supporting renewable generation, electrification, storage and more efficient energy use.",
    "entries": [
      {
        "connection": "Battery systems enabling electrification, with clean-energy benefit dependent on charging supply.",
        "measures": "Battery packs deployed, Electric distance enabled",
        "company": "emo-energy"
      },
      {
        "connection": "Efficient motors targeting lower electricity demand for equivalent mechanical service.",
        "measures": "Drive-cycle efficiency gain, Electricity saved at monitored sites",
        "company": "matel-motion"
      },
      {
        "connection": "Prototype fuel cells targeting efficient electricity, conditional on low-emission hydrogen supply.",
        "measures": "Net electrical efficiency, Continuous run demonstrated",
        "company": "protonas"
      },
      {
        "connection": "Charging converters supporting efficient electricity delivery through operating energy infrastructure.",
        "measures": "Weighted conversion efficiency, Energy delivered in service",
        "company": "dynolt"
      },
      {
        "connection": "Industrial heat recovery and heat pumps supporting more efficient process heating.",
        "measures": "Useful heat delivered, Net purchased energy saved",
        "company": "promethean-energy"
      },
      {
        "connection": "Pre-pilot resource pooling targeting lower electricity use for equivalent computing workloads.",
        "measures": "Energy per matched workload, Productive resource utilisation",
        "company": "cimware"
      },
      {
        "connection": "Meter communications enabling electricity-network visibility, operational management and targeted utility action.",
        "measures": "Endpoints communicating, Successful meter-read rate",
        "company": "comminent"
      },
      {
        "connection": "Industrial electrolysers supporting hydrogen production, with clean-energy relevance conditional on electricity sourcing.",
        "measures": "Electrolyser capacity live, System electricity intensity",
        "company": "hydgen"
      },
      {
        "connection": "Wind maintenance supporting renewable electricity generation and availability of client-owned assets.",
        "measures": "Wind electricity generated, Full-fleet availability",
        "company": "greentech-mw"
      },
      {
        "connection": "Heat-storage pilots targeting industrial heat from renewable electricity, with performance under validation.",
        "measures": "Pilots underway, Thermal round-trip efficiency",
        "company": "earthen"
      },
      {
        "connection": "Utility analytics enabling operational improvements through meter data and targeted electricity-loss investigations.",
        "measures": "Utility deployments, Issues resolved within service target",
        "company": "workongrid"
      },
      {
        "connection": "Cooling pilots targeting lower electricity use while maintaining equivalent humidity and airflow.",
        "measures": "Pilot energy saving, Demonstrated humidity range",
        "company": "albatross-energetics"
      }
    ]
  },
  {
    "number": 8,
    "title": "Decent Work and Economic Growth",
    "summary": "Supporting skilled employment across manufacturing, deployment and industrial operations.",
    "entries": [
      {
        "connection": "Employs wind technicians and local workers, with documented engineering recruitment and early-career roles at operating sites.",
        "measures": "Employees, Early-career hires",
        "company": "greentech-mw"
      },
      {
        "connection": "Builds power-electronics capability through an in-house team spanning engineering, firmware, production, validation and field service.",
        "measures": "Reported team size, Engineering team",
        "company": "dynolt"
      },
      {
        "connection": "Maintains a team with drive-design, manufacturing and commercial skills supporting domestically developed industrial and mobility systems.",
        "measures": "Reported team size",
        "company": "matel-motion"
      }
    ]
  },
  {
    "number": 9,
    "title": "Industry, Innovation and Infrastructure",
    "summary": "Backing cleaner industrial technologies, efficient infrastructure and domestic innovation.",
    "entries": [
      {
        "connection": "Deployed battery engineering strengthening electric-mobility systems through pack and thermal-management design.",
        "measures": "Battery packs deployed, Tested cycle life",
        "company": "emo-energy"
      },
      {
        "connection": "Domestic motors and controllers improving industrial, pumping and electric-mobility systems.",
        "measures": "Motors deployed, Drive-cycle efficiency gain",
        "company": "matel-motion"
      },
      {
        "connection": "Fuel-cell prototypes developing local engineering capability for future power and mobility applications.",
        "measures": "Prototype design output, Continuous run demonstrated",
        "company": "protonas"
      },
      {
        "connection": "Deployed charging electronics strengthening power-conversion infrastructure for electric mobility and distributed energy.",
        "measures": "Chargers deployed, Weighted conversion efficiency",
        "company": "dynolt"
      },
      {
        "connection": "Operating heat recovery and heat pumps upgrading industrial energy infrastructure.",
        "measures": "Useful heat delivered, Net purchased energy saved",
        "company": "promethean-energy"
      },
      {
        "connection": "Reusable packaging and logistics services improving resource use across industrial supply chains.",
        "measures": "Freight emissions intensity, Single-use material displaced",
        "company": "fitsol"
      },
      {
        "connection": "Pre-pilot resource pooling developing more efficient, adaptable data-centre infrastructure.",
        "measures": "First customer pilot, Energy per matched workload",
        "company": "cimware"
      },
      {
        "connection": "Locally developed communications connecting smart-meter infrastructure and supporting utility data availability.",
        "measures": "Endpoints communicating, Successful meter-read rate",
        "company": "comminent"
      },
      {
        "connection": "Electrolyser engineering building industrial hydrogen capability, with environmental contribution dependent on energy sourcing.",
        "measures": "Electrolyser capacity live, System electricity intensity",
        "company": "hydgen"
      },
      {
        "connection": "Wind maintenance, monitoring and component repair supporting existing renewable-energy infrastructure.",
        "measures": "Wind capacity under O&M, Full-fleet availability",
        "company": "greentech-mw"
      },
      {
        "connection": "Photobioreactor pilots developing industrial CO₂-utilisation systems through continuous-operation and conversion testing.",
        "measures": "Continuous pilot operation, Pilot CO2 conversion",
        "company": "intrinsic-foundries"
      },
      {
        "connection": "Heat-storage pilots developing infrastructure for electrified industrial process heating.",
        "measures": "Pilots underway, Specified heat delivery",
        "company": "earthen"
      },
      {
        "connection": "Utility data platforms integrating meters and assets to support operational workflows.",
        "measures": "Utility deployments, Investigation time reduction",
        "company": "workongrid"
      },
      {
        "connection": "Locally designed avionics developing domestic electronics capability through standardised, serviceable components.",
        "measures": "Avionics units sold, Task energy intensity",
        "company": "zerodrag"
      },
      {
        "connection": "Locally developed cooling pilots testing industrial efficiency and humidity-control performance.",
        "measures": "Pilots deployed, Pilot energy saving",
        "company": "albatross-energetics"
      },
      {
        "connection": "Printed thermal-substrate prototypes developing domestic power-electronics materials through testing and OEM qualification.",
        "measures": "Thermal conductivity measured, OEM qualification",
        "company": "helionis-labs"
      },
      {
        "connection": "Commercial crop-care drones applying autonomous robotics to precision agricultural operations.",
        "measures": "Area covered, reported, Flight hours recorded",
        "company": "suind"
      }
    ]
  },
  {
    "number": 10,
    "title": "Reduced Inequalities",
    "summary": "Supporting smallholder participation in climate finance through farmer benefit sharing.",
    "entries": [
      {
        "connection": "Aggregates smallholder farmers and farmer organisations into regenerative agriculture programmes, with a proposed mechanism for sharing carbon-market proceeds with farmers.",
        "measures": "Farmers enrolled, Payments made to farmers",
        "company": "prithu"
      }
    ]
  },
  {
    "number": 11,
    "title": "Sustainable Cities and Communities",
    "summary": "Supporting cleaner urban mobility, efficient logistics and smarter city infrastructure.",
    "entries": [
      {
        "connection": "Battery systems enabling urban electric delivery, with benefits dependent on actual fleet substitution.",
        "measures": "Battery packs deployed, Electric distance enabled",
        "company": "emo-energy"
      },
      {
        "connection": "Motors and controllers enabling electric two- and three-wheeler urban mobility.",
        "measures": "Motors deployed, Drive-cycle efficiency gain",
        "company": "matel-motion"
      },
      {
        "connection": "Charging electronics enabling urban electric fleets, with benefits dependent on electricity sourcing.",
        "measures": "Chargers deployed, Energy delivered in service",
        "company": "dynolt"
      },
      {
        "connection": "City-meter communications and planned lighting applications supporting connected urban utility services.",
        "measures": "Endpoints communicating, Successful meter-read rate",
        "company": "comminent"
      },
      {
        "connection": "Metering and street-lighting platforms supporting more responsive city utility operations.",
        "measures": "Utility deployments, Issues resolved within service target",
        "company": "workongrid"
      }
    ]
  },
  {
    "number": 12,
    "title": "Responsible Consumption and Production",
    "summary": "Reducing resource intensity through reuse, repair and more efficient production.",
    "entries": [
      {
        "connection": "Battery durability engineering targeting longer useful service and lower replacement demand.",
        "measures": "Tested cycle life, Battery packs deployed",
        "company": "emo-energy"
      },
      {
        "connection": "Selected rare-earth-free motor designs targeting lower dependence on critical material inputs.",
        "measures": "Rare-earth-free units delivered, Motors deployed",
        "company": "matel-motion"
      },
      {
        "connection": "Industrial waste-heat recovery turning discarded thermal energy into useful process heating.",
        "measures": "Useful heat delivered, Net purchased energy saved",
        "company": "promethean-energy"
      },
      {
        "connection": "Reusable packaging targeting lower single-use material demand through completed reuse cycles.",
        "measures": "Packaging reuse cycles, Single-use material displaced",
        "company": "fitsol"
      },
      {
        "connection": "Pre-pilot resource pooling targeting better hardware utilisation and lower equipment requirements.",
        "measures": "Productive resource utilisation, Compute delivered per rack",
        "company": "cimware"
      },
      {
        "connection": "Sustainability workflows enabling environmental reporting, decision support and documented organisational action.",
        "measures": "Risks with recorded action, Assessment turnaround",
        "company": "greenfi"
      },
      {
        "connection": "Wind component repair and maintenance supporting continued use of existing equipment.",
        "measures": "Wind capacity under O&M, Full-fleet availability",
        "company": "greentech-mw"
      },
      {
        "connection": "CO₂-utilisation pilots producing biomass, with environmental benefit dependent on substitution and carbon fate.",
        "measures": "Pilot CO2 conversion, Pilot biomass density",
        "company": "intrinsic-foundries"
      },
      {
        "connection": "Regenerative farming programmes targeting improved soil and resource management through verified practice adoption.",
        "measures": "Verified practice adoption, Land enrolled",
        "company": "prithu"
      },
      {
        "connection": "Serviceable avionics and lifecycle support enabling potential component repair and reuse.",
        "measures": "Modules repaired or reused, Avionics units sold",
        "company": "zerodrag"
      },
      {
        "connection": "Additive printed-substrate prototypes targeting less manufacturing waste and fewer etching steps.",
        "measures": "Working prototype, OEM qualification",
        "company": "helionis-labs"
      },
      {
        "connection": "Precision crop spraying targeting lower seasonal agrochemical and water use.",
        "measures": "Seasonal agrochemical intensity, Seasonal spray-water intensity",
        "company": "suind"
      }
    ]
  },
  {
    "number": 13,
    "title": "Climate Action",
    "summary": "Backing technologies for emissions reduction across energy, transport and industry.",
    "entries": [
      {
        "connection": "Battery systems enabling fleet electrification, conditional on charging supply and displaced vehicles.",
        "measures": "Battery packs deployed, Electric distance enabled",
        "company": "emo-energy"
      },
      {
        "connection": "Efficient motors and electric drivetrains targeting lower emissions for equivalent operating service.",
        "measures": "Drive-cycle efficiency gain, Electricity saved at monitored sites",
        "company": "matel-motion"
      },
      {
        "connection": "Prototype fuel cells targeting lower emissions, conditional on hydrogen sourcing and displaced alternatives.",
        "measures": "Net electrical efficiency, Continuous run demonstrated",
        "company": "protonas"
      },
      {
        "connection": "Charging converters enabling electrification, with climate benefit dependent on energy and application baselines.",
        "measures": "Weighted conversion efficiency, Energy delivered in service",
        "company": "dynolt"
      },
      {
        "connection": "Operating heat recovery and heat pumps targeting lower industrial process-energy emissions.",
        "measures": "Useful heat delivered, Net purchased energy saved",
        "company": "promethean-energy"
      },
      {
        "connection": "Logistics optimisation and reusable packaging targeting lower freight and material-related emissions.",
        "measures": "Freight emissions intensity, Single-use material displaced",
        "company": "fitsol"
      },
      {
        "connection": "Pre-pilot computing architecture targeting lower energy demand and associated electricity emissions.",
        "measures": "Energy per matched workload, Productive resource utilisation",
        "company": "cimware"
      },
      {
        "connection": "Meter connectivity enabling utility action toward lower physical grid losses and associated emissions.",
        "measures": "Endpoints communicating, Successful meter-read rate",
        "company": "comminent"
      },
      {
        "connection": "Industrial electrolysers targeting lower-emission hydrogen, conditional on electricity sourcing and displaced production.",
        "measures": "Electrolyser capacity live, System electricity intensity",
        "company": "hydgen"
      },
      {
        "connection": "Climate-risk analytics enabling mitigation and adaptation decisions through documented climate-related user actions.",
        "measures": "Risks with recorded action, Signed institutional contracts",
        "company": "greenfi"
      },
      {
        "connection": "Wind maintenance supporting renewable generation, with company-estimated emissions avoided on client-owned assets.",
        "measures": "Wind electricity generated, Estimated emissions avoided",
        "company": "greentech-mw"
      },
      {
        "connection": "CO₂-utilisation pilots targeting climate benefits, conditional on lifecycle inputs and eventual carbon fate.",
        "measures": "Pilot CO2 conversion, Continuous pilot operation",
        "company": "intrinsic-foundries"
      },
      {
        "connection": "Heat-storage pilots targeting industrial decarbonisation, conditional on charging electricity and displaced heat sources.",
        "measures": "Pilots underway, Thermal round-trip efficiency",
        "company": "earthen"
      },
      {
        "connection": "Utility analytics enabling physical loss investigations and action toward lower energy-related emissions.",
        "measures": "Utility deployments, Issues resolved within service target",
        "company": "workongrid"
      },
      {
        "connection": "Regenerative farming programmes targeting soil-carbon outcomes, with verification and issuance still pending.",
        "measures": "Verified practice adoption, Land enrolled",
        "company": "prithu"
      },
      {
        "connection": "Cooling pilots targeting lower electricity-related emissions at equivalent humidity and airflow.",
        "measures": "Pilot energy saving, Demonstrated humidity range",
        "company": "albatross-energetics"
      }
    ]
  },
  {
    "number": 17,
    "title": "Partnerships for the Goals",
    "summary": "Connecting founders with research expertise, industry partners and growth capital.",
    "entries": [
      {
        "connection": "Licenses catalyst intellectual property from the National University of Singapore, linking university research with electrolyser technology development.",
        "measures": "Licensed university technology",
        "company": "hydgen"
      },
      {
        "connection": "Tested Albatross’s dehumidification system through FLCTD, with Promethean Energy hosting the pilot in an industrial setting.",
        "measures": "Joint pilot validation",
        "company": "albatross-energetics"
      },
      {
        "connection": "Works with specialist partners in blade repair, turbine monitoring and component replacement to maintain ageing wind assets.",
        "measures": "Technical collaborations",
        "company": "greentech-mw"
      },
      {
        "connection": "Connects portfolio companies with follow-on capital, hiring introductions and business development support through its active ownership approach.",
        "measures": "Documented support engagements",
        "label": "Transition VC"
      },
      {
        "connection": "Supported GreenTech’s governance and finance capability, with documented CFO onboarding and support in securing growth financing.",
        "measures": "Documented finance and governance support",
        "label": "Transition VC × GreenTech"
      }
    ]
  },
  {
    "number": 5,
    "title": "Gender Equality",
    "summary": "Women lead portfolio growth, corporate partnerships, marketing, and people operations.",
    "entries": [
      {
        "connection": "Leads corporate partnerships at Transition VC, making women’s leadership visible in the manager’s industry engagement.",
        "measures": "",
        "label": "Navi Sharma"
      },
      {
        "connection": "Leads portfolio growth at Transition VC, placing women in a role supporting portfolio development and company progress.",
        "measures": "",
        "label": "Yashodhara Bakliwal"
      },
      {
        "connection": "Women lead Transition VC’s marketing function, shaping the firm’s communication and public presentation across its channels.",
        "measures": "",
        "label": "Marketing"
      },
      {
        "connection": "Women lead people, operations and administration functions, with responsibilities across the manager’s internal teams and everyday operations.",
        "measures": "",
        "label": "People & Operations"
      }
    ]
  }
];
