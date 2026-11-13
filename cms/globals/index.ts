import type { Field, GlobalConfig } from "payload";
import { adminOnly, anyone, loggedIn } from "../access";
import { urlField } from "../fields";
import { revalidateGlobal } from "../hooks/revalidate";
import { pageKeys, portfolioSectors } from "@/lib/taxonomy";
import { pillarIcons } from "@/lib/pillar-icons";

const editable = { read: anyone, update: loggedIn };
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
                { name: "cheque", label: "Cheque size", type: "text", required: true, admin: { placeholder: "$0.5M – $5M" } },
              ],
            },
            { name: "footerHeadline", label: "Footer headline", type: "text", required: true },
            { name: "newsletterBlurb", label: "Newsletter line", type: "text", required: true },
          ],
        },
        {
          label: "Contact",
          fields: [
            { name: "email", label: "Contact email", type: "email", required: true },
            {
              name: "address",
              label: "Office address",
              type: "textarea",
              required: true,
              admin: { description: "One line per row, as it should appear on the site." },
            },
            urlField({ name: "mapUrl", label: "Google Maps link" }),
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
          admin: { description: "Pick 3–4 headline figures for the home page. All figures appear on Funds." },
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

export const GiftCityPage: GlobalConfig = {
  slug: "gift-city-page",
  label: "GIFT City page",
  admin: { group: "Pages", preview: () => "/gift-city" },
  access: editable,
  hooks,
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
};

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home page",
  admin: { group: "Pages", description: "The positioning line, \"Why founders choose us\" and the founder FAQ.", preview: () => "/" },
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
              maxRows: 6,
              admin: { description: "4–5 works best. Keep each to one short sentence." },
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
          label: "Founder FAQ",
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
