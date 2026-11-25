// "Why founders choose us" (home page): the team's 8 points, as sent by Aditi on
// 20 Nov 2026, revised 25 Nov 2026 (due diligence dropped; PR and corporate connections
// split into two, corporate connections moved to point 2). The headings show on the
// spiral; the points open in its pop-up.
import type { PillarIcon } from "@/lib/pillar-icons";

export const founderPillars: { title: string; icon: PillarIcon; points: string[] }[] = [
  {
    title: "Deep-Tech & Engineering Expertise",
    icon: "engineering",
    points: [
      "Strong understanding of hard-tech, engineering-led and IP-driven businesses.",
      "Ability to evaluate patented technologies, proprietary innovations and defensible technological advantages.",
    ],
  },
  {
    title: "Corporate Connections & Business Development",
    icon: "network",
    points: [
      "Introductions to relevant corporates, industry leaders and potential customers.",
      "Access to the Transition VC LP and industry network.",
      "Support in developing strategic partnerships and commercial relationships.",
      "Helping portfolio companies unlock customer opportunities and enter new markets.",
    ],
  },
  {
    title: "Capital & Fundraising Support and Dedicated Portfolio Management",
    icon: "capital",
    points: [
      "Willingness to lead investment rounds in an underserved funding segment.",
      "Support with financial planning, capital allocation and fundraising strategy.",
      "Guidance on financial metrics, reporting frameworks and investor presentations.",
      "Suggestions on key business performance indicators and metrics to track.",
      "Preparation for future fundraising conversations and investor engagement.",
      "Dedicated portfolio management teams to work closely with founders.",
      "Ongoing strategic guidance beyond the initial investment.",
      "Support in identifying business priorities, operational challenges and growth opportunities.",
      "Regular engagement to understand company performance and provide relevant interventions.",
    ],
  },
  {
    title: "Talent & Niche Technical Hiring",
    icon: "talent",
    points: [
      "Assistance with identifying and hiring specialised technical talent.",
      "Access to niche engineering talent and leadership networks.",
      "Support with CXO, senior management and critical leadership hiring.",
      "Connecting founders with the right people to build and scale their teams.",
    ],
  },
  {
    title: "Grants & Non-Dilutive Funding",
    icon: "grants",
    points: [
      "Assistance in identifying relevant government grants, incentives and funding programmes.",
      "Guidance on grant applications and navigating funding opportunities.",
      "Helping founders explore non-dilutive capital to support R&D, manufacturing and technology development.",
    ],
  },
  {
    title: "PR, Communications & Brand Building",
    icon: "communications",
    points: [
      "Strategic communications and public relations support.",
      "Assistance with media visibility, positioning and thought leadership.",
      "Support in communicating technological breakthroughs, milestones and business achievements.",
      "Helping founders build credibility with customers, investors and the wider ecosystem.",
    ],
  },
  {
    title: "Events & Ecosystem Access",
    icon: "events",
    points: [
      "Opportunities to participate in curated investor, industry and founder events.",
      "Access to LP mixers, solution showcases, industry conferences and ecosystem gatherings.",
      "Direct interactions with potential customers, investors, corporate decision-makers and industry experts.",
      "Creating opportunities for portfolio companies to showcase their technologies and build meaningful relationships.",
    ],
  },
  {
    title: "Portfolio Synergies and Founder-First Culture",
    icon: "partnership",
    points: [
      "A portfolio designed to compound value, not compete.",
      "Connecting portfolio companies to explore partnerships and commercial collaborations.",
      "Enabling portfolio companies to become each other's customers, suppliers or technology partners.",
      "Unlocking cross-portfolio business opportunities and shared market access.",
      "Building long-term relationships rather than transactional investor-founder relationships.",
      "Being accessible, involved and responsive to founders' evolving needs.",
      "Working alongside founders through the complexities of building engineering-led businesses.",
    ],
  },
];
