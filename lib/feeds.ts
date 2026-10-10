import "server-only";
import type { Essay, Video } from "./types";
import { parseSubstack, parseYouTube } from "./feed-parse";

const HOUR = 3600;
const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * Fetch a feed, refreshed hourly. If it fails during a background refresh we
 * rethrow, so Next keeps serving the last good page. If it fails during the
 * initial build we return null and the page shows a fallback card instead.
 */
async function fetchFeed(url: string): Promise<string | null> {
  try {
    // Time out rather than hang a build or refresh if a feed host is slow.
    const res = await fetch(url, { next: { revalidate: HOUR, tags: ["feeds"] }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return await res.text();
  } catch (error) {
    if (isBuild()) {
      console.warn(`[feeds] ${url} unavailable at build time — showing fallback.`, String(error));
      return null;
    }
    throw error;
  }
}

export async function getSubstackEssays(substackUrl: string): Promise<Essay[]> {
  const xml = await fetchFeed(new URL("/feed", substackUrl).toString());
  return xml ? parseSubstack(xml) : [];
}

export async function getYouTubeVideos(channelId?: string | null): Promise<Video[]> {
  if (!channelId) return [];
  const xml = await fetchFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
  return xml ? parseYouTube(xml) : [];
}
