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
      label: "Section on the About page",
      type: "select",
      required: true,
      defaultValue: "executive",
      options: teamGroupOptions.map((o) => ({ ...o })),
    },
    {
      name: "photo",
      label: "Photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Portrait, ideally at least 1200 × 1500 px. Initials are shown until a photo is added." },
    },
    urlField({ name: "linkedin", label: "LinkedIn profile URL" }),
    { name: "bio", label: "Short bio", type: "textarea", maxLength: 600 },
    showOnSiteField,
    orderField,
  ],
};
