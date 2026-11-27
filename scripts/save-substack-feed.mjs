// Saves the Substack feed to data/substack-feed.xml. The build uses this copy whenever it
// can't reach Substack (it often refuses GitHub's build servers). Run it from your own
// computer after publishing a new essay, then commit the file:
//   npm run substack:save
import { writeFile } from "node:fs/promises";

const url = process.argv[2] ?? "https://transitionventurecapital.substack.com/feed";
const res = await fetch(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.5",
  },
});
const xml = await res.text();
const posts = (xml.match(/<item[\s>]/g) ?? []).length;
if (!res.ok || !posts) {
  console.error(`Couldn't read the feed (${res.status}${posts ? "" : ", no posts found"}). Nothing saved.`);
  console.error(`Alternative: open ${url} in a browser, save the page as data/substack-feed.xml.`);
  process.exit(1);
}
await writeFile(new URL("../data/substack-feed.xml", import.meta.url), xml);
console.log(`Saved ${posts} essays to data/substack-feed.xml. Commit it so the next deploy uses it.`);
