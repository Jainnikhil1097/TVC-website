import type { Field, TextField } from "payload";

/** Order field used across collections; lower numbers appear first. */
export const orderField: Field = {
  name: "order",
  label: "Display order",
  type: "number",
  defaultValue: 100,
  admin: {
    position: "sidebar",
    description: "Lower numbers appear first. Leave at 100 to add to the end.",
  },
};

export const showOnSiteField: Field = {
  name: "showOnSite",
  label: "Show on website",
  type: "checkbox",
  defaultValue: true,
  admin: {
    position: "sidebar",
    description: "Untick to hide this from the website without deleting it.",
  },
};

const urlPattern = /^https?:\/\/[^\s]+\.[^\s]+$/i;

/** A text field that must be a full web address if filled in. */
export function urlField(overrides: Partial<TextField> & { name: string; label: string }): TextField {
  return {
    type: "text",
    validate: (value: unknown) =>
      !value || (typeof value === "string" && urlPattern.test(value.trim()))
        ? true
        : "Please enter a full web address starting with https://",
    ...overrides,
    admin: { placeholder: "https://", ...overrides.admin },
  } as TextField;
}

/** Turns "Albatross Energetics" into "albatross-energetics". */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
