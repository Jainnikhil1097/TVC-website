import type { CollectionConfig } from "payload";
import { loggedIn, publishedOrLoggedIn } from "../access";
import { orderField, showOnSiteField, urlField } from "../fields";
import { revalidateHooks } from "../hooks/revalidate";
import { teamGroupOptions } from "@/lib/taxonomy";

export const TeamMembers: CollectionConfig = {
  slug: "team",
  labels: { singular: "Team member", plural: "Team" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "title", "group", "showOnSite", "order"],
    group: "Content",
    description: "Everyone shown on the About page. Drag order with the Display order number.",
    preview: () => "/about",
  },
  defaultSort: "order",
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: revalidateHooks,
  fields: [
    { name: "name", label: "Full name", type: "text", required: true },
    {
      name: "title",
      label: "Job title",
      type: "text",
      admin: { description: 'e.g. "VP - Investments". Leave blank for advisors.' },
    },
    {
      name: "group",
      label: "Team",
      type: "select",
      required: true,
      defaultValue: "investments",
      options: teamGroupOptions.map((o) => ({ ...o })),
      admin: { description: "The team this person appears under on the About page." },
    },
    {
      name: "photo",
      label: "Photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Portrait, ideally at least 1200 × 1500 px. Initials are shown until a photo is added." },
    },
    urlField({ name: "linkedin", label: "LinkedIn profile URL" }),
    {
      name: "bio",
      label: "Short bio",
      type: "textarea",
      maxLength: 1200,
      admin: { description: "Founders only. One or two short paragraphs (leave an empty line between them)." },
    },
    {
      name: "logoRows",
      label: "Logo rows",
      type: "array",
      maxRows: 4,
      labels: { singular: "Row", plural: "Rows" },
      admin: {
        description:
          "Founders only, shown under the bio: e.g. previous firms (no heading), then \"Private Equity Investments and Exits\", \"Early-stage Investments\". Each row is one image of logos on white.",
        initCollapsed: true,
      },
      fields: [
        { name: "heading", label: "Heading (optional)", type: "text" },
        { name: "image", label: "Logos image", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      // No longer shown on the site (replaced by the logo rows, Nov 2026); kept so existing data stays valid.
      name: "highlights",
      label: "Known for",
      type: "array",
      maxRows: 3,
      admin: { hidden: true },
      fields: [{ name: "text", label: "Point", type: "text", required: true, maxLength: 120 }],
    },
    showOnSiteField,
    orderField,
  ],
};
