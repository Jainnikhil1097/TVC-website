# Transition VC — website 

Website for [Transition VC](https://www.transitionventurecapital.com), India's first
energy-transition venture fund. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4,
with **Payload CMS 3** built in at `/admin` so the team can update content without a developer.

- Public pages are statically generated and served from the CDN; they refresh within seconds of
  a CMS edit (on-demand revalidation) and hourly otherwise (Substack/YouTube feeds).
- Editors: see **[docs/editing-guide.md](docs/editing-guide.md)**.

## Getting started (local)

```bash
cp .env.example .env    # then set PAYLOAD_SECRET (openssl rand -hex 32)
npm ci                  # installs exactly what's in package-lock.json (public npm registry)
npm run seed            # loads the original content into a local SQLite database (dev.db)
npm run dev             # site: http://localhost:3000   admin: http://localhost:3000/admin
```

The first account created at `/admin` automatically becomes an **Admin**.

| Script | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Lint + type-check + build — run before every commit |
| `npm test` | Feed-parser, upload-authorisation and enquiry-intake tests (uses the local database) |
| `npm run seed` | Imports the original content (`scripts/seed-data/`) into the CMS. Safe to re-run: skips collections and page settings that already have content; `-- --reset` wipes content (never users) first |
| `npm run generate:types` | Regenerates `payload-types.ts` after changing collections/globals |
| `npm run generate:importmap` | Regenerates the admin import map after adding admin components |
| `npm run migrate:create <name>` | Creates a Postgres migration after changing collections/globals (commit it) |
| `npm run migrate` | Applies pending migrations (production also applies them automatically on start-up) |
| `npm run globe:build` | Regenerates `public/globe/*` (home globe data) from Natural Earth. Takes ~2 min |
| `node scripts/extract-india.mjs <file>` | Re-extracts India's official boundary into `data/india-official.geojson` (see below) |
| `npm run lockfile:public` | Rewrites `package-lock.json` URLs to registry.npmjs.org (see Package policy) |
| `node scripts/verify.mjs` | After a build: screenshots every page at 360–1440px with local Chrome, reports console errors / overflow |

Scripts use webpack (`--webpack`) rather than Turbopack so builds behave the same in restricted
sandboxes and CI.

## How content works

| Where | What |
|---|---|
| `payload.config.ts` | CMS setup: database (Postgres in production, SQLite locally), Vercel Blob storage, SMTP email |
| `cms/collections/` | Portfolio, Team, News, Events, Reports, Funds, Enquiries, Media, Users |
| `cms/globals/` | Site settings, Announcement bar, SEO, Home page (positioning, pillars, FAQ), Home sectors, Impact page, GIFT City page, Fund metrics |
| `cms/access.ts` | Roles: Editors edit content; Admins also edit fund figures/SEBI details, read enquiries, manage users |
| `lib/cms.ts` | Typed getters used by pages; maps CMS documents to the site's own types (`lib/types.ts`) |
| `lib/feeds.ts` | Substack + YouTube RSS, refreshed hourly; falls back gracefully if a feed is unreachable |
| `cms/endpoints/submissions.ts` | Website form intake (validation, spam trap, rate limit, private file storage) and admin-only downloads |
| `lib/taxonomy.ts` | Fixed lists (the 8 portfolio sectors, stages, statuses) — developer-managed |

Any CMS change revalidates the whole site (`cms/hooks/revalidate.ts`) — it's a small site, so this
is cheap and guarantees counts, footers and teasers never go stale.

Pitch decks are uploaded straight from the browser to **private** Vercel Blob storage
(bypassing Vercel's 4.5 MB request limit, up to 10 MB), and can only be downloaded by Admins.

## Deploying to Vercel (one-time setup)

1. Push this repo to GitHub and import it in Vercel (a company site needs the **Pro** plan —
   Hobby is for non-commercial use).
2. In the Vercel project: **Storage → add Neon Postgres** and **Storage → add Blob**. These set
   `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` automatically.
3. Add environment variables: `PAYLOAD_SECRET` (long random string), `NEXT_PUBLIC_SERVER_URL`
   (the live address), and for email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
   `EMAIL_FROM`, optionally `SUBMISSIONS_NOTIFY_EMAIL`. See `.env.example`.
4. Deploy. Migrations in `migrations/` run automatically on first start.
5. Seed the production database once, from your machine, using the production `DATABASE_URL`:
   `DATABASE_URL="postgres://…" PAYLOAD_SECRET="…" npm run seed`
6. Visit `/admin`, create the first (Admin) account, then invite editors.
7. In **Site settings → Links**, add the YouTube channel ID so new videos appear automatically.

## Static preview on GitHub Pages

A look-only copy of the site for sharing before launch: every page, the globe, the portfolio
map and the animations, but **no /admin, and forms are switched off** (they show a "preview"
note). It's hidden from search engines.

- **Publishing:** `.github/workflows/pages.yml` rebuilds it on every push to `main`. One-time
  setup: in the repo, **Settings → Pages → Source: GitHub Actions**. It's then at
  `https://<github-user>.github.io/<repo>/`. On a free GitHub account the repo must be public
  for Pages to work.
- **Content:** the preview is built from the starting content in `scripts/seed-data/`, not from
  the CMS. To change what it shows, edit those files and push.
- **Locally:** `BASE_PATH=/<repo> npm run build:pages` writes the files to `out/`. It uses your
  local CMS database. While it runs, the CMS routes are set aside, so /admin on a running
  dev server is unavailable for about a minute.

## Before launch — outstanding content (all editable in the CMS now)

- [ ] Official logo SVG → replace `components/ui/Logo.tsx` and `cms/components/Branding.tsx`
- [ ] Team headshots, portfolio logos, policy PDFs (upload in the CMS)
- [ ] Investor Login URL and YouTube channel ID (Site settings)
- [ ] Review the draft "Why founders choose us" pillars and founder FAQ (Pages → Home page)
- [ ] Cover images for featured companies (Portfolio → Basics)
- [ ] Each company's related Substack essay link (Portfolio → Profile)
- [ ] Impact figures and GIFT City copy (Pages)
- [ ] Confirm the 19th active portfolio company (the original site listed 18)

## Package policy

Only public, open-source npm packages (MIT / MIT-0 / ISC / Apache-2.0 / OFL; GSAP under its free
standard licence). `.npmrc` pins the public registry so the lockfile works on any machine.

If registry.npmjs.org is blocked on your network, install through a mirror and then clean the
lockfile before committing:

```bash
npm install <pkg> --registry=<your-mirror>
npm run lockfile:public
```

`package.json → overrides` pins `undici` 7.29.1 (Payload pins a vulnerable 7.29.0). `npm audit`
still lists moderate advisories for an old `esbuild` inside `drizzle-kit` (the migration tool);
they affect esbuild's dev server, which is never run here.

## India's boundary on the globe

Maps published in India must show the official boundary. The globe therefore never uses the
default (de facto) Natural Earth outline. India comes from
[`ne_10m_admin_0_countries_ind`](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries_ind.geojson)
— Natural Earth's "India point of view" dataset (public domain) — extracted to
`data/india-official.geojson`. `scripts/india-check.mjs` blocks both the extraction and the
globe build unless the outline includes all of Jammu & Kashmir and Ladakh (Gilgit-Baltistan,
PoK, Aksai Chin, Siachen) and Arunachal Pradesh.

## Performance notes

- The home globe (three.js) loads only on the home page, after first paint, and is skipped for
  reduced-motion, Save-Data and no-WebGL visitors (a static SVG globe is shown instead).
- GSAP is imported on demand by the home scroll scene only. Scroll reveals elsewhere use one
  shared IntersectionObserver (`components/motion/RevealObserver.tsx`) and CSS.
- No CMS/admin code ships on public pages (admin lives in its own route group, `app/(payload)`).
  Public pages load 146–173 KB of JS (gzipped), ~126 KB of which is React + Next.js.
- Fonts are self-hosted via Fontsource (Merriweather + Manrope).
