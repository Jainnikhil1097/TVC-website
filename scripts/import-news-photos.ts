// Adds the photos to the news items (scripts/seed-data/news-photos/), downloading any that
// are missing from the previous website's image host first:
//
//   npm run news:photos
//
// Uses DATABASE_URL from .env (your local CMS), or production if you pass its DATABASE_URL
// and PAYLOAD_SECRET. Only fills news items without a photo. Safe to run more than once.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importNewsPhotos } = await import("./news-photos");

const payload = await getPayload({ config });
await importNewsPhotos(payload, (msg) => console.log(`[news] ${msg}`), { fetchMissing: true });
process.exit(0);
