import type { CollectionConfig } from "payload";
import { adminOnly, hiddenUnlessAdmin } from "../access";
import { submissionEndpoints } from "../endpoints/submissions";

// Enquiries from the website forms. Created only by the intake endpoint
// (cms/endpoints/submissions.ts), never directly through the API.
export const Submissions: CollectionConfig = {
  slug: "submissions",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "company", "status", "createdAt"],
    group: "Inbox",
    hidden: hiddenUnlessAdmin,
    description: "Messages, pitch decks and CVs sent through the website. Visible to Admins only.",
  },
  defaultSort: "-createdAt",
  access: { create: () => false, read: adminOnly, update: adminOnly, delete: adminOnly },
  endpoints: submissionEndpoints,
  fields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Reviewed", value: "reviewed" },
        { label: "Archived", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "type",
      label: "Enquiry type",
      type: "select",
      required: true,
      options: [
        { label: "Startup / founder", value: "startup" },
        { label: "Investor", value: "investor" },
        { label: "Ecosystem partner", value: "partner" },
        { label: "Careers", value: "careers" },
      ],
      admin: { readOnly: true },
    },
    {
      type: "row",
      fields: [
        { name: "name", label: "Name", type: "text", required: true, admin: { readOnly: true } },
        { name: "email", label: "Email", type: "email", required: true, admin: { readOnly: true } },
        { name: "phone", label: "Phone", type: "text", admin: { readOnly: true } },
      ],
    },
    { name: "company", label: "Company / description", type: "textarea", admin: { readOnly: true } },
    { name: "message", label: "Message", type: "textarea", admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "sector", label: "Sector", type: "text", admin: { readOnly: true } },
        { name: "amount", label: "Amount raising", type: "text", admin: { readOnly: true } },
        { name: "valuation", label: "Valuation", type: "text", admin: { readOnly: true } },
      ],
    },
    {
      type: "collapsible",
      label: "Attachment",
      fields: [
        { name: "fileName", label: "File name", type: "text", admin: { readOnly: true } },
        { name: "fileSize", label: "Size (bytes)", type: "number", admin: { readOnly: true } },
        {
          name: "filePath",
          type: "text",
          admin: { hidden: true },
        },
        {
          name: "download",
          type: "ui",
          admin: { components: { Field: "@/cms/components/DownloadAttachment#DownloadAttachment" } },
        },
      ],
    },
    { name: "internalNotes", label: "Internal notes", type: "textarea" },
  ],
};
