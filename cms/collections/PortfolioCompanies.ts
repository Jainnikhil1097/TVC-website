import type { CollectionConfig } from "payload";
import { loggedIn, publishedOrLoggedIn } from "../access";
import { orderField, showOnSiteField, slugify, urlField } from "../fields";
import { revalidateHooks } from "../hooks/revalidate";
import { companyStatuses, portfolioSectors, stages } from "@/lib/taxonomy";

export const PortfolioCompanies: CollectionConfig = {
  slug: "companies",
  labels: { singular: "Portfolio company", plural: "Portfolio" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sector", "stage", "status", "featured", "updatedAt"],
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
          label: "Status",
          fields: [
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
      admin: { position: "sidebar", description: "Featured companies appear first in the home page strip." },
    },
    showOnSiteField,
    orderField,
  ],
};
