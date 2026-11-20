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
      maxLength: 600,
      admin: { description: "3–4 lines. Shown on the founder cards on the About page." },
    },
    {
      name: "highlights",
      label: "Known for",
      type: "array",
      maxRows: 3,
      labels: { singular: "Point", plural: "Points" },
      admin: { description: "Up to 3 short points, shown on the founder cards.", initCollapsed: true },
      fields: [{ name: "text", label: "Point", type: "text", required: true, maxLength: 120 }],
    },
    showOnSiteField,
    orderField,
  ],
};
