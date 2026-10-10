import type { Essay, Video } from "./types";

// Minimal RSS/Atom reading for two well-formed feeds (Substack RSS, YouTube Atom).
// Only the handful of fields we display are extracted.

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .trim();
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function blocks(xml: string, tag: string) {
  return [...xml.matchAll(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`, "g"))].map((m) => m[0]);
}

function text(xml: string, tag: string) {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? decode(m[1]) : undefined;
}

function attr(xml: string, tag: string, name: string, where?: RegExp) {
  for (const m of xml.matchAll(new RegExp(`<${tag}\\s([^>]*?)/?>`, "g"))) {
    if (where && !where.test(m[1])) continue;
    const a = m[1].match(new RegExp(`${name}="([^"]*)"`));
    if (a) return decode(a[1]);
  }
  return undefined;
}

function toIso(date?: string) {
  if (!date) return undefined;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function truncate(s: string, max = 220) {
  return s.length <= max ? s : s.slice(0, s.lastIndexOf(" ", max)) + "…";
}

export function parseSubstack(xml: string): Essay[] {
  return blocks(xml, "item")
    .map((item) => ({
      title: text(item, "title") ?? "",
      teaser: truncate(stripHtml(text(item, "description") ?? "")),
      url: text(item, "link") ?? "",
      date: toIso(text(item, "pubDate")),
      image: attr(item, "enclosure", "url", /type="image\//),
    }))
    .filter((e) => e.title && e.url);
}

export function parseYouTube(xml: string): Video[] {
  return blocks(xml, "entry")
    .map((entry) => ({
      title: text(entry, "title") ?? "",
      url: attr(entry, "link", "href", /rel="alternate"/) ?? "",
      date: toIso(text(entry, "published")),
      thumbnail: attr(entry, "media:thumbnail", "url"),
    }))
    .filter((v) => v.title && v.url);
}
