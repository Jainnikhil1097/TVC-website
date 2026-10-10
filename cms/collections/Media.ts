import type { CollectionConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateHooks } from "../hooks/revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image or file", plural: "Images & files" },
  admin: {
    group: "Library",
    description: "Photos, logos and PDFs used across the website. Upload once, reuse anywhere.",
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: revalidateHooks,
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf"],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 320, height: 320, position: "centre" },
      { name: "card", width: 960, withoutEnlargement: true },
      { name: "portrait", width: 1200, height: 1500, position: "centre", withoutEnlargement: true },
    ],
  },
  fields: [
    {
      name: "alt",
      label: "Description (for screen readers)",
      type: "text",
      required: true,
      admin: { description: 'Describe the image in a few words, e.g. "Portrait of Raiyaan Shingati".' },
    },
  ],
};
