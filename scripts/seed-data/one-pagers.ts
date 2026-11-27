// Public-safe content from the Fund I one-pagers (Transition VC Fund I One Page
// Portfolio Overview), keyed by company slug. Deliberately left out: funds raised,
// revenue and revenue targets, margins, live rounds, grants/debt, order books and
// return projections — and the deal-pipeline companies entirely.
//
// Callout positions (x/y, % of the image) follow the renders in the one-pagers;
// adjust them in the CMS once a clean product image is uploaded.

export type OnePager = {
  callouts?: { label: string; detail?: string; x: number; y: number }[];
  proofValue?: string;
  proofLabel?: string;
  deployment?: string;
  customers?: string;
  marketGap?: string;
  breakthrough?: string;
  traction?: string[];
  marketOpportunity?: string;
  whyTheyWin?: string;
};

export const onePagers: Record<string, OnePager> = {
  "emo-energy": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    proofValue: "20,000+",
    proofLabel: "battery packs deployed",
    deployment: "20,000+ battery packs",
    customers: "JBM, Quantum, Booma Motors",
    marketGap:
      "Battery packs lack robust thermal management and predictive health, leading to failures, recalls and high total cost of ownership. Without reliable 20–30 minute top-up charging, 2W/3W fleets for e-commerce and quick-commerce cannot scale.",
    breakthrough:
      "Immersion-cooled battery packs with in-house BMS, thermal management and AI-driven health models, for faster charging, around 40% longer cell life and fire-safe performance. The 2 kWh ZenPac charges to ~80% in about 20 minutes.",
    traction: [
      "20,000+ battery packs deployed with TVS, Kinetic, Hero, Domino's and Blinkit",
      "Advanced discussions with Tier-1 OEMs including Tata and JBM",
      "Integrated ecosystem: batteries, BESS, fast chargers and fleet software",
    ],
    marketOpportunity:
      "A $79Bn addressable market across mobility and battery energy storage by 2030: last-mile 2W, commercial trucks, light mobility and C&I storage.",
    whyTheyWin:
      "One of few Indian battery companies owning the full stack: pack, BMS, thermal management and software. Its immersion-cooled architecture is built for Indian duty cycles, with AIS-156 compliance and deep OEM and fleet integration.",
  },
  "matel-motion": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    proofValue: "200,000+",
    proofLabel: "motors deployed",
    deployment: "200,000+ motors across mobility and pumps",
    customers: "TI (Murugappa), EKA, Piaggio, KSB, Kirloskar, Ecozen",
    marketGap:
      "Motors consume half of all electrical energy globally. In India most EV motors are imported, pushing up costs, limiting serviceability and exposing OEMs to rare-earth supply-chain risk.",
    breakthrough:
      "Integrated drivetrains (motors, controllers and BMS, including magnet-free designs) with up to 12% better drive-cycle efficiency. Applications extend from EV powertrains to industrial motors for textiles, HVAC, compressors and pumps.",
    traction: [
      "200,000+ motors deployed across mobility and pumps",
      "Customers include TI (Murugappa), EKA, Piaggio, KSB, Kirloskar and Ecozen",
      "Multiple in-house machines for manufacturing and testing",
    ],
    marketOpportunity: "A $2.5Bn market for EV powertrains and $0.9Bn for energy-efficient industrial motors.",
    whyTheyWin:
      "Competitors build either the motor or the controller. Matel integrates the full drivetrain plus data and telemetry, delivering higher efficiency, faster iteration and OEM-grade serviceability, while reducing rare-earth dependence.",
  },
  protonas: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "500 W prototype, scaling to 2 kW systems and drones",
    marketGap:
      "PEM fuel cells under 15 kW remain expensive and complex, blocking adoption for power and telecom backup and light hydrogen mobility. Imported stacks cost $1–2/W, keeping system costs high.",
    breakthrough:
      "Closed-cathode, air-cooled stacks (1–2 kW) for backup and liquid-cooled 12 kW stacks for mobility: mechanically simple, serviceable, and designed to be made in India at around $0.30/W.",
    traction: [
      "500 W prototype designed; scaling to 2 kW backup systems and drone applications",
      "Three IP filings across the fuel cell stack and design",
      "MoU signed with one of India's largest aerospace companies",
    ],
    marketOpportunity:
      "Long-duration backup in North America is a ~$6Bn market; telecom tower backup and diesel-generator replacement add $3–3.2Bn.",
    whyTheyWin:
      "Proprietary processes for low-cost bipolar plate coatings and catalyst ink, combined with the founder's domain depth, let Protonas build fuel cells at competitive cost.",
  },
  dynolt: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    proofValue: "100,000+",
    proofLabel: "EV chargers deployed",
    deployment: "100,000+ chargers",
    customers: "River, Exide, Yulu",
    marketGap:
      "Power converters in India are nearly all imported and built on costly, inflexible ASIC designs. As EV and green hydrogen adoption accelerates, localising rapidly customisable converters is critical.",
    breakthrough:
      "Microcontroller-based, software-defined converters for EV chargers, battery swap stations, solar inverters and electrolysers, with faster customisation, lower cost and shorter development cycles than ASIC designs.",
    traction: [
      "100,000+ chargers deployed",
      "Customers include Yulu, River, Exide, Numeros, Kazam, EMO Energy, Simple Energy and Bounce",
      "Product range from 400 W to 3.5 kW; DC fast chargers in development",
    ],
    marketOpportunity:
      "On-board EV chargers growing from $369M to $1.6Bn, rooftop solar inverters from $750M to $3Bn, and public charging stations from $33M to $140M.",
    whyTheyWin:
      "Proprietary control software makes products clone-resistant and modular, with asset-light scaling, and eases the move to next-generation GaN and SiC semiconductors.",
  },
  "promethean-energy": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "50+ heat pumps and 20 MW+ of heat recovered",
    customers: "Honda, Suzuki, Daimler, Unilever, Godrej, Raymond",
    marketGap:
      "Indian industry wastes low-to-mid grade heat (under 150°C) from compressors, boilers and chillers, with few reliable ways to recover it. That leaves an unused route to cutting Scope 1 and 2 emissions and energy costs.",
    breakthrough:
      "Modular waste-heat recovery products and high-temperature heat pumps with IoT monitoring, delivering energy savings of up to 40%: CompMate, ChillerMate and FlowTherm.",
    traction: [
      "Deployed at Honda, Suzuki, Daimler, Unilever, Ashok Leyland, Godrej and Raymond",
      "In-house manufacturing, free from dependence on China",
    ],
    marketOpportunity:
      "India's low-grade heat recovery market is estimated at ~$9Bn, within a ~$198Bn global industrial heat opportunity.",
    whyTheyWin:
      "Fast design-to-deployment, IoT-backed performance and ESCO alignment make the solutions bankable, with payback typically under 24 months.",
  },
  fitsol: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "80+ customers across green logistics and carbon SaaS",
    customers: "Amazon, TVS, JK Tyres, Exide, Lumax, Penguin, JBM, Moonlight",
    marketGap:
      "Enterprises face rising pressure from CBAM, CSRD and Scope 3 mandates, yet most ESG tools only offer reporting, not real emission reduction.",
    breakthrough:
      "A full-stack \"Decarbonisation-as-a-Service\" model combining green logistics execution (packaging reuse, fleet optimisation, warehousing) with KYOTO SaaS for automated Scope 1–3 accounting and compliance-ready reporting.",
    traction: [
      "Customers include Amazon, TVS, JK Tyres, Exide, Lumax, Penguin, JBM and Moonlight",
      "First international engagement via Padmini, supporting Ford Motors (USA)",
    ],
    marketOpportunity:
      "Scope 3 accounts for 70–90% of corporate emissions, with transport over 60%. Logistics decarbonisation alone is a ~$10Bn opportunity in India.",
    whyTheyWin:
      "While most ESG SaaS players stop at monitoring, Fitsol's vertical integration of logistics operations and software delivers verifiable emission cuts and cost savings.",
  },
  cimware: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "Pilot stage",
    marketGap:
      "Data centres waste compute, memory and storage because Ethernet-based racks can't easily share resources across servers. The missing piece is a rack-level fabric that pools them.",
    breakthrough:
      "A Composable Infrastructure Module: a top-of-rack smart switch that virtualises server resources into a shared pool using PCIe, turning idle compute, memory and storage into shared infrastructure.",
    traction: [
      "Internal testing shows 66–68% capex reduction and up to 75% power savings",
      "Patent granted (US9892079B2)",
      "Samsung manufacturing partner status",
    ],
    marketOpportunity: "India's cloud and data-centre spend is projected at ~$99Bn by 2030, with AI driving exponential compute demand.",
    whyTheyWin:
      "Hardware-path composability at the top of rack pools resources with lower latency and fewer moving parts than network-layer disaggregation, and more convergence than PCIe-only peers.",
  },
  comminent: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    proofValue: "1.5M+",
    proofLabel: "smart-meter radio cards shipped",
    deployment: "1.5M+ NIC cards",
    customers: "Gridcrest (Iskraemeco), Ripples, Kaynes",
    marketGap:
      "India's 250-million smart-meter rollout strains SIM-based connectivity on cost and reliability, while utilities need meter-agnostic networks and scalable head-end systems.",
    breakthrough:
      "A standards-based RF-mesh platform spanning NICs, repeaters and DCUs with an open-API head-end. It is India's first device-agnostic mesh for smart metering, street lighting and water utilities.",
    traction: [
      "1.5M+ NIC cards shipped",
      "Validated by 10+ leading AMI service providers",
      "Expanding into smart water and smart lighting",
      "International expansion underway across Brazil, ASEAN, Africa and Japan",
    ],
    marketOpportunity: "India targets 250 million smart meters under RDSS, a ~$5Bn opportunity across AMI hardware, communications and services.",
    whyTheyWin:
      "Unlike SIM-only or protocol-only offers, Comminent owns the stack (hardware, firmware and head-end), giving utilities performance, cost control and vendor neutrality across mixed meter fleets.",
  },
  hydgen: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "90 kW live; 200 kW+ in pipeline",
    customers: "Mudas Diamonds, Kira Diamonds, AVP Star, C6 Diamonds",
    marketGap:
      "Green hydrogen is held back by alkaline systems with low efficiency and slow start, and by PEM systems with high capex and iridium/platinum dependency.",
    breakthrough:
      "Anion-exchange membrane (AEM) stacks that eliminate iridium, run stably under renewable intermittency and deliver 99.99% purity, targeting hydrogen under ~$3/kg with a modular stack design.",
    traction: [
      "90 kW of green hydrogen systems live at lab-grown diamond manufacturers",
      "Additional 100 kW in pipeline",
      "Setting up a 20 MW manufacturing facility",
    ],
    marketOpportunity:
      "A ~$5Bn opportunity by 2030 substituting grey hydrogen across chemicals, pharmaceuticals, diamond manufacturing and food processing.",
    whyTheyWin:
      "Materials-science depth in membranes and coatings removes iridium dependence and improves part-load behaviour, while local, modular stacks shorten lead times and lower total cost of ownership.",
  },
  greenfi: {
    callouts: [{ label: "AI-powered ESG risk management", detail: "Identifies ESG risks across supply chains", x: 18, y: 40 }],
    customers: "United Overseas Bank, KIIFB",
    marketGap:
      "Financial institutions and corporates must assess ESG risk across portfolios, but diligence is manual: 6+ hours per transaction across 26+ parameters.",
    breakthrough:
      "An AI-powered ESG risk platform for financial institutions: a data hub aggregating disclosures, news and third-party data; composite AI that surfaces hidden risks; and automated workflows for due diligence and reporting.",
    traction: [
      "16 enterprise pilots including BNP Paribas, Eastern Insurance, Puma and Qatar Islamic Bank",
      "100% customer retention",
    ],
    marketOpportunity:
      "Compliance-driven ESG software is scaling as BFSI operationalises cross-jurisdiction reporting, accelerated by BRSR and CBAM, a ~$2Bn global market for financial institutions.",
    whyTheyWin:
      "30% cheaper and 2x faster than named peers, with \"load-once, comply-many\" templates and domain-tuned AI that embed into BFSI risk workflows.",
  },
  "greentech-mw": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    proofValue: "350+ MW",
    proofLabel: "wind capacity under management",
    deployment: "350+ MW under management across India and Vietnam",
    customers: "Leap Green, Hero Group",
    marketGap:
      "India's 50 GW wind fleet is ageing, with 30+ GW exiting OEM warranties by 2030. As global OEMs scale back, owners are left with expensive contracts, fragmented vendors and high downtime.",
    breakthrough:
      "An OEM-agnostic O&M stack combining SCADA analytics and predictive diagnostics with craneless repair, in-house blade imaging and regional repair hubs, for over 95% availability at 20–25% lower cost than OEMs.",
    traction: [
      "350+ MW of assets under management across India",
      "Expanding into Vietnam; exploring repowering for European wind OEMs",
      "Repeat, multi-site contracts with Leap Green and Hero Group",
    ],
    marketOpportunity:
      "India's wind O&M market is ~$424M by 2030 (~30 GW addressable), within a ~$12Bn global opportunity across Europe, MENA and South-East Asia.",
    whyTheyWin:
      "Craneless repair techniques cut major repair costs by up to 80%, and blade imaging plus predictive analytics raise uptime. As global OEMs leave India, owners need a reliable multi-brand operator.",
  },
  "intrinsic-foundries": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "3 clients, 10 in pipeline",
    customers: "Pilots with Adani Power, ICGEB Delhi, Tata Steel",
    marketGap:
      "Industry drives most global CO₂ emissions, yet hard-to-abate sectors have few decarbonisation pathways. Amine-based carbon capture is capital-intensive, and legacy microalgae systems suffer contamination and slow kinetics.",
    breakthrough:
      "An engineered microalgae photobioreactor platform that converts industrial CO₂ into high-value biomaterials (phycocyanin, lutein, omega-3s), turning emissions from a cost into a product, with modular, contamination-resilient scale-up.",
    traction: [
      "Industrial pilot with Adani Power validating flue-gas CO₂ integration",
      "MoUs with Tata Steel, Vasu Chemicals and others",
      "10 kL reactor supported by CCAMP",
    ],
    marketOpportunity:
      "A ~$20Bn global opportunity by 2030 in carbon-utilisation biochemicals: proteins, pigments, lipids and carbohydrates from captured CO₂.",
    whyTheyWin:
      "Photobioreactor-based carbon capture outperforms amine and fermentation approaches with a ~4-year payback, overcoming the contamination and capex problems of legacy algae systems.",
  },
  earthen: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "2 clients, 25 active in pipeline",
    customers: "Gatsby Power; US pilot with Hindustan Copper",
    marketGap:
      "Solar and wind are intermittent, and no scalable, safe, low-cost flexible-duration storage exists today. Emissions from medium-temperature industrial heat remain largely unaddressed.",
    breakthrough:
      "Pods store 4 to 100+ hours of energy using CO₂ in a closed loop at low cost, while the Heat Battery uses intermittent renewable electricity to charge and discharge heat at 200–500°C.",
    traction: [
      "Thermal storage prototype (TRL 4) built in 2023 with 2 committed pilots",
      "Heat Battery prototype at TRL 6",
      "First India pilot with Hindustan Copper",
      "Supported by DOE, NSF, CalSEED, Ørsted and Newlab",
    ],
    marketOpportunity:
      "A ~$25Bn serviceable market across 100 investor-owned utilities, plus a ~$99Bn industrial heat opportunity. Medium-temperature heat is about 75% of industrial emissions.",
    whyTheyWin:
      "A patented sCO₂ thermodynamic cycle with a 30-year life and no degradation; unlike batteries, its cost per storage hour falls as duration grows.",
  },
  workongrid: {
    callouts: [{ label: "Transformer sensor monitoring", detail: "Monitors transformer health and prevents failures", x: 25, y: 15 }],
    proofValue: "10M+",
    proofLabel: "smart meters on the platform",
    deployment: "20+ clients, 10M+ meters and 100k+ IoT devices",
    customers: "Tata Power, Cuculus, Apraava Energy",
    marketGap:
      "Smart meters (3Bn+ by 2030) generate huge volumes of data, but it stays siloed across head-end, meter-data and billing systems, forcing consulting-heavy, custom-built solutions.",
    breakthrough:
      "A unified data and intelligence layer above HES, MDM and billing, with a no-code workflow engine for loss and theft detection, SLA tracking and field operations, and on-premises agentic AI that turns insights into action.",
    traction: [
      "20+ deployments with 10M+ meters and 100k+ IoT devices live",
      "Global partnerships with Itron, Honeywell and Landis+Gyr",
    ],
    marketOpportunity: "Global smart-meter software is a ~$11Bn annual market across workforce management, operations centres, analytics and AI.",
    whyTheyWin:
      "A hardware-agnostic overlay that integrates with existing systems instead of replacing them, deployed in weeks through no-code configuration rather than multi-year rollouts.",
  },
  prithu: {
    callouts: [
      { label: "Carbon credit lifecycle", detail: "Tracks credits from creation to verified retirement", x: 20, y: 60 },
      { label: "App and dashboard", detail: "Manages projects, farmer data and performance remotely", x: 78, y: 20 },
    ],
    deployment: "35,000+ farmers across 43,000 hectares",
    marketGap:
      "India has 2.5M+ hectares under organic and regenerative practices, yet farmers are cut off from carbon markets. Consultant-led verification is opaque and slow, and farmers capture under 30% of credit value.",
    breakthrough:
      "A full-stack carbon project developer: aggregating smallholder farmers on 10-year agreements and using in-house digital MRV (satellite and AI soil-carbon models, geo-tagged proof-of-work and audit trails) to issue verified credits.",
    traction: [
      "35,000+ farmers onboarded across 43,000 hectares",
      "On track for its first Gold Standard registration",
      "MoU for ~0.1M acres in Washim; ~200,000 ha across 6 projects",
      "Expanding into AWD rice and biochar",
    ],
    marketOpportunity:
      "The voluntary carbon market is projected at ~$8Bn by 2030; India's regenerative farmland alone represents a large soil-carbon opportunity.",
    whyTheyWin:
      "It builds credible carbon supply rather than trading credits. Its digital MRV lowers cost and improves issuance certainty, while FPO-anchored aggregation turns smallholders into long-term contracted assets.",
  },
  zerodrag: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "2,000+ units sold",
    customers: "Vega Drones, TF Vector, Sky Light Shows",
    marketGap:
      "India banned built-drone imports in 2022, but component supply chains still depend on Chinese OEMs, creating security and resilience risks, with weak after-sales support.",
    breakthrough:
      "A full-stack drone avionics manufacturer designing flight controllers, electronic speed controllers, receivers and propulsion systems for local and global demand.",
    traction: [
      "2,000+ units sold",
      "Hobby-to-enterprise variants outperforming Chinese alternatives on reliability",
    ],
    marketOpportunity: "Drone sub-components are a ~$1Bn global market and ~$109M in India.",
    whyTheyWin:
      "Cost-effective, robust components fill the gap between expensive global and non-secure imports, with plug-and-play solderless integration, better size-weight-power, and 5-year lifecycle support.",
  },
  "albatross-energetics": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "2 pilots, 6 in pipeline",
    customers: "Epic Group, Promethean Energy",
    marketGap:
      "Most factories control humidity by over-cooling and reheating air, wasting electricity, while other drying methods need very high heat. Existing liquid systems are efficient but complex, costly and raise safety concerns.",
    breakthrough:
      "A proprietary liquid-desiccant system that removes humidity without high-temperature heat. Its non-corrosive chemistry avoids expensive materials, and it integrates into existing air-handling units through a patented heat and mass exchanger.",
    traction: [
      "2 pilots (commercial and industrial warehouse) delivering ~25% energy savings",
      "System performance demonstrated at 1,500 CFM supply air with 40–50% RH",
      "Go-to-market partnerships with Enspar and Promethean Energy",
    ],
    marketOpportunity:
      "India's industrial dehumidification installed base is ~$2Bn across pharma, textiles, chemicals and food, with a ~$489M annual replacement and retrofit market.",
    whyTheyWin:
      "It resolves a trade-off that has stalled industrial dehumidification for decades: high performance at far lower energy intensity, with non-corrosive chemistry that cuts material cost and risk.",
  },
  "helionis-labs": {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "Pilot",
    marketGap:
      "High-power LEDs convert only 30–45% of input power into light; the rest becomes heat. The dielectric layer is the thermal bottleneck, and ceramic alternatives are costly, brittle and hard to scale.",
    breakthrough:
      "Helionis prints its own ceramic-filled dielectric directly onto aluminium, lifting thermal conductivity to ~2.5–2.9 W/m·K while halving thickness. Additive silver circuits cut junction temperature by up to ~20°C.",
    traction: [
      "In-house testing: ~2.52 W/m·K thermal conductivity, 25–35% above standard MCPCBs",
      "Early customer interest from Wipro, Bajaj, Surya Roshni and Varroc",
      "~22% lower cost per board; ASTM and IEC validation tests scheduled",
    ],
    marketOpportunity:
      "India's substrate market is ~$127M a year across residential, industrial, public-infrastructure and automotive LED lighting, with expansion into EV chargers, motor controllers and GaN/SiC power electronics.",
    whyTheyWin:
      "Owning the dielectric, the system's biggest thermal bottleneck, gives tunable chemistry and thickness, delivering high thermal performance at mass-market cost as a domestic supplier.",
  },
  // From the Fund I one-pager's former pipeline pages (public since Nov 2026). Left out:
  // rounds, revenue and revenue targets, qualified-pipeline values, deal volumes and returns.
  "perovskia-solar": {
    callouts: [
      { label: "Internet of Things", detail: "Powers connected devices using ambient light", x: 14, y: 30 },
      { label: "Consumer electronics", detail: "Extends battery life using ambient light", x: 62, y: 22 },
      { label: "Tracking sensor", detail: "Battery-free tracking and sensing devices", x: 48, y: 78 },
    ],
    deployment: "First recurring production contract, with Totem (USA)",
    customers: "Totem (USA); proofs of concept with Tata Motors, Logitech, Essilor, Honeywell, Dormakaba and Last Lock",
    marketGap:
      "Silicon solar is built for direct sunlight, not the billions of low-power devices that operate indoors. Its rigid form factor and weak diffuse-light performance leave wearables, sensors, smart locks and trackers dependent on batteries.",
    breakthrough:
      "Digitally printed \"designer\" PV cells harvest indoor and ambient light and are custom-shaped to each device, tuned to its exact current, voltage and power needs, with encapsulation targeting a 10+ year life.",
    traction: [
      "First recurring production contract signed with Totem (USA)",
      "Active or approved proofs of concept with Tata Motors, Logitech, Essilor, Honeywell, Dormakaba and Last Lock",
      "40+ companies sampling its cells, with 6 active proofs of concept",
    ],
    marketOpportunity:
      "Battery replacement is the near-term wedge: wearables and wireless sensors are the largest pools in a ~$7Bn core market, growing to ~$17Bn by 2031 across consumer electronics, IoT, automotive and the built environment.",
    whyTheyWin:
      "Up to ~3.2× the output of traditional silicon at 1,000 lux. Proprietary inks, digital printing and 35+ trade secrets form the manufacturing moat, and custom design-ins embed the cell directly into customers' products.",
  },
  "two-point-o": {
    callouts: [
      { label: "Flexible financing", detail: "Tailored financing for C&I customers adopting clean energy", x: 14, y: 14 },
      { label: "Asset categories", detail: "Solar, heat pumps, chillers, energy storage, wastewater", x: 82, y: 20 },
      { label: "End-to-end delivery", detail: "Equipment selection, EPC, commissioning and deployment", x: 14, y: 74 },
      { label: "Asset performance", detail: "Monitoring and maintenance across the asset's life", x: 82, y: 74 },
    ],
    customers: "Phoenix Mills, Premier Energies, Wipro, JK Tyre, Morepen, Alok, Bosch",
    marketGap:
      "C&I climate assets sit in a financing blind spot: banks underwrite the customer's credit but not unfamiliar equipment, while EPCs understand the asset but rarely fund or monitor it over its life. Viable solar, efficiency and wastewater projects stall as a result.",
    breakthrough:
      "Bundles the three underwritings a deal needs (customer credit, asset performance and long-term monitoring), then funds and owns the equipment under 5–8 year operating leases and manages EPC/OEM execution.",
    traction: [
      "Customers include Phoenix Mills, Premier Energies, Wipro, JK Tyre, Morepen and Alok",
      "200+ EPC, ESCO and OEM partners supporting deal origination",
    ],
    marketOpportunity:
      "India needs over $100Bn a year for C&I decarbonisation, yet distributed mid-ticket assets remain under-financed: an initial market of ~$30Bn, where solar, efficiency and wastewater assets offer 2–4 year paybacks.",
    whyTheyWin:
      "No direct competitor in wholesale, asset-neutral financing of long-life energy-efficient equipment for investment-grade C&I customers. Multi-OEM neutrality, demand aggregation and in-house technology-risk underwriting, with single-point accountability for performance.",
  },
  suind: {
    // Labels are part of the product image (25 Nov 2026), so no callouts.
    deployment: "3,000+ acres across 25+ crop types",
    customers: "Alan Scott Bluverge, Harrisons Malayalam, Sunroto Tech",
    marketGap:
      "Close to the ground in dense, GPS-denied settings (under tree canopies and on terraced hills), drones lose reliable navigation. GPS drifts, RTK links drop and LiDAR is blinded by dust and spray.",
    breakthrough:
      "A vision-first autonomy stack: a synchronised multi-camera array with IMUs running perception, localisation and planning onboard at ~30 FPS, with no GPS or cloud required, and centimetre-level visual-inertial SLAM.",
    traction: [
      "3,000+ acres covered across 25+ crop types",
      "New facility to manufacture up to 20 drones a month",
      "Customers include Alan Scott Bluverge, Harrisons Malayalam and Sunroto Tech",
    ],
    marketOpportunity:
      "India's dense, uneven-terrain crops (sugarcane, rubber, tea, orchards and arecanut) span ~43M acres needing ~5.7 sprays a year, a ~$1Bn recurring opportunity.",
    whyTheyWin:
      "No direct competitor in dense, pilotless, complex-terrain flight. The camera-based stack enables precise spot-spraying without GPS, and 2,000+ flight hours with zero incidents build a compounding data moat.",
  },
};
