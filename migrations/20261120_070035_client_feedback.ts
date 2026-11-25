import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Capital Formation now sits within Investor Relations: move people before the team list changes.
  await db.execute(sql`
  UPDATE "team" SET "group" = 'investor-relations' WHERE "group" = 'capital-formation';
  UPDATE "_team_v" SET "version_group" = 'investor-relations' WHERE "version_group" = 'capital-formation';`)

  await db.execute(sql`
   CREATE TYPE "public"."enum_companies_fund" AS ENUM('pre-fund', 'fund-1', 'fund-2');
  CREATE TYPE "public"."enum__companies_v_version_fund" AS ENUM('pre-fund', 'fund-1', 'fund-2');
  CREATE TABLE "site_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"map_url" varchar
  );
  
  CREATE TABLE "_site_v_version_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"map_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "portfolio_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Portfolio',
  	"headline" varchar DEFAULT 'The companies engineering India''s energy future',
  	"intro" varchar DEFAULT 'Engineering-led companies we back across India''s energy transition. Building in energy? We''d like to hear from you.',
  	"cta_label" varchar DEFAULT 'Pitch to us',
  	"cta_href" varchar DEFAULT '/contact?type=startup',
  	"active_label" varchar DEFAULT 'Active companies',
  	"sectors_label" varchar DEFAULT 'Sectors',
  	"stages_label" varchar DEFAULT 'Stages',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'About us',
  	"headline" varchar DEFAULT 'India''s first energy-transition venture fund',
  	"approach_eyebrow" varchar DEFAULT 'Our approach',
  	"team_eyebrow" varchar DEFAULT 'The team',
  	"team_heading" varchar DEFAULT 'The people behind the fund',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "perspectives_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Perspectives',
  	"headline" varchar DEFAULT 'Ideas behind the investments',
  	"intro" varchar DEFAULT 'Perspectives on India’s energy transition, straight from our newsletter.',
  	"substack_label" varchar DEFAULT 'Subscribe on Substack',
  	"youtube_label" varchar DEFAULT 'Watch on YouTube',
  	"index_eyebrow" varchar DEFAULT 'Index',
  	"index_heading" varchar DEFAULT 'Everything we’ve published',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "page_seo" DROP CONSTRAINT "page_seo_funds_image_id_media_id_fk";
  
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE text;
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'investments'::text;
  DROP TYPE "public"."enum_team_group";
  CREATE TYPE "public"."enum_team_group" AS ENUM('founding', 'investments', 'investor-relations', 'portfolio-investments', 'marketing', 'finance', 'hr', 'advisors', 'executive');
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'investments'::"public"."enum_team_group";
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE "public"."enum_team_group" USING "group"::"public"."enum_team_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE text;
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'investments'::text;
  DROP TYPE "public"."enum__team_v_version_group";
  CREATE TYPE "public"."enum__team_v_version_group" AS ENUM('founding', 'investments', 'investor-relations', 'portfolio-investments', 'marketing', 'finance', 'hr', 'advisors', 'executive');
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'investments'::"public"."enum__team_v_version_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE "public"."enum__team_v_version_group" USING "version_group"::"public"."enum__team_v_version_group";
  DROP INDEX "page_seo_funds_funds_image_idx";
  ALTER TABLE "companies" ADD COLUMN "fund" "enum_companies_fund" DEFAULT 'fund-1';
  ALTER TABLE "_companies_v" ADD COLUMN "version_fund" "enum__companies_v_version_fund" DEFAULT 'fund-1';
  ALTER TABLE "site" ADD COLUMN "form_recipients_startup" varchar;
  ALTER TABLE "site" ADD COLUMN "form_recipients_investor" varchar;
  ALTER TABLE "site" ADD COLUMN "form_recipients_partner" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_form_recipients_startup" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_form_recipients_investor" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_form_recipients_partner" varchar;
  ALTER TABLE "site_offices" ADD CONSTRAINT "site_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_offices" ADD CONSTRAINT "_site_v_version_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_next_steps" ADD CONSTRAINT "about_page_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_offices_order_idx" ON "site_offices" USING btree ("_order");
  CREATE INDEX "site_offices_parent_id_idx" ON "site_offices" USING btree ("_parent_id");
  CREATE INDEX "_site_v_version_offices_order_idx" ON "_site_v_version_offices" USING btree ("_order");
  CREATE INDEX "_site_v_version_offices_parent_id_idx" ON "_site_v_version_offices" USING btree ("_parent_id");
  CREATE INDEX "about_page_next_steps_order_idx" ON "about_page_next_steps" USING btree ("_order");
  CREATE INDEX "about_page_next_steps_parent_id_idx" ON "about_page_next_steps" USING btree ("_parent_id");
  -- Offices: the existing address becomes the first office (Domlur), then Indiranagar.
  INSERT INTO "site_offices" ("_order", "_parent_id", "id", "name", "address", "map_url")
    SELECT 1, "id", substr(md5(random()::text), 1, 24), 'Domlur', "address", "map_url" FROM "site" WHERE "address" IS NOT NULL;
  INSERT INTO "site_offices" ("_order", "_parent_id", "id", "name", "address", "map_url")
    SELECT 2, "id", substr(md5(random()::text), 1, 24), 'Indiranagar',
      'Aishwarya Ambassador, Defence Colony, Indiranagar' || chr(10) || 'Bengaluru, Karnataka 560038',
      'https://www.google.com/maps/search/?api=1&query=Aishwarya+Ambassador+Defence+Colony+Indiranagar+Bengaluru+560038'
    FROM "site";
  -- Who receives each contact form.
  UPDATE "site" SET
    "form_recipients_startup" = 'Bhoomika@transitionventurecapital.com',
    "form_recipients_investor" = 'stenson@transitionventurecapital.com, krishna@transitionventurecapital.com',
    "form_recipients_partner" = 'navi@transitionventurecapital.com';
  -- Cheque size in rupees (only if still the old placeholder figure).
  UPDATE "site" SET "cheque" = '₹20 Cr – ₹50 Cr' WHERE "cheque" = '$0.5M – $5M';
  -- Home headline wording (only if no editor has changed it).
  UPDATE "site" SET "tagline" = 'Engineering the Future of Energy' WHERE "tagline" = 'Engineering Future of Energy';
  -- Instagram is no longer linked.
  DELETE FROM "site_socials" WHERE lower("label") = 'instagram';
  ALTER TABLE "companies" DROP COLUMN "founder_track_record";
  ALTER TABLE "_companies_v" DROP COLUMN "version_founder_track_record";
  ALTER TABLE "site" DROP COLUMN "address";
  ALTER TABLE "site" DROP COLUMN "map_url";
  ALTER TABLE "_site_v" DROP COLUMN "version_address";
  ALTER TABLE "_site_v" DROP COLUMN "version_map_url";
  ALTER TABLE "page_seo" DROP COLUMN "funds_title";
  ALTER TABLE "page_seo" DROP COLUMN "funds_description";
  ALTER TABLE "page_seo" DROP COLUMN "funds_image_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_team_group" ADD VALUE 'capital-formation' BEFORE 'portfolio-investments';
  ALTER TYPE "public"."enum__team_v_version_group" ADD VALUE 'capital-formation' BEFORE 'portfolio-investments';
  ALTER TABLE "site" ADD COLUMN "address" varchar;
  ALTER TABLE "site" ADD COLUMN "map_url" varchar;
  UPDATE "site" SET "address" = o."address", "map_url" = o."map_url" FROM "site_offices" o WHERE o."_parent_id" = "site"."id" AND o."_order" = 1;
  UPDATE "site" SET "address" = '' WHERE "address" IS NULL;
  ALTER TABLE "site" ALTER COLUMN "address" SET NOT NULL;
  ALTER TABLE "site_offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_v_version_offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portfolio_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "perspectives_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_offices" CASCADE;
  DROP TABLE "_site_v_version_offices" CASCADE;
  DROP TABLE "portfolio_page" CASCADE;
  DROP TABLE "about_page_next_steps" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "perspectives_page" CASCADE;
  ALTER TABLE "companies" ADD COLUMN "founder_track_record" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_founder_track_record" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_address" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_map_url" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "funds_title" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "funds_description" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "funds_image_id" integer;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_funds_image_id_media_id_fk" FOREIGN KEY ("funds_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_seo_funds_funds_image_idx" ON "page_seo" USING btree ("funds_image_id");
  ALTER TABLE "companies" DROP COLUMN "fund";
  ALTER TABLE "_companies_v" DROP COLUMN "version_fund";
  ALTER TABLE "site" DROP COLUMN "form_recipients_startup";
  ALTER TABLE "site" DROP COLUMN "form_recipients_investor";
  ALTER TABLE "site" DROP COLUMN "form_recipients_partner";
  ALTER TABLE "_site_v" DROP COLUMN "version_form_recipients_startup";
  ALTER TABLE "_site_v" DROP COLUMN "version_form_recipients_investor";
  ALTER TABLE "_site_v" DROP COLUMN "version_form_recipients_partner";
  DROP TYPE "public"."enum_companies_fund";
  DROP TYPE "public"."enum__companies_v_version_fund";`)
}
