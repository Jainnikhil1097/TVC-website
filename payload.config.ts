import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import sharp from "sharp";

import { Users } from "./cms/collections/Users";
import { Media } from "./cms/collections/Media";
import { TeamMembers } from "./cms/collections/TeamMembers";
import { PortfolioCompanies } from "./cms/collections/PortfolioCompanies";
import { Funds } from "./cms/collections/Funds";
import { Events, Jobs, News, Reports } from "./cms/collections/Content";
import { Submissions } from "./cms/collections/Submissions";
import {
  Announcement,
  FundMetrics,
  GiftCityPage,
  HomeSectors,
  ImpactPage,
  PageSeo,
  SiteSettings,
} from "./cms/globals";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Postgres in production (Neon via Vercel); a local SQLite file for development
// and CI, so the site can be built and seeded without a database server.
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const usingSqlite = databaseUrl.startsWith("file:");

const secret =
  process.env.PAYLOAD_SECRET || (usingSqlite ? "local-development-only-secret-change-me" : "");
if (!secret) throw new Error("PAYLOAD_SECRET must be set when using a production database.");

// Payload only accepts the login cookie on requests from trusted origins (CSRF
// protection). In local development any port/host is fine, so nothing is pinned —
// otherwise opening the admin on e.g. localhost:3001 silently logs saves out
// ("You are not allowed to perform this action"). In production we trust the
// site's address, its www/non-www twin, and Vercel's deployment URLs.
const isDev = process.env.NODE_ENV === "development";
const vercelOrigins = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
]
  .filter(Boolean)
  .map((host) => `https://${host}`);
const serverURL = isDev ? "" : process.env.NEXT_PUBLIC_SERVER_URL || vercelOrigins[0] || "";

function withWwwTwin(url: string) {
  try {
    const u = new URL(url);
    const twin = new URL(url);
    twin.hostname = u.hostname.startsWith("www.") ? u.hostname.slice(4) : `www.${u.hostname}`;
    return [u.origin, twin.origin];
  } catch {
    return [];
  }
}
const csrf = serverURL ? [...new Set([...withWwwTwin(serverURL), ...vercelOrigins])] : [];

// Email for password resets and enquiry alerts. Works with any SMTP service
// (Microsoft 365, Google Workspace, Resend, SES…). Without SMTP settings, emails
// are only written to the server log.
const smtpPort = Number(process.env.SMTP_PORT || 587);
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || "no-reply@transitionventurecapital.com",
      defaultFromName: "Transition VC website",
      skipVerify: true,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined;

export default buildConfig({
  secret,
  serverURL,
  csrf,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " · Transition VC" },
    importMap: { baseDir: dirname },
    components: {
      graphics: {
        Logo: "@/cms/components/Branding#AdminLogo",
        Icon: "@/cms/components/Branding#AdminIcon",
      },
    },
  },
  collections: [
    PortfolioCompanies,
    TeamMembers,
    News,
    Events,
    Reports,
    Jobs,
    Funds,
    Submissions,
    Media,
    Users,
  ],
  globals: [SiteSettings, Announcement, PageSeo, HomeSectors, ImpactPage, GiftCityPage, FundMetrics],
  db: usingSqlite
    ? sqliteAdapter({ client: { url: databaseUrl }, push: true })
    : postgresAdapter({
        pool: { connectionString: databaseUrl },
        migrationDir: path.resolve(dirname, "migrations"),
        push: false,
        // Apply any pending migrations when the app starts (safe on Vercel's serverless runtime).
        prodMigrations: migrations,
      }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
      collections: { media: true },
      // Upload straight from the browser to Blob, bypassing Vercel's 4.5 MB request limit.
      clientUploads: true,
    }),
  ],
  upload: { limits: { fileSize: 25 * 1024 * 1024 } },
  email,
  sharp,
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  telemetry: false,
});
