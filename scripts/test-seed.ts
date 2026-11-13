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

// …then someone re-runs the seed.
execFileSync(process.execPath, ["--import", "tsx", "scripts/seed.ts"], { env: process.env, stdio: "pipe" });

const home = await payload.findGlobal({ slug: "home-page" });
const site = await payload.findGlobal({ slug: "site" });
const after = await payload.count({ collection: "companies" });
assert.equal(home.positioning, "Edited by an editor", "home page edits survive a re-seed");
assert.equal(site.tagline, "Edited tagline", "site settings edits survive a re-seed");
assert.equal(after.totalDocs, before.totalDocs, "no duplicate companies");
assert.ok((home.pillars ?? []).length > 0 && (home.faq ?? []).length > 0, "seeded pillars and FAQ are present");

console.log("seed: re-running the seed preserves edits");
process.exit(0);
