// Visual + sanity check of the production build without running a server.
//
//   npm run build && node scripts/verify.mjs [--routes /,/about] [--widths 390,1440]
//
// Serves .next/server/app/*.html, .next/static and /public to the locally installed
// Google Chrome via request interception, then for each route × width:
//   • saves a full-page screenshot to screenshots/
//   • reports console errors, failed requests and horizontal overflow.
import { chromium } from "playwright-core";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const ORIGIN = "http://tvc.test";
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), [])
);
const routes = (args.routes ?? "/,/about,/portfolio,/perspectives,/impact,/gift-city,/funds,/contact").split(",");
const widths = (args.widths ?? "360,390,768,1024,1440").split(",").map(Number);
const scrollShots = args.scroll ? Number(args.scroll) : 0; // extra viewport shots while scrolling

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".bin": "application/octet-stream",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".json": "application/json",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".ico": "image/x-icon",
};

function resolveFile(urlPath) {
  const p = decodeURIComponent(urlPath.split("?")[0]);
  if (p.startsWith("/_next/static/")) return path.join(root, ".next/static", p.slice("/_next/static/".length));
  const pub = path.join(root, "public", p);
  if (p !== "/" && existsSync(pub)) return pub;
  const page = p === "/" ? "index" : p.replace(/^\//, "").replace(/\/$/, "");
  const html = path.join(root, ".next/server/app", `${page}.html`);
  if (existsSync(html)) return html;
  const body = path.join(root, ".next/server/app", page + ".body");
  if (existsSync(body)) return body;
  return null;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir(path.join(root, "screenshots"), { recursive: true });
let problems = 0;

for (const width of widths) {
  const mobile = width < 768;
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) return route.fulfill({ status: 204, body: "" }); // no external calls
    const file = resolveFile(url.pathname);
    if (!file) return route.fulfill({ status: 404, body: "not found" });
    const ext = path.extname(file);
    return route.fulfill({ status: 200, body: await readFile(file), contentType: types[ext] ?? "text/html; charset=utf-8" });
  });

  for (const r of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("requestfailed", (req) => errors.push(`request failed: ${req.url()}`));
    page.on("response", (res) => res.status() >= 400 && errors.push(`${res.status()} ${res.url()}`));

    await page.goto(ORIGIN + r, { waitUntil: "load" });
    await page.waitForTimeout(1800);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = (r === "/" ? "home" : r.slice(1).replace(/[/?=&]/g, "_")) + `-${width}`;

    if (scrollShots) {
      const h = await page.evaluate(() => window.innerHeight);
      for (let i = 0; i <= scrollShots; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), i * h * 0.75);
        await page.waitForTimeout(900);
        await page.screenshot({ path: `screenshots/${name}-s${i}.png` });
      }
    } else {
      // Trigger scroll-based reveals so the full-page shot shows final state.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((res) => setTimeout(res, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    }

    const status = errors.length || overflow > 0 ? "✗" : "✓";
    if (status === "✗") problems++;
    console.log(`${status} ${r} @${width}px  overflow:${overflow}px  errors:${errors.length}`);
    for (const e of errors.slice(0, 5)) console.log("    ", e.slice(0, 200));
    await page.close();
  }
  await context.close();
}

await browser.close();
console.log(problems ? `\n${problems} route/width combinations need attention.` : "\nAll checks passed.");
process.exit(problems ? 1 : 0);
