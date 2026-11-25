/** "Dr Ingolf Gröning" → "dr-ingolf-groning". Used for team photo file names. */
export const personSlug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
