export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** First and last name's initials ("Amit R Namje" → "AN"), skipping titles like Dr or Capt. */
export function initials(name: string) {
  const parts = name.replace(/^(Dr|Capt|Mr|Ms|Mrs)\.?\s+/i, "").split(/\s+/).filter(Boolean);
  const picked = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return picked.map((part) => part[0]).join("").toUpperCase();
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}
