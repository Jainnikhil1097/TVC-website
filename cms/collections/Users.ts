import type { CollectionConfig } from "payload";
import { adminOnly } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "User", plural: "Users" },
  auth: { tokenExpiration: 60 * 60 * 8, maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
    group: "Settings",
    description: "People who can log in to edit the website. Only Admins can add or remove users.",
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    // Everyone can read/update their own account; Admins can manage everyone.
    read: ({ req }) =>
      (req.user as { role?: string } | null)?.role === "admin" ? true : { id: { equals: req.user?.id } },
    update: ({ req }) =>
      (req.user as { role?: string } | null)?.role === "admin" ? true : { id: { equals: req.user?.id } },
  },
  hooks: {
    // The very first account created becomes an Admin, so nobody is locked out.
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
          if (totalDocs === 0) data.role = "admin";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", label: "Full name", type: "text", required: true },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Editor — can update website content", value: "editor" },
        { label: "Admin — also fund figures, enquiries and users", value: "admin" },
      ],
      access: { update: ({ req }) => (req.user as { role?: string } | null)?.role === "admin" },
      admin: { position: "sidebar" },
    },
  ],
};
