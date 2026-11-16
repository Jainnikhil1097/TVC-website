// Fills each company's One-pager tab (product, proof, story) from
// scripts/seed-data/one-pagers.ts and attaches product renders from
// scripts/seed-data/company-products/:
//
//   npm run company:onepagers
//
// Only empty fields are filled, so it never overwrites what editors wrote. Uses
// DATABASE_URL from .env (your local CMS), or production if you pass its
// DATABASE_URL and PAYLOAD_SECRET. Safe to run more than once.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importOnePagers } = await import("./one-pagers");

const payload = await getPayload({ config });
await importOnePagers(payload, (msg) => console.log(`[one-pagers] ${msg}`));
process.exit(0);
