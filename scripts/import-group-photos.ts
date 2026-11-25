// Adds the team's group photos (scripts/seed-data/group-photos/) to the About page and the
// home page's "About Transition VC" band:
//
//   npm run about:photos
//
// Uses DATABASE_URL from .env (your local CMS), or production if you pass its DATABASE_URL
// and PAYLOAD_SECRET. Only fills empty fields, so it never replaces an editor's photos.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importGroupPhotos } = await import("./group-photos");

const payload = await getPayload({ config });
await importGroupPhotos(payload, (msg) => console.log(`[photos] ${msg}`));
process.exit(0);
