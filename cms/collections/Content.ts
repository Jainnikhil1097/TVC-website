import type { CollectionConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { urlField } from "../fields";
import { revalidateHooks } from "../hooks/revalidate";
import { portfolioSectors } from "@/lib/taxonomy";

const common = {
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: revalidateHooks,
  versions: { maxPerDoc: 25 },
};

export const News: CollectionConfig = {
  ...common,
  slug: "news",
  labels: { singular: "News item", plural: "News" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "source", "date"],
    group: "Content",
    description: "Press coverage, shown on Perspectives and the home page (newest first).",
  },
  defaultSort: "-date",
  fields: [
    { name: "title", label: "Headline", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "source", label: "Publication", type: "text", required: true, admin: { placeholder: "The Economic Times" } },
        { name: "date", label: "Date", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly" } } },
      ],
    },
    urlField({ name: "url", label: "Link to article", required: true }),
  ],
};

export const Events: CollectionConfig = {
  ...common,
  slug: "events",
  labels: { singular: "Event", plural: "Events" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startDate", "location"],
    group: "Content",
    description: "Events you're hosting or speaking at. Upcoming events appear first on Perspectives.",
  },
  defaultSort: "-startDate",
  fields: [
    { name: "title", label: "Event name", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "startDate", label: "Starts", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "endDate", label: "Ends (optional)", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    { name: "location", label: "Location", type: "text", admin: { placeholder: 'e.g. "Bengaluru" or "Online"' } },
    { name: "description", label: "Short description", type: "textarea", maxLength: 500 },
    { name: "image", label: "Image", type: "upload", relationTo: "media" },
    urlField({ name: "link", label: "Registration or info link" }),
  ],
};

export const Reports: CollectionConfig = {
  ...common,
  slug: "reports",
  labels: { singular: "Report", plural: "Reports & publications" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date"],
    group: "Content",
    description: "Research and publications (PDFs or links) shown in the Reports tab on Perspectives.",
  },
  defaultSort: "-date",
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "date", label: "Published", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly" } } },
    { name: "summary", label: "Summary", type: "textarea", maxLength: 500 },
    { name: "cover", label: "Cover image", type: "upload", relationTo: "media" },
    {
      name: "file",
      label: "PDF",
      type: "upload",
      relationTo: "media",
      filterOptions: { mimeType: { equals: "application/pdf" } },
      admin: { description: "Upload a PDF, or use the external link below instead." },
    },
    urlField({ name: "externalUrl", label: "External link (if not a PDF)" }),
    {
      name: "companies",
      label: "Related portfolio companies",
      type: "relationship",
      relationTo: "companies",
      hasMany: true,
    },
    {
      name: "sector",
      label: "Related sector",
      type: "select",
      options: portfolioSectors.map((s) => ({ label: s.name, value: s.id })),
    },
  ],
};

