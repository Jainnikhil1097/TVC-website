// Tests for lib/feed-parse.ts against representative Substack RSS and YouTube Atom.
//   npx tsx scripts/test-feed-parse.ts
import assert from "node:assert/strict";
import { parseSubstack, parseYouTube } from "../lib/feed-parse";

const substack = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
<channel><title><![CDATA[Transition VC]]></title><link>https://transitionventurecapital.substack.com</link>
<item>
  <title><![CDATA[What Happens When a Drone Stops Needing a Pilot?]]></title>
  <description><![CDATA[<p>Why vision-based autonomy changes the economics of drones &amp; why we backed SUIND.</p>]]></description>
  <link>https://transitionventurecapital.substack.com/p/what-happens-when-a-drone-stops</link>
  <guid isPermaLink="false">https://transitionventurecapital.substack.com/p/what-happens-when-a-drone-stops</guid>
  <dc:creator><![CDATA[Transition VC]]></dc:creator>
  <pubDate>Tue, 29 Sep 2026 06:30:00 GMT</pubDate>
  <enclosure url="https://substackcdn.com/image/fetch/cover.jpg" length="0" type="image/jpeg"/>
  <content:encoded><![CDATA[<p>Long body…</p>]]></content:encoded>
</item>
<item>
  <title>Carbon Credits&#8217; Data Crisis: Why Trust Broke &amp; Demand Didn&#x2019;t</title>
  <description>Part 1 of 2 &#8212; measurement, baselines and trust.</description>
  <link>https://transitionventurecapital.substack.com/p/carbon-credits-data-crisis</link>
  <pubDate>not a date</pubDate>
</item>
<item><title></title><link>https://x.test/empty</link></item>
</channel></rss>`;

const essays = parseSubstack(substack);
assert.equal(essays.length, 2, "items without a title are dropped");
assert.equal(essays[0].title, "What Happens When a Drone Stops Needing a Pilot?");
assert.equal(essays[0].teaser, "Why vision-based autonomy changes the economics of drones & why we backed SUIND.");
assert.equal(essays[0].url, "https://transitionventurecapital.substack.com/p/what-happens-when-a-drone-stops");
assert.equal(essays[0].date, "2026-09-29T06:30:00.000Z");
assert.equal(essays[0].image, "https://substackcdn.com/image/fetch/cover.jpg");
assert.equal(essays[1].title, "Carbon Credits’ Data Crisis: Why Trust Broke & Demand Didn’t");
assert.equal(essays[1].teaser, "Part 1 of 2 — measurement, baselines and trust.");
assert.equal(essays[1].date, undefined, "invalid dates are ignored");
assert.equal(essays[1].image, undefined);

const long = `<rss><channel><item><title>T</title><link>https://a.test/p</link><description>${"word ".repeat(80)}</description></item></channel></rss>`;
const [truncated] = parseSubstack(long);
assert.ok(truncated.teaser.length <= 221 && truncated.teaser.endsWith("…"), "long teasers are truncated on a word");

const youtube = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <link rel="self" href="http://www.youtube.com/feeds/videos.xml?channel_id=UCabc"/>
 <title>Transition VC</title>
 <entry>
  <id>yt:video:abc123</id>
  <title>Founder Conversations: Building India&apos;s Drone Stack</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=abc123"/>
  <published>2026-09-20T10:00:00+00:00</published>
  <media:group>
   <media:title>Founder Conversations</media:title>
   <media:thumbnail url="https://i2.ytimg.com/vi/abc123/hqdefault.jpg" width="480" height="360"/>
  </media:group>
 </entry>
</feed>`;

const videos = parseYouTube(youtube);
assert.equal(videos.length, 1);
assert.equal(videos[0].title, "Founder Conversations: Building India's Drone Stack");
assert.equal(videos[0].url, "https://www.youtube.com/watch?v=abc123", "uses the alternate link, not the feed's self link");
assert.equal(videos[0].date, "2026-09-20T10:00:00.000Z");
assert.equal(videos[0].thumbnail, "https://i2.ytimg.com/vi/abc123/hqdefault.jpg");

assert.deepEqual(parseSubstack("<html>not a feed</html>"), []);
assert.deepEqual(parseYouTube(""), []);

console.log("feed-parse: all assertions passed");
