import type { CollectionConfig } from "payload";
import { adminOnly, anyone } from "../access";
import { orderField } from "../fields";
import { revalidateHooks } from "../hooks/revalidate";
import { fundStatuses } from "@/lib/taxonomy";

export const Funds: CollectionConfig = {
  slug: "funds",
  labels: { singular: "Fund", plural: "Funds" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "size", "status", "sebiRegistration"],
    group: "Fund information",
    description:
      "Each fund with its size, status and SEBI registration. Only Admins can change this — these are regulated disclosures.",
  },
  defaultSort: "order",
  versions: { maxPerDoc: 50 },
  access: { read: anyone, create: adminOnly, update: adminOnly, delete: adminOnly },
  hooks: revalidateHooks,
  fields: [
    { name: "name", label: "Fund name", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "size", label: "Fund size", type: "text", admin: { placeholder: "₹1,500 Cr" } },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: "investing",
          options: fundStatuses.map((s) => ({ ...s })),
        },
      ],
    },
    { name: "description", label: "Short description", type: "textarea", maxLength: 400 },
    {
      name: "showOnHome",
      label: "Show on home and About pages",
      type: "checkbox",
      defaultValue: false,
    },
    {
      type: "collapsible",
      label: "SEBI registration (shown in the footer)",
      fields: [
        { name: "sebiCategory", label: "Category", type: "text", required: true, admin: { placeholder: "CAT II AIF" } },
        { name: "sebiRegistration", label: "Registration number", type: "text", required: true },
        { name: "manager", label: "Investment manager", type: "text", required: true },
      ],
    },
    orderField,
  ],
};
