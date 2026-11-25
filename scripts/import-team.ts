// Updates the CMS team from scripts/seed-data/team.ts and its photos:
//
//   npm run team:import
//
// Uses DATABASE_URL from .env (your local CMS), or the production database if you
// pass its DATABASE_URL and PAYLOAD_SECRET. See scripts/team-import.ts for exactly
// what it changes. Safe to run more than once.
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());

const { default: config } = await import("../payload.config");
const { importTeam } = await import("./team-import");

const payload = await getPayload({ config });
await importTeam(payload, (msg) => console.log(`[team] ${msg}`));
process.exit(0);
