import type { CollectionConfig } from "payload";
import { loggedIn, publishedOrLoggedIn } from "../access";
import { orderField, showOnSiteField, slugify, urlField } from "../fields";
import { revalidateHooks } from "../hooks/revalidate";
import { companyStatuses, portfolioFunds, portfolioSectors, stages } from "@/lib/taxonomy";

export const PortfolioCompanies: CollectionConfig = {
  slug: "companies",
  labels: { singular: "Portfolio company", plural: "Portfolio" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sector", "fund", "stage", "status", "featured", "updatedAt"],
    group: "Content",
    description:
      "Companies shown on the Portfolio page, the home page strip and the map. New sectors need a developer.",
    preview: (doc) => `/portfolio?company=${(doc as { slug?: string }).slug ?? ""}`,
    listSearchableFields: ["name", "summary"],
  },
  defaultSort: "order",
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: {
    ...revalidateHooks,
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) data.slug = slugify(data.name);
        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Basics",
          fields: [
            { name: "name", label: "Company name", type: "text", required: true },
            {
              name: "summary",
              label: "One-line summary",
              type: "textarea",
              required: true,
              maxLength: 240,
              admin: { description: "What the company does, in one sentence (max 240 characters)." },
            },
            {
              type: "row",
              fields: [
                {
                  name: "sector",
                  label: "Sector",
                  type: "select",
                  required: true,
                  options: portfolioSectors.map((s) => ({ label: s.name, value: s.id })),
                },
                {
                  name: "stage",
                  label: "Stage at investment",
                  type: "select",
                  required: true,
                  options: stages.map((s) => ({ label: s, value: s })),
                },
                {
                  name: "fund",
                  label: "Fund",
                  type: "select",
                  required: true,
                  defaultValue: "fund-1",
                  options: portfolioFunds.map((f) => ({ label: f.name, value: f.id })),
                  admin: { description: "Shown on the company card and used by the Portfolio page's fund filter." },
                },
                {
                  name: "yearInvested",
                  label: "Year invested",
                  type: "number",
                  required: true,
                  min: 2015,
                  max: 2100,
                },
              ],
            },
            urlField({ name: "website", label: "Website", required: true }),
            {
              name: "logo",
              label: "Logo",
              type: "upload",
              relationTo: "media",
              admin: { description: "SVG or transparent PNG works best. The company name is shown until a logo is added." },
            },
            {
              name: "coverImage",
              label: "Cover image",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "A product or team photo, landscape, at least 2400 px wide. Shown when the company is featured on the home page. Set the focal point on the subject.",
              },
            },
          ],
        },
        {
          label: "Profile",
          fields: [
            {
              name: "founders",
              label: "Founders",
              type: "array",
              labels: { singular: "Founder", plural: "Founders" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", label: "Name", type: "text", required: true },
                    { name: "title", label: "Title", type: "text" },
                  ],
                },
                urlField({ name: "linkedin", label: "LinkedIn URL" }),
                { name: "photo", label: "Photo", type: "upload", relationTo: "media" },
              ],
            },
            {
              name: "whyWeInvested",
              label: "Why we invested",
              type: "textarea",
              maxLength: 1200,
              admin: { description: "A short paragraph shown on the company's profile." },
            },
            urlField({
              name: "essayUrl",
              label: "Related Substack essay",
              admin: { description: "Paste the Substack post URL about this company. It links the two automatically." },
            }),
            urlField({ name: "videoUrl", label: "Video URL (YouTube)" }),
          ],
        },
        {
          label: "One-pager",
          description:
            "Product, proof and story from the company's one-pager. Everything here is public — never add revenue, fundraising, valuation or return figures.",
          fields: [
            {
              name: "productImage",
              label: "Product image",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "A clean product render on a white or transparent background, without text labels (add those as callouts below). At least 1600 px wide.",
              },
            },
            {
              name: "productImageDark",
              label: "Product image on dark (home page)",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "The same image for the home page's black portfolio section: transparent background, labels in a light colour (PNG or WebP). Without it, the product image is shown on a light panel there.",
              },
            },
            {
              name: "callouts",
              label: "Product callouts",
              type: "array",
              maxRows: 4,
              labels: { singular: "Callout", plural: "Callouts" },
              admin: {
                description:
                  "Labels pointing at parts of the product image. Position is a percentage of the image: 0/0 is the top-left corner, 50/50 the centre.",
                initCollapsed: true,
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", label: "Label", type: "text", required: true, admin: { placeholder: "e.g. Motor controller unit" } },
                    { name: "detail", label: "Short detail", type: "text", maxLength: 90 },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    { name: "x", label: "Across (% from left)", type: "number", required: true, min: 0, max: 100, defaultValue: 50 },
                    { name: "y", label: "Down (% from top)", type: "number", required: true, min: 0, max: 100, defaultValue: 50 },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "proofValue",
                  label: "Headline number",
                  type: "text",
                  admin: { placeholder: "e.g. 200,000+", description: "Not shown on the site at the moment — kept for future use." },
                },
                {
                  name: "proofLabel",
                  label: "What it counts",
                  type: "text",
                  admin: { placeholder: "e.g. motors deployed" },
                },
              ],
            },
            {
              name: "deployment",
              label: "Deployment",
              type: "text",
              // Not shown since 25 Nov 2026 (too often out of date); hidden, data kept.
              admin: { hidden: true, placeholder: "e.g. 200,000+ motors across mobility & pumps" },
            },
            { name: "customers", label: "Customers", type: "text", admin: { hidden: true, description: "Only customers that are cleared to be named publicly." } },
            {
              name: "marketGap",
              label: "The gap",
              type: "textarea",
              maxLength: 500,
              admin: { description: "The problem in the market, in two or three sentences." },
            },
            {
              name: "breakthrough",
              label: "The breakthrough",
              type: "textarea",
              maxLength: 500,
              admin: { description: "What the company built and why it's different. The first sentence also shows on the home page." },
            },
            {
              name: "traction",
              label: "Traction",
              type: "array",
              maxRows: 4,
              labels: { singular: "Point", plural: "Points" },
              // Not shown since 25 Nov 2026; hidden, data kept.
              admin: {
                hidden: true,
                description: "Milestones: deployments, pilots, patents, partners. No revenue, fundraising or return figures.",
                initCollapsed: true,
              },
              fields: [{ name: "point", label: "Point", type: "text", required: true, maxLength: 200 }],
            },
            { name: "marketOpportunity", label: "Market opportunity", type: "textarea", maxLength: 500, admin: { hidden: true } }, // not shown since 25 Nov 2026
            { name: "whyTheyWin", label: "Why they win", type: "textarea", maxLength: 500 },
          ],
        },
        {
          label: "Status",
          fields: [
            // The company's Impact-page view; the section was removed on 25 Nov 2026. Hidden, data kept.
            {
              name: "impact",
              type: "group",
              label: false,
              admin: { hidden: true },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "show", label: "Show on the Impact page", type: "checkbox", defaultValue: false },
                    { name: "featured", label: "Quick-select chip", type: "checkbox", defaultValue: false },
                    { name: "order", label: "Order", type: "number", admin: { description: "Lower comes first." } },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    { name: "sectorLabel", label: "Impact area", type: "text", admin: { placeholder: "Renewable asset productivity" } },
                    { name: "stage", label: "Evidence stage", type: "text", admin: { placeholder: "Commercial deployments" } },
                    { name: "period", label: "Period / source line", type: "text", admin: { placeholder: "FY2025-26 · Company reported" } },
                  ],
                },
                { name: "tagline", label: "Tagline", type: "text" },
                { name: "image", label: "Image", type: "upload", relationTo: "media", admin: { description: "Falls back to the logo." } },
                {
                  name: "metrics",
                  label: "Measures",
                  type: "array",
                  maxRows: 4,
                  labels: { singular: "Measure", plural: "Measures" },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "label", label: "Measure", type: "text", required: true },
                        { name: "value", label: "Value", type: "text" },
                        { name: "unit", label: "Unit", type: "text" },
                      ],
                    },
                    { type: "row", fields: [{ name: "evidence", label: "Evidence label", type: "text" }, { name: "note", label: "Note", type: "text" }] },
                  ],
                },
                { type: "row", fields: [{ name: "closerValue", label: "A closer look: figure", type: "text" }, { name: "closerText", label: "A closer look: text", type: "text" }] },
                { name: "evidence", label: "Evidence & boundary", type: "textarea" },
                { name: "sources", label: "Sources", type: "textarea" },
              ],
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              defaultValue: "active",
              options: companyStatuses.map((s) => ({ ...s })),
              admin: { description: "Exited and acquired companies get a badge and aren't counted as active." },
            },
            {
              type: "row",
              admin: { condition: (_, sibling) => sibling?.status && sibling.status !== "active" },
              fields: [
                { name: "exitYear", label: "Exit year", type: "number", min: 2015, max: 2100 },
                { name: "exitNote", label: "Exit note", type: "text", admin: { placeholder: 'e.g. "Acquired by …"' } },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      label: "Web address name",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Created automatically from the name. Only change this if you know why.",
      },
    },
    {
      name: "featured",
      label: "Feature on home page",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Shown in the Featured portfolio tabs on the home page (3–6 works best). Add a cover image too." },
    },
    {
      name: "homeOrder",
      label: "Home page position",
      type: "number",
      min: 1,
      admin: {
        position: "sidebar",
        condition: (data) => Boolean(data?.featured),
        description: "1 shows first among the featured companies. Leave empty to follow the portfolio order.",
      },
    },
    showOnSiteField,
    orderField,
  ],
};
