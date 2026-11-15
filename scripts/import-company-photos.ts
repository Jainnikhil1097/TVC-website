// Attaches the photos in scripts/seed-data/company-photos/ to their companies and
// puts them in the home hero slideshow:
//
//   npm run company:photos
//
// Name each file after the company's slug (as in its CMS URL), e.g. matel-motion.jpg.
// Uses DATABASE_URL from .env (your local CMS), or the production database if you
// pass its DATABASE_URL and PAYLOAD_SECRET. Safe to run more than once.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importCompanyPhotos } = await import("./company-photos");

const payload = await getPayload({ config });
await importCompanyPhotos(payload, (msg) => console.log(`[photos] ${msg}`));
process.exit(0);
