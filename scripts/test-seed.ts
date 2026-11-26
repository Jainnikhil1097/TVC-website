// Seed safety: re-running the seed must never overwrite what editors changed.
//   DATABASE_URL=file:./.data/test.db node --import tsx scripts/test-seed.ts
// (Run by `npm test` against a throwaway database that has already been seeded once.)
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL?.includes(".data/")) {
  console.error("Refusing to run: point DATABASE_URL at a throwaway database under .data/");
  process.exit(1);
}

const { default: config } = await import("../payload.config");
const payload = await getPayload({ config });
const context = { disableRevalidate: true };

// An editor changes page settings and a company…
await payload.updateGlobal({ slug: "home-page", data: { positioning: "Edited by an editor" }, context });
await payload.updateGlobal({ slug: "site", data: { tagline: "Edited tagline" }, context });
const before = await payload.count({ collection: "companies" });
const matel = (await payload.find({ collection: "companies", where: { slug: { equals: "matel-motion" } }, limit: 1 })).docs[0];
assert.ok(matel.breakthrough && matel.traction?.length && matel.productImage, "one-pager content and product image are seeded");
await payload.update({ collection: "companies", id: matel.id, data: { breakthrough: "Edited breakthrough", traction: [] }, context });

// …then someone re-runs the seed.
execFileSync(process.execPath, ["--import", "tsx", "scripts/seed.ts"], { env: process.env, stdio: "pipe" });

const home = await payload.findGlobal({ slug: "home-page" });
const site = await payload.findGlobal({ slug: "site" });
const after = await payload.count({ collection: "companies" });
assert.equal(home.positioning, "Edited by an editor", "home page edits survive a re-seed");
assert.equal(site.tagline, "Edited tagline", "site settings edits survive a re-seed");
assert.equal(after.totalDocs, before.totalDocs, "no duplicate companies");
assert.ok((home.pillars ?? []).length > 0 && (home.faq ?? []).length > 0, "seeded pillars and FAQ are present");
const matelAfter = await payload.findByID({ collection: "companies", id: matel.id });
assert.equal(matelAfter.breakthrough, "Edited breakthrough", "one-pager edits survive a re-seed");
assert.ok(matelAfter.traction?.length, "emptied one-pager fields are filled again");

// One-pager content is public: no company financials or return figures.
const { onePagers } = await import("./seed-data/one-pagers");
const FORBIDDEN = /revenue|raised|raising|\breturns?\b|EBITDA|\bIRR\b|\bIPO\b|valuation|margin|funding|order book/i;
for (const [slug, content] of Object.entries(onePagers)) {
  const text = JSON.stringify(content);
  assert.ok(!FORBIDDEN.test(text), `one-pager for ${slug} mentions "${text.match(FORBIDDEN)?.[0]}"`);
}

// Impact content is public too, and also names no lenders or debt (the public-site rule).
const { impact } = await import("./seed-data/impact");
const { companyImpact, sdgGoals } = await import("./seed-data/impact-content");
const IMPACT_FORBIDDEN = new RegExp(`${FORBIDDEN.source}|\\bdebt\\b|lender|\\bSBI\\b|ICICI|order pipeline|Article 8`, "i");
for (const [name, content] of Object.entries({ page: impact, companies: companyImpact, sdgs: sdgGoals })) {
  const text = JSON.stringify(content);
  assert.ok(!IMPACT_FORBIDDEN.test(text), `impact ${name} content mentions "${text.match(IMPACT_FORBIDDEN)?.[0]}"`);
}
const impactPage = await payload.findGlobal({ slug: "impact-page" });
assert.ok(impactPage.hero?.headline && (impactPage.sdgs?.goals ?? []).length >= 9, "impact page is seeded");
const { totalDocs: withImpact } = await payload.count({ collection: "companies", where: { "impact.show": { equals: true } } });
assert.equal(withImpact, Object.keys(companyImpact).length, "every company view is seeded");

console.log("seed: re-running the seed preserves edits; one-pagers and impact content are seeded and public-safe");
process.exit(0);
