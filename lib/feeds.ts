import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Essay, Video } from "./types";
import { parseSubstack, parseYouTube, youtubeChannelId } from "./feed-parse";

const HOUR = 3600;
const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";

/** Sent with every request: some feed hosts refuse requests with no user agent. */
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; TransitionVC-website/1.0; +https://www.transitionventurecapital.com)",
  Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/html;q=0.8, */*;q=0.5",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a feed, refreshed hourly. During a build it tries up to three times (a feed host
 * can briefly refuse or rate-limit), then returns null so the page shows a fallback card.
 * During a background refresh it rethrows, so Next keeps serving the last good page.
 */
async function fetchFeed(url: string): Promise<string | null> {
  const attempts = isBuild() ? 3 : 1;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      // Time out rather than hang a build or refresh if a feed host is slow.
      const res = await fetch(url, { headers: HEADERS, next: { revalidate: HOUR, tags: ["feeds"] }, signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`${url} responded ${res.status}`);
      return await res.text();
    } catch (error) {
      last = error;
      if (i < attempts - 1) await wait(2000 * (i + 1));
    }
  }
  if (isBuild()) {
    console.warn(`[feeds] ${url} unavailable at build time after ${attempts} tries; showing fallback.`, String(last));
    return null;
  }
  throw last;
}

/**
 * The preview image an article page declares for sharing (og:image / twitter:image), used
 * for news items without a photo. Undefined when the page can't be read or has none.
 */
export async function getShareImage(pageUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(pageUrl, { headers: { ...HEADERS, Accept: "text/html" }, next: { revalidate: 24 * HOUR, tags: ["feeds"] }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return undefined;
    const html = (await res.text()).slice(0, 400_000);
    const meta = (key: string) =>
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"))?.[1] ??
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"))?.[1];
    const found = meta("og:image") ?? meta("og:image:secure_url") ?? meta("twitter:image");
    if (!found) return undefined;
    const absolute = new URL(found.replace(/&amp;/g, "&"), pageUrl);
    return absolute.protocol === "https:" ? absolute.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Saved copy of the Substack feed, refreshed with `npm run substack:save`. */
const SAVED_SUBSTACK_FEED = path.join(process.cwd(), "data", "substack-feed.xml");

/**
 * The newsletter's essays. Substack often refuses requests from build servers (GitHub
 * Actions), so if the live feed can't be read, or comes back with no posts, the saved
 * copy in data/substack-feed.xml is used instead.
 */
export async function getSubstackEssays(substackUrl: string): Promise<Essay[]> {
  const xml = await fetchFeed(new URL("/feed", substackUrl).toString());
  const live = xml ? parseSubstack(xml) : [];
  if (live.length) return live;
  try {
    const saved = parseSubstack(await readFile(SAVED_SUBSTACK_FEED, "utf8"));
    if (saved.length) {
      console.warn(`[feeds] Substack feed unavailable; using the saved copy (${saved.length} essays).`);
      return saved;
    }
  } catch {
    // No saved copy yet.
  }
  console.warn("[feeds] Substack feed unavailable and no saved copy; showing the fallback card. Run `npm run substack:save`.");
  return [];
}

/**
 * The channel's latest videos. Uses the channel ID when it's set; otherwise works it out
 * from the channel's address (e.g. youtube.com/@TransitionVentureCapital) by reading the
 * channel page. Both are fetched at build time (and hourly on a server).
 */
export async function getYouTubeVideos(channelId?: string | null, channelUrl?: string | null): Promise<Video[]> {
  if (!channelId && channelUrl) {
    channelId = youtubeChannelId(channelUrl);
    if (!channelId && /youtube\.com\/(@|c\/|user\/)/.test(channelUrl)) {
      const html = await fetchFeed(channelUrl);
      channelId = html ? youtubeChannelId(html) : undefined;
      if (!channelId) console.warn(`[feeds] couldn't find the YouTube channel ID on ${channelUrl}.`);
    }
  }
  if (!channelId) return [];
  const xml = await fetchFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
  return xml ? parseYouTube(xml) : [];
}
