// Puts the product images in scripts/seed-data/company-products/ on their companies:
//
//   npm run company:products
//
// Uses DATABASE_URL from .env (your local CMS), or production if you pass its DATABASE_URL
// and PAYLOAD_SECRET. Replaces only images that came from that folder. Safe to re-run.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importCompanyProducts } = await import("./company-products");

const payload = await getPayload({ config });
await importCompanyProducts(payload, (msg) => console.log(`[products] ${msg}`));
process.exit(0);
