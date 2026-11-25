// Fills the Impact page and each company's Impact tab from scripts/seed-data/impact*.ts,
// uploading the photos in seed-data/impact-photos/:
//
//   npm run impact:import
//
// Uses DATABASE_URL from .env (your local CMS), or production if you pass its
// DATABASE_URL and PAYLOAD_SECRET. Never overwrites content already in the CMS.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importImpact } = await import("./impact-import");

const payload = await getPayload({ config });
await importImpact(payload, (msg) => console.log(`[impact] ${msg}`));
process.exit(0);
