// Attaches the logos in scripts/seed-data/company-logos/ to companies that have none:
//
//   npm run company:logos
//
// Name each file after the company's slug, e.g. matel-motion.png. Uses DATABASE_URL from
// .env (your local CMS), or production if you pass its DATABASE_URL and PAYLOAD_SECRET.
// Never replaces a logo already set in the CMS. Safe to run more than once.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importCompanyLogos } = await import("./company-logos");

const payload = await getPayload({ config });
await importCompanyLogos(payload, (msg) => console.log(`[logos] ${msg}`));
process.exit(0);
