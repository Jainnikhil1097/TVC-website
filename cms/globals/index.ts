import type { Field, GlobalConfig } from "payload";
import { adminOnly, anyone, loggedIn } from "../access";
import { urlField } from "../fields";
import { revalidateGlobal } from "../hooks/revalidate";
import { pageKeys, portfolioSectors } from "@/lib/taxonomy";
import { pillarIcons } from "@/lib/pillar-icons";
import { sectorIcons } from "@/lib/sector-icons";
import { aboutPageDefaults, perspectivesPageDefaults, portfolioPageDefaults } from "@/lib/page-copy";

const editable = { read: anyone, update: loggedIn };

/** Empty, or one or more email addresses separated by commas. */
const emailList = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return true;
  const bad = value.split(",").map((v) => v.trim()).filter((v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  return bad.length ? `Not a valid email: ${bad.join(", ")}` : true;
};
const hooks = { afterChange: [revalidateGlobal] };

export const SiteSettings: GlobalConfig = {
  slug: "site",
  label: "Site settings",
  admin: { group: "Settings", description: "Taglines, contact details and links used across the whole site." },
  access: editable,
  hooks,
  versions: { max: 25 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Messaging",
          fields: [
            { name: "tagline", label: "Tagline", type: "text", required: true, admin: { description: "Large home page headline." } },
            { name: "hero", label: "Home page intro line", type: "textarea", required: true },
            { name: "about", label: "About the fund", type: "textarea", required: true },
            { name: "approach", label: "Investment approach (quote)", type: "textarea", required: true },
            { name: "thesis", label: "Investment thesis", type: "textarea", required: true },
            {
              type: "row",
              fields: [
                { name: "stage", label: "Stages we invest in", type: "text", required: true, admin: { placeholder: "Pre-Seed to Series A" } },
                { name: "cheque", label: "Cheque size", type: "text", required: true, admin: { placeholder: "₹20 Cr – ₹50 Cr" } },
                {
                  name: "chequeUsd",
                  label: "Cheque size in US dollars",
                  type: "text",
                  admin: { placeholder: "$2.3M – $5.7M", description: "Shown when a visitor switches the About page to USD. Leave empty to hide the switch." },
                },
              ],
            },
            { name: "footerHeadline", label: "Footer headline", type: "text", required: true },
            { name: "newsletterBlurb", label: "Newsletter line", type: "text", required: true },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "email",
              label: "General enquiries email",
              type: "email",
              required: true,
              admin: { description: 'Shown as "General Enquiries" on the Contact page and in the footer.' },
            },
            {
              name: "careersEmail",
              label: "Careers email",
              type: "email",
              admin: { description: 'Shown as "Explore careers" under General Enquiries on the Contact page. Leave empty to hide it.' },
            },
            {
              name: "offices",
              label: "Offices",
              type: "array",
              minRows: 1,
              labels: { singular: "Office", plural: "Offices" },
              admin: { description: "Shown on the Contact page (with a map) and in the footer, in this order." },
              fields: [
                { name: "name", label: "Name", type: "text", required: true, admin: { placeholder: "Domlur" } },
                {
                  name: "address",
                  label: "Address",
                  type: "textarea",
                  required: true,
                  admin: { description: "One line per row, as it should appear on the site." },
                },
                urlField({ name: "mapUrl", label: "Google Maps link" }),
              ],
            },
            {
              name: "formRecipients",
              label: "Who receives each contact form",
              type: "group",
              admin: {
                description:
                  "An email alert goes to these addresses for every new enquiry (separate several with commas). All enquiries are also kept under Enquiries.",
              },
              fields: [
                { name: "startup", label: "Startups & Founders", type: "text", validate: emailList },
                { name: "investor", label: "Investors", type: "text", validate: emailList },
                { name: "partner", label: "Ecosystem Partners", type: "text", validate: emailList },
              ],
            },
          ],
        },
        {
          label: "Links",
          fields: [
            urlField({
              name: "investorLoginUrl",
              label: "Investor Login link",
              admin: { description: "Where the Investor Login button goes. If empty, it opens the investor enquiry form." },
            }),
            {
              name: "socials",
              label: "Social links",
              type: "array",
              labels: { singular: "Link", plural: "Links" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", label: "Name", type: "text", required: true, admin: { placeholder: "LinkedIn" } },
                    urlField({ name: "url", label: "URL", required: true }),
                  ],
                },
              ],
            },
            urlField({ name: "substackUrl", label: "Substack address", required: true }),
            urlField({ name: "youtubeUrl", label: "YouTube channel address" }),
            {
              name: "youtubeChannelId",
              label: "YouTube channel ID",
              type: "text",
              admin: {
                description:
                  'Starts with "UC". Find it in YouTube Studio → Settings → Channel → Advanced settings. New videos then appear automatically.',
              },
            },
            {
              name: "videos",
              label: "Videos",
              type: "array",
              labels: { singular: "Video", plural: "Videos" },
              admin: {
                description:
                  "YouTube videos to show on Perspectives → YouTube, with their thumbnails (taken from the link). Shown before the channel's own latest videos.",
                initCollapsed: true,
              },
              fields: [
                urlField({ name: "url", label: "YouTube link", required: true }),
                { type: "row", fields: [{ name: "title", label: "Title", type: "text", required: true }, { name: "date", label: "Date", type: "date", admin: { date: { pickerAppearance: "dayOnly" } } }] },
              ],
            },
          ],
        },
        {
          label: "Legal",
          fields: [
            {
              name: "policies",
              label: "Policy documents (footer)",
              type: "array",
              labels: { singular: "Document", plural: "Documents" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", label: "Name", type: "text", required: true, admin: { placeholder: "Privacy Policy" } },
                    {
                      name: "file",
                      label: "PDF",
                      type: "upload",
                      relationTo: "media",
                      required: true,
                      filterOptions: { mimeType: { equals: "application/pdf" } },
                    },
                  ],
                },
              ],
            },
            { name: "defaultShareImage", label: "Default social share image", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },
  ],
};

export const Announcement: GlobalConfig = {
  slug: "announcement",
  label: "Announcement bar",
  admin: { group: "Settings", description: "A slim banner at the top of every page, e.g. \"Fund II is now open\"." },
  access: editable,
  hooks,
  fields: [
    { name: "enabled", label: "Show the banner", type: "checkbox", defaultValue: false },
    { name: "message", label: "Message", type: "text", maxLength: 140 },
    {
      type: "row",
      fields: [
        { name: "linkLabel", label: "Link text (optional)", type: "text", admin: { placeholder: "Learn more" } },
        { name: "linkUrl", label: "Link (optional)", type: "text", admin: { placeholder: "/gift-city or https://…" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startsAt", label: "Show from (optional)", type: "date" },
        { name: "endsAt", label: "Show until (optional)", type: "date" },
      ],
    },
  ],
};

export const FundMetrics: GlobalConfig = {
  slug: "fund-metrics",
  label: "Fund metrics",
  admin: {
    group: "Fund information",
    description: "Track-record figures (IRR, MOIC, fund size…). Only Admins can change these — they are regulated performance claims.",
  },
  access: { read: anyone, update: adminOnly },
  hooks,
  versions: { max: 50 },
  fields: [
    {
      name: "items",
      label: "Figures",
      type: "array",
      labels: { singular: "Figure", plural: "Figures" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", label: "Value", type: "text", required: true, admin: { placeholder: "₹723 Cr" } },
            { name: "label", label: "Label", type: "text", required: true, admin: { placeholder: "Fund I raised" } },
          ],
        },
        { name: "note", label: "Footnote (optional)", type: "text" },
        {
          name: "showOnHome",
          label: "Show on home page",
          type: "checkbox",
          defaultValue: false,
          // The home page no longer shows fund figures; kept (hidden) so existing data stays valid.
          admin: { hidden: true },
        },
      ],
    },
    { name: "asOf", label: "Figures as of", type: "date", admin: { date: { pickerAppearance: "dayOnly" } } },
    {
      name: "disclaimer",
      label: "Disclaimer",
      type: "textarea",
      defaultValue:
        "Past performance is not indicative of future results. Figures relate to Transition Venture Capital Fund I.",
    },
  ],
};

const seoGroup = (key: string, label: string): Field => ({
  name: key,
  label,
  type: "group",
  fields: [
    { name: "title", label: "Search title", type: "text", maxLength: 70 },
    { name: "description", label: "Search description", type: "textarea", maxLength: 170 },
    { name: "image", label: "Share image", type: "upload", relationTo: "media" },
  ],
});

export const PageSeo: GlobalConfig = {
  slug: "page-seo",
  label: "Search & sharing (SEO)",
  admin: {
    group: "Settings",
    description: "How each page appears in Google and when shared on LinkedIn/WhatsApp. Empty fields use sensible defaults.",
  },
  access: editable,
  hooks,
  fields: pageKeys.map((p) => seoGroup(p.key, `${p.label} page`)),
};

export const HomeSectors: GlobalConfig = {
  slug: "home-sectors",
  label: "Home: where we invest",
  admin: { group: "Pages", description: 'The sectors in the "Where we invest" carousel on the home page.' },
  access: editable,
  hooks,
  fields: [
    {
      name: "sectors",
      label: "Sectors",
      type: "array",
      labels: { singular: "Sector", plural: "Sectors" },
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "line", label: "One-line description", type: "textarea", required: true, maxLength: 200 },
        {
          name: "icon",
          label: "Icon",
          type: "select",
          options: sectorIcons.map(({ value, label }) => ({ value, label })),
          admin: { description: "Leave empty to choose one automatically from the sector's name." },
        },
        {
          name: "portfolioSector",
          label: '"View companies" goes to',
          type: "select",
          options: portfolioSectors.map((s) => ({ label: `Portfolio — ${s.name}`, value: s.id })),
          admin: { description: "Leave empty to link to the full portfolio." },
        },
      ],
    },
  ],
};

// ─── Impact page ─────────────────────────────────────────────────────────────
const t = (name: string, label: string, extra: Partial<Field> = {}): Field => ({ name, label, type: "text", ...extra }) as Field;
const ta = (name: string, label: string, extra: Partial<Field> = {}): Field => ({ name, label, type: "textarea", ...extra }) as Field;
/** Small heading, headline and intro: every Impact section opens with these. */
const sectionHeading: Field[] = [t("eyebrow", "Small heading"), t("headline", "Headline"), ta("intro", "Intro")];
const companies = (name: string, label: string): Field => ({ name, label, type: "relationship", relationTo: "companies", hasMany: true });

export const ImpactPage: GlobalConfig = {
  slug: "impact-page",
  label: "Impact page",
  admin: {
    group: "Pages",
    preview: () => "/impact",
    description:
      "Every section of the Impact page. Women in leadership is edited under SDGs → Gender Equality (goal 5).",
  },
  access: editable,
  hooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Opening",
          fields: [
            {
              name: "hero",
              type: "group",
              label: false,
              fields: [
                t("eyebrow", "Small heading"),
                t("headline", "Headline"),
                ta("statement", "Statement (right of the headline)"),
                ta("intro", "Intro"),
                { type: "row", fields: [t("primaryLabel", "Button: portfolio progress"), t("secondaryLabel", "Button: how we measure")] },
                {
                  name: "tiles",
                  label: "Photo tiles",
                  type: "array",
                  maxRows: 3,
                  labels: { singular: "Tile", plural: "Tiles" },
                  fields: [
                    { name: "image", label: "Photo", type: "upload", relationTo: "media", required: true },
                    { type: "row", fields: [{ name: "company", label: "Company", type: "relationship", relationTo: "companies" }, t("caption", "Caption")] },
                  ],
                },
              ],
            },
            {
              name: "pathways",
              label: "Impact pathways (under the photos, and in the SDG section)",
              type: "array",
              maxRows: 3,
              fields: [
                { type: "row", fields: [t("title", "Title", { required: true }), t("subtitle", "Short line")] },
                ta("body", "Text"),
                companies("companies", "Example companies"),
              ],
            },
          ],
        },
        {
          label: "Fund I outcomes",
          fields: [
            {
              name: "outcomes",
              type: "group",
              label: false,
              fields: [
                ...sectionHeading,
                t("status", "Status line (top right)"),
                {
                  name: "measures",
                  label: "Portfolio measures",
                  type: "array",
                  maxRows: 4,
                  admin: { description: 'Leave a value empty to show "In preparation".' },
                  fields: [
                    { type: "row", fields: [t("label", "Measure", { required: true }), t("value", "Value"), t("unit", "Unit")] },
                    ta("definition", "Definition"),
                  ],
                },
                // No longer shown (removed from the page on 25 Nov 2026); kept so the data survives.
                t("coverageTitle", "Reporting coverage: title", { admin: { hidden: true } }),
                ta("coverageText", "Reporting coverage: text", { admin: { hidden: true } }),
                t("coverageNote", "Reporting coverage: note", { admin: { hidden: true } }),
                ta("footnote", "Footnote"),
              ],
            },
          ],
        },
        {
          label: "Footprint",
          fields: [
            {
              name: "footprint",
              type: "group",
              label: false,
              fields: [
                ...sectionHeading,
                t("cardText", "Line on the summary card", { admin: { hidden: true } }), // no longer shown
                ta("footnote", "Footnote"),
                {
                  name: "countries",
                  label: "Countries",
                  type: "array",
                  labels: { singular: "Country", plural: "Countries" },
                  admin: { description: "Country-level markers (not facility locations). Latitude/longitude place the marker." },
                  fields: [
                    { type: "row", fields: [t("name", "Country", { required: true }), { name: "lat", label: "Latitude", type: "number", required: true }, { name: "lon", label: "Longitude", type: "number", required: true }] },
                    {
                      name: "presence",
                      label: "Presence",
                      type: "select",
                      hasMany: true,
                      options: [
                        { label: "HQ & offices", value: "hq" },
                        { label: "Manufacturing & R&D", value: "manufacturing" },
                        { label: "Deployments & pilots", value: "deployments" },
                      ],
                    },
                    companies("companies", "Companies"),
                    { type: "row", fields: [t("value", "Headline figure (optional)"), t("valueLabel", "What it measures")] },
                    ta("detail", "Detail"),
                    ta("source", "Source"),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "SDGs",
          fields: [
            {
              name: "sdgs",
              type: "group",
              label: false,
              fields: [
                ...sectionHeading,
                t("note", "Note beside the goals"),
                {
                  name: "goals",
                  label: "UN Sustainable Development Goals",
                  type: "array",
                  labels: { singular: "Goal", plural: "Goals" },
                  admin: { description: "Goal 5 (Gender Equality) is shown as the bar under the grid." },
                  fields: [
                    { type: "row", fields: [{ name: "number", label: "SDG number", type: "number", required: true, min: 1, max: 17 }, t("title", "Title", { required: true })] },
                    ta("summary", "One-line summary"),
                    {
                      name: "entries",
                      label: "Who contributes",
                      type: "array",
                      admin: {
                        initCollapsed: true,
                        description:
                          'A portfolio company, or a label (e.g. "Transition VC × GreenTech", a team or person). For Gender Equality (goal 5), each entry is one line of the bar: the label as its heading (e.g. "Women in leadership") and the contribution as the names or figure.',
                      },
                      fields: [
                        { type: "row", fields: [{ name: "company", label: "Company", type: "relationship", relationTo: "companies" }, t("label", "…or label")] },
                        ta("connection", "Contribution", { required: true }),
                        t("measures", "Measures behind it"),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Measurement",
          fields: [
            {
              name: "measurement",
              type: "group",
              label: false,
              fields: [
                ...sectionHeading,
                { name: "items", label: "Questions", type: "array", fields: [t("title", "Title", { required: true }), ta("body", "Text")] },
                {
                  name: "reports",
                  label: "Reports & policies",
                  type: "array",
                  fields: [
                    { type: "row", fields: [t("title", "Title", { required: true }), t("status", "Status (shown until a file is added)")] },
                    { name: "file", label: "PDF", type: "upload", relationTo: "media", filterOptions: { mimeType: { equals: "application/pdf" } } },
                  ],
                },
                t("processTitle", "Process heading"),
                { name: "process", label: "Process steps", type: "array", maxRows: 6, fields: [{ type: "row", fields: [t("step", "Step"), t("text", "Text")] }] },
              ],
            },
            // Sections removed from the page on 25 Nov 2026 (company views, investor contribution,
            // women in leadership, perspectives). Hidden from editors; kept in the schema so their
            // content isn't dropped from the database and they can come back.
            { name: "carousel", type: "group", admin: { hidden: true }, fields: [...sectionHeading, ta("footnote", "Footnote")] },
            {
              name: "contribution",
              type: "group",
              admin: { hidden: true },
              fields: [
                ...sectionHeading,
                { name: "pillars", type: "array", fields: [{ type: "row", fields: [t("label", "Label"), t("title", "Title")] }, t("text", "Text")] },
                { type: "row", fields: [t("caseLabel", "Case: small heading"), t("caseTitle", "Case: title")] },
                { name: "casePoints", type: "array", fields: [t("title", "Title"), ta("text", "Text")] },
                ta("caseSource", "Case: source"),
                ta("footnote", "Footnote"),
              ],
            },
            {
              name: "women",
              type: "group",
              admin: { hidden: true },
              fields: [
                ...sectionHeading,
                { name: "leaders", type: "array", fields: [{ type: "row", fields: [t("area", "Area"), t("name", "Name"), t("role", "Role")] }] },
                { name: "functions", type: "array", fields: [{ type: "row", fields: [t("title", "Function"), t("text", "Text")] }] },
                ta("footnote", "Footnote"),
              ],
            },
            { name: "perspectives", type: "group", admin: { hidden: true }, fields: [...sectionHeading, ta("footnote", "Footnote")] },
          ],
        },
      ],
    },
  ],
};

// One row of a two-column disclosure table.
const row = (name: string, label: string, extra: Partial<Field> = {}): Field => ({ name, label, type: "text", ...extra }) as Field;

export const GiftCityPage: GlobalConfig = {
  slug: "gift-city-page",
  label: "GIFT City page",
  admin: { group: "Pages", preview: () => "/gift-city" },
  access: editable,
  hooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Page",
          fields: [
            { name: "eyebrow", label: "Small heading", type: "text", required: true },
            { name: "headline", label: "Headline", type: "text", required: true },
            { name: "intro", label: "Intro", type: "textarea", required: true, admin: { description: 'Shown in the "Same team, same thesis" section, below the key facts (not in the hero).' } },
            {
              name: "highlights",
              label: "Highlights",
              type: "array",
              fields: [
                { name: "title", label: "Title", type: "text", required: true },
                { name: "body", label: "Text", type: "textarea", required: true },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "ctaLabel", label: "Button text", type: "text", defaultValue: "Investor enquiries" },
                { name: "ctaHref", label: "Button link", type: "text", defaultValue: "/contact?type=investor" },
              ],
            },
          ],
        },
        {
          label: "IFSCA disclosures",
          description:
            "The regulatory disclosures for the GIFT City fund manager (Annexure 1), shown at the bottom of the GIFT City page. Update the complaints table every quarter.",
          fields: [
            {
              name: "disclosures",
              label: false,
              type: "group",
              fields: [
                { name: "show", label: "Show the disclosures on the GIFT City page", type: "checkbox", defaultValue: true },
                { name: "asOf", label: "Last updated", type: "date", admin: { date: { pickerAppearance: "dayOnly" } } },
                {
                  name: "fme",
                  label: "1. FME profile",
                  type: "group",
                  fields: [
                    row("name", "Name of the FME"),
                    { type: "row", fields: [row("legalForm", "Legal form"), row("category", "Category of registration")] },
                    { type: "row", fields: [row("registrationNumber", "IFSCA registration number"), row("registrationDate", "Date of registration")] },
                  ],
                },
                {
                  name: "contact",
                  label: "2. Contact details",
                  type: "group",
                  fields: [
                    { name: "registeredOffice", label: "Registered office address in the IFSC", type: "textarea" },
                    { name: "correspondence", label: "Correspondence address", type: "textarea" },
                    { type: "row", fields: [row("telephone", "Telephone number"), row("email", "Email address")] },
                  ],
                },
                {
                  name: "funds",
                  label: "3. Funds managed from the IFSC",
                  type: "array",
                  labels: { singular: "Fund", plural: "Funds" },
                  fields: [
                    row("name", "Name of the fund", { required: true }),
                    { type: "row", fields: [row("registrationNumber", "IFSCA registration number"), row("category", "Category / type")] },
                  ],
                },
                {
                  name: "serviceProviders",
                  label: "4. Service providers",
                  type: "array",
                  labels: { singular: "Service provider", plural: "Service providers" },
                  fields: [
                    { type: "row", fields: [row("role", "Role", { required: true, admin: { placeholder: "Trustee" } }), row("name", "Name")] },
                    { name: "address", label: "Address / email", type: "textarea" },
                    row("telephone", "Telephone"),
                  ],
                },
                {
                  name: "grievance",
                  label: "5. Investor grievance redressal",
                  type: "group",
                  fields: [
                    { name: "text", label: "Text", type: "textarea" },
                    {
                      name: "policy",
                      label: "Policy on Complaint Handling and Grievance Redressal (PDF)",
                      type: "upload",
                      relationTo: "media",
                      filterOptions: { mimeType: { equals: "application/pdf" } },
                      admin: { description: "Linked from the text above once uploaded." },
                    },
                    {
                      name: "complaints",
                      label: "5.1 Status of investor complaints (update quarterly)",
                      type: "array",
                      labels: { singular: "Quarter", plural: "Quarters" },
                      admin: { description: "Most recent quarter first. Leave empty to show the note below." },
                      fields: [
                        row("quarterEnded", "Quarter ended", { required: true, admin: { placeholder: "31-12-2026" } }),
                        {
                          type: "row",
                          fields: [
                            row("pendingStart", "Pending at start"),
                            row("received", "Received"),
                            row("disposed", "Disposed of"),
                            row("pendingEnd", "Pending at end"),
                          ],
                        },
                      ],
                    },
                    row("complaintsNote", "Shown when there are no quarters yet", { defaultValue: "Not applicable" }),
                  ],
                },
                {
                  name: "officers",
                  label: "6. Key personnel for IFSC operations",
                  type: "array",
                  labels: { singular: "Officer", plural: "Officers" },
                  fields: [
                    { type: "row", fields: [row("designation", "Designation", { required: true, admin: { placeholder: "Principal Officer" } }), row("name", "Name", { required: true })] },
                    { type: "row", fields: [row("email", "Email"), row("telephone", "Telephone")] },
                  ],
                },
                {
                  name: "actions",
                  label: "7. Material regulatory / enforcement actions in the preceding three years",
                  type: "group",
                  fields: [
                    { type: "row", fields: [row("action", "Action against FME or KMPs in relation to IFSC operations"), row("status", "Current status")] },
                  ],
                },
                { name: "disclaimer", label: "8. Disclaimer", type: "textarea" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home page",
  admin: {
    group: "Pages",
    description: "The positioning line and \"Why founders choose us\" (home page), and the founder FAQ (shown on the Contact page).",
    preview: () => "/",
  },
  access: editable,
  hooks,
  versions: { max: 25 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Positioning",
          fields: [
            {
              name: "positioning",
              label: "Positioning line",
              type: "text",
              required: true,
              admin: { description: "Shown above the headline figures, e.g. \"India's first energy-transition venture fund\"." },
            },
            {
              name: "aboutPhoto",
              label: "Photo beside it",
              type: "upload",
              relationTo: "media",
              // Replaced on 25 Nov 2026 by the About page's group photos, which scroll in the band. Hidden, data kept.
              admin: { hidden: true },
            },
            {
              name: "aboutPhotoCaption",
              label: "Photo caption",
              type: "text",
              admin: { hidden: true },
            },
          ],
        },
        {
          label: "Why founders choose us",
          fields: [
            {
              name: "pillars",
              label: "Pillars",
              type: "array",
              labels: { singular: "Pillar", plural: "Pillars" },
              maxRows: 10,
              admin: {
                description:
                  "Shown as tiers of a spiral staircase on the home page; clicking a heading opens its points. 8 works best.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "title", label: "Heading", type: "text", required: true, maxLength: 100 },
                    {
                      name: "icon",
                      label: "Icon",
                      type: "select",
                      required: true,
                      defaultValue: "engineering",
                      options: pillarIcons.map((i) => ({ ...i })),
                    },
                  ],
                },
                {
                  name: "points",
                  label: "Points (shown in the pop-up)",
                  type: "array",
                  labels: { singular: "Point", plural: "Points" },
                  fields: [{ name: "text", label: "Point", type: "textarea", required: true, maxLength: 300 }],
                },
                { name: "text", label: "Short summary (optional)", type: "textarea", maxLength: 200 },
              ],
            },
          ],
        },
        {
          label: "Founder FAQ (Contact page)",
          fields: [
            {
              name: "faq",
              label: "Questions",
              type: "array",
              labels: { singular: "Question", plural: "Questions" },
              admin: { description: "Answers founders look for: cheque size, stages, sectors, how long decisions take, how to pitch." },
              fields: [
                { name: "question", label: "Question", type: "text", required: true },
                { name: "answer", label: "Answer", type: "textarea", required: true, maxLength: 1000 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── Page wording (Portfolio, About, Perspectives) ───────────────────────────
// Every field falls back to the default wording (lib/page-copy.ts) while empty.

const text = (name: string, label: string, defaultValue: string, extra: Partial<Field> = {}): Field =>
  ({ name, label, type: "text", defaultValue, ...extra }) as Field;
const area = (name: string, label: string, defaultValue: string): Field => ({ name, label, type: "textarea", defaultValue });

export const PortfolioPage: GlobalConfig = {
  slug: "portfolio-page",
  label: "Portfolio page",
  admin: {
    group: "Pages",
    description: "The Portfolio page's heading, intro, button and figure labels. The companies themselves are under Content → Portfolio.",
    preview: () => "/portfolio",
  },
  access: editable,
  hooks,
  fields: [
    text("eyebrow", "Small heading", portfolioPageDefaults.eyebrow),
    text("headline", "Headline", portfolioPageDefaults.headline),
    area("intro", "Intro", portfolioPageDefaults.intro),
    {
      type: "row",
      fields: [
        text("ctaLabel", "Button text", portfolioPageDefaults.ctaLabel),
        text("ctaHref", "Button link", portfolioPageDefaults.ctaHref),
      ],
    },
    {
      type: "row",
      fields: [
        text("activeLabel", 'Label under "number of companies"', portfolioPageDefaults.activeLabel),
        text("sectorsLabel", 'Label under "number of sectors"', portfolioPageDefaults.sectorsLabel),
        text("stagesLabel", "Label under the stages", portfolioPageDefaults.stagesLabel),
      ],
    },
  ],
};

export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "About page",
  admin: {
    group: "Pages",
    description:
      "The About page's headings, group photos and closing cards. The intro, approach quote, stage and cheque size (in rupees and US dollars) are in Settings → Site settings; people are under Team; funds under Funds.",
    preview: () => "/about",
  },
  access: editable,
  hooks,
  fields: [
    text("eyebrow", "Small heading", aboutPageDefaults.eyebrow),
    text("headline", "Headline", aboutPageDefaults.headline),
    text("approachEyebrow", '"Our approach" heading', aboutPageDefaults.approachEyebrow),
    {
      type: "row",
      fields: [
        text("teamEyebrow", "Team: small heading", aboutPageDefaults.teamEyebrow),
        text("teamHeading", "Team: heading", aboutPageDefaults.teamHeading),
      ],
    },
    {
      name: "groupPhotos",
      label: "Group photos",
      type: "array",
      maxRows: 10,
      labels: { singular: "Photo", plural: "Photos" },
      admin: { description: "Team photos, drifting slowly across the end of this page and beside \"About Transition VC\" on the home page. Alt text is set on each photo." },
      fields: [
        { name: "image", label: "Photo", type: "upload", relationTo: "media", required: true },
        { name: "caption", label: "Caption", type: "text" },
      ],
    },
    {
      name: "nextSteps",
      label: "Closing cards",
      type: "array",
      maxRows: 3,
      labels: { singular: "Card", plural: "Cards" },
      defaultValue: aboutPageDefaults.nextSteps,
      admin: { description: "The three link cards at the bottom of the page." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "eyebrow", label: "Small heading", type: "text", required: true },
            { name: "title", label: "Title", type: "text", required: true },
          ],
        },
        { name: "body", label: "Text", type: "textarea", required: true },
        { name: "href", label: "Link", type: "text", required: true, admin: { placeholder: "/contact" } },
      ],
    },
  ],
};

export const PerspectivesPage: GlobalConfig = {
  slug: "perspectives-page",
  label: "Perspectives page",
  admin: {
    group: "Pages",
    description:
      "The Perspectives page's heading, intro and buttons. Essays and videos load from Substack and YouTube automatically; news, events and reports are under Content.",
    preview: () => "/perspectives",
  },
  access: editable,
  hooks,
  fields: [
    text("eyebrow", "Small heading", perspectivesPageDefaults.eyebrow),
    text("headline", "Headline", perspectivesPageDefaults.headline),
    area("intro", "Intro", perspectivesPageDefaults.intro),
    {
      type: "row",
      fields: [
        text("substackLabel", "Substack button text", perspectivesPageDefaults.substackLabel),
        text("youtubeLabel", "YouTube button text", perspectivesPageDefaults.youtubeLabel),
      ],
    },
    {
      type: "row",
      fields: [
        text("indexEyebrow", "Index: small heading", perspectivesPageDefaults.indexEyebrow),
        text("indexHeading", "Index: heading", perspectivesPageDefaults.indexHeading),
      ],
    },
  ],
};
