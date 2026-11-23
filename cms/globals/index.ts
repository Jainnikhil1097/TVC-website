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

export const ImpactPage: GlobalConfig = {
  slug: "impact-page",
  label: "Impact page",
  admin: { group: "Pages", preview: () => "/impact" },
  access: editable,
  hooks,
  fields: [
    { name: "eyebrow", label: "Small heading", type: "text", required: true },
    { name: "headline", label: "Headline", type: "text", required: true },
    { name: "intro", label: "Intro", type: "textarea", required: true },
    {
      name: "stats",
      label: "Figures",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", label: "Value", type: "text", required: true },
            { name: "label", label: "Label", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "themes",
      label: "Impact themes",
      type: "array",
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "body", label: "Text", type: "textarea", required: true },
        { name: "companies", label: "Related companies", type: "relationship", relationTo: "companies", hasMany: true },
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
            { name: "intro", label: "Intro", type: "textarea", required: true },
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
              maxRows: 8,
              admin: { description: "Shown four to a row: 4 or 8 works best. Keep each to one short sentence." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "title", label: "Title", type: "text", required: true, maxLength: 40 },
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
                { name: "text", label: "Sentence", type: "textarea", required: true, maxLength: 200 },
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
      "The About page's headings and closing cards. The intro, approach quote, thesis, stage and cheque size are in Settings → Site settings; people are under Team; funds under Funds.",
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
