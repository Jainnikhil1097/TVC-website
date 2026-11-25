import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_impact_page_footprint_countries_presence" AS ENUM('hq', 'manufacturing', 'deployments');
  CREATE TABLE "companies_impact_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"unit" varchar,
  	"evidence" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "_companies_v_version_impact_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"unit" varchar,
  	"evidence" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "impact_page_hero_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"company_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "impact_page_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "impact_page_outcomes_measures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar,
  	"unit" varchar,
  	"definition" varchar
  );
  
  CREATE TABLE "impact_page_footprint_countries_presence" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_impact_page_footprint_countries_presence",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "impact_page_footprint_countries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"lat" numeric NOT NULL,
  	"lon" numeric NOT NULL,
  	"value" varchar,
  	"value_label" varchar,
  	"detail" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "impact_page_sdgs_goals_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"company_id" integer,
  	"label" varchar,
  	"connection" varchar NOT NULL,
  	"measures" varchar
  );
  
  CREATE TABLE "impact_page_sdgs_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar
  );
  
  CREATE TABLE "impact_page_contribution_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "impact_page_contribution_case_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "impact_page_women_leaders" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" varchar,
  	"name" varchar,
  	"role" varchar
  );
  
  CREATE TABLE "impact_page_women_functions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "impact_page_measurement_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar
  );
  
  CREATE TABLE "impact_page_measurement_reports" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" varchar,
  	"file_id" integer
  );
  
  CREATE TABLE "impact_page_measurement_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"text" varchar
  );
  
  ALTER TABLE "impact_page_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_themes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "impact_page_stats" CASCADE;
  DROP TABLE "impact_page_themes" CASCADE;
  ALTER TABLE "companies" ADD COLUMN "impact_show" boolean DEFAULT false;
  ALTER TABLE "companies" ADD COLUMN "impact_featured" boolean DEFAULT false;
  ALTER TABLE "companies" ADD COLUMN "impact_order" numeric;
  ALTER TABLE "companies" ADD COLUMN "impact_sector_label" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_stage" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_period" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_tagline" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_image_id" integer;
  ALTER TABLE "companies" ADD COLUMN "impact_closer_value" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_closer_text" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_evidence" varchar;
  ALTER TABLE "companies" ADD COLUMN "impact_sources" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_show" boolean DEFAULT false;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_featured" boolean DEFAULT false;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_order" numeric;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_sector_label" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_stage" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_period" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_tagline" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_image_id" integer;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_closer_value" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_closer_text" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_evidence" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_impact_sources" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "hero_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "hero_statement" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "hero_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "hero_primary_label" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "hero_secondary_label" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_status" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_coverage_title" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_coverage_text" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_coverage_note" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "outcomes_footnote" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "footprint_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "footprint_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "footprint_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "footprint_card_text" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "footprint_footnote" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "sdgs_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "sdgs_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "sdgs_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "sdgs_note" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "carousel_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "carousel_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "carousel_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "carousel_footnote" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_case_label" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_case_title" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_case_source" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "contribution_footnote" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "women_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "women_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "women_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "women_footnote" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "perspectives_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "perspectives_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "perspectives_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "perspectives_footnote" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "measurement_eyebrow" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "measurement_headline" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "measurement_intro" varchar;
  ALTER TABLE "impact_page" ADD COLUMN "measurement_process_title" varchar;
  ALTER TABLE "companies_impact_metrics" ADD CONSTRAINT "companies_impact_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_version_impact_metrics" ADD CONSTRAINT "_companies_v_version_impact_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_hero_tiles" ADD CONSTRAINT "impact_page_hero_tiles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impact_page_hero_tiles" ADD CONSTRAINT "impact_page_hero_tiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impact_page_hero_tiles" ADD CONSTRAINT "impact_page_hero_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_pathways" ADD CONSTRAINT "impact_page_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_outcomes_measures" ADD CONSTRAINT "impact_page_outcomes_measures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_footprint_countries_presence" ADD CONSTRAINT "impact_page_footprint_countries_presence_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."impact_page_footprint_countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_footprint_countries" ADD CONSTRAINT "impact_page_footprint_countries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_sdgs_goals_entries" ADD CONSTRAINT "impact_page_sdgs_goals_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impact_page_sdgs_goals_entries" ADD CONSTRAINT "impact_page_sdgs_goals_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page_sdgs_goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_sdgs_goals" ADD CONSTRAINT "impact_page_sdgs_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_contribution_pillars" ADD CONSTRAINT "impact_page_contribution_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_contribution_case_points" ADD CONSTRAINT "impact_page_contribution_case_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_women_leaders" ADD CONSTRAINT "impact_page_women_leaders_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_women_functions" ADD CONSTRAINT "impact_page_women_functions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_measurement_items" ADD CONSTRAINT "impact_page_measurement_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_measurement_reports" ADD CONSTRAINT "impact_page_measurement_reports_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impact_page_measurement_reports" ADD CONSTRAINT "impact_page_measurement_reports_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_measurement_process" ADD CONSTRAINT "impact_page_measurement_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "companies_impact_metrics_order_idx" ON "companies_impact_metrics" USING btree ("_order");
  CREATE INDEX "companies_impact_metrics_parent_id_idx" ON "companies_impact_metrics" USING btree ("_parent_id");
  CREATE INDEX "_companies_v_version_impact_metrics_order_idx" ON "_companies_v_version_impact_metrics" USING btree ("_order");
  CREATE INDEX "_companies_v_version_impact_metrics_parent_id_idx" ON "_companies_v_version_impact_metrics" USING btree ("_parent_id");
  CREATE INDEX "impact_page_hero_tiles_order_idx" ON "impact_page_hero_tiles" USING btree ("_order");
  CREATE INDEX "impact_page_hero_tiles_parent_id_idx" ON "impact_page_hero_tiles" USING btree ("_parent_id");
  CREATE INDEX "impact_page_hero_tiles_image_idx" ON "impact_page_hero_tiles" USING btree ("image_id");
  CREATE INDEX "impact_page_hero_tiles_company_idx" ON "impact_page_hero_tiles" USING btree ("company_id");
  CREATE INDEX "impact_page_pathways_order_idx" ON "impact_page_pathways" USING btree ("_order");
  CREATE INDEX "impact_page_pathways_parent_id_idx" ON "impact_page_pathways" USING btree ("_parent_id");
  CREATE INDEX "impact_page_outcomes_measures_order_idx" ON "impact_page_outcomes_measures" USING btree ("_order");
  CREATE INDEX "impact_page_outcomes_measures_parent_id_idx" ON "impact_page_outcomes_measures" USING btree ("_parent_id");
  CREATE INDEX "impact_page_footprint_countries_presence_order_idx" ON "impact_page_footprint_countries_presence" USING btree ("order");
  CREATE INDEX "impact_page_footprint_countries_presence_parent_idx" ON "impact_page_footprint_countries_presence" USING btree ("parent_id");
  CREATE INDEX "impact_page_footprint_countries_order_idx" ON "impact_page_footprint_countries" USING btree ("_order");
  CREATE INDEX "impact_page_footprint_countries_parent_id_idx" ON "impact_page_footprint_countries" USING btree ("_parent_id");
  CREATE INDEX "impact_page_sdgs_goals_entries_order_idx" ON "impact_page_sdgs_goals_entries" USING btree ("_order");
  CREATE INDEX "impact_page_sdgs_goals_entries_parent_id_idx" ON "impact_page_sdgs_goals_entries" USING btree ("_parent_id");
  CREATE INDEX "impact_page_sdgs_goals_entries_company_idx" ON "impact_page_sdgs_goals_entries" USING btree ("company_id");
  CREATE INDEX "impact_page_sdgs_goals_order_idx" ON "impact_page_sdgs_goals" USING btree ("_order");
  CREATE INDEX "impact_page_sdgs_goals_parent_id_idx" ON "impact_page_sdgs_goals" USING btree ("_parent_id");
  CREATE INDEX "impact_page_contribution_pillars_order_idx" ON "impact_page_contribution_pillars" USING btree ("_order");
  CREATE INDEX "impact_page_contribution_pillars_parent_id_idx" ON "impact_page_contribution_pillars" USING btree ("_parent_id");
  CREATE INDEX "impact_page_contribution_case_points_order_idx" ON "impact_page_contribution_case_points" USING btree ("_order");
  CREATE INDEX "impact_page_contribution_case_points_parent_id_idx" ON "impact_page_contribution_case_points" USING btree ("_parent_id");
  CREATE INDEX "impact_page_women_leaders_order_idx" ON "impact_page_women_leaders" USING btree ("_order");
  CREATE INDEX "impact_page_women_leaders_parent_id_idx" ON "impact_page_women_leaders" USING btree ("_parent_id");
  CREATE INDEX "impact_page_women_functions_order_idx" ON "impact_page_women_functions" USING btree ("_order");
  CREATE INDEX "impact_page_women_functions_parent_id_idx" ON "impact_page_women_functions" USING btree ("_parent_id");
  CREATE INDEX "impact_page_measurement_items_order_idx" ON "impact_page_measurement_items" USING btree ("_order");
  CREATE INDEX "impact_page_measurement_items_parent_id_idx" ON "impact_page_measurement_items" USING btree ("_parent_id");
  CREATE INDEX "impact_page_measurement_reports_order_idx" ON "impact_page_measurement_reports" USING btree ("_order");
  CREATE INDEX "impact_page_measurement_reports_parent_id_idx" ON "impact_page_measurement_reports" USING btree ("_parent_id");
  CREATE INDEX "impact_page_measurement_reports_file_idx" ON "impact_page_measurement_reports" USING btree ("file_id");
  CREATE INDEX "impact_page_measurement_process_order_idx" ON "impact_page_measurement_process" USING btree ("_order");
  CREATE INDEX "impact_page_measurement_process_parent_id_idx" ON "impact_page_measurement_process" USING btree ("_parent_id");
  ALTER TABLE "companies" ADD CONSTRAINT "companies_impact_image_id_media_id_fk" FOREIGN KEY ("impact_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_impact_image_id_media_id_fk" FOREIGN KEY ("version_impact_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "companies_impact_impact_image_idx" ON "companies" USING btree ("impact_image_id");
  CREATE INDEX "_companies_v_version_impact_version_impact_image_idx" ON "_companies_v" USING btree ("version_impact_image_id");
  ALTER TABLE "impact_page" DROP COLUMN "eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "headline";
  ALTER TABLE "impact_page" DROP COLUMN "intro";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "impact_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "impact_page_themes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  ALTER TABLE "companies_impact_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_companies_v_version_impact_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_hero_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_pathways" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_outcomes_measures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_footprint_countries_presence" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_footprint_countries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_sdgs_goals_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_sdgs_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_contribution_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_contribution_case_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_women_leaders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_women_functions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_measurement_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_measurement_reports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impact_page_measurement_process" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "companies_impact_metrics" CASCADE;
  DROP TABLE "_companies_v_version_impact_metrics" CASCADE;
  DROP TABLE "impact_page_hero_tiles" CASCADE;
  DROP TABLE "impact_page_pathways" CASCADE;
  DROP TABLE "impact_page_outcomes_measures" CASCADE;
  DROP TABLE "impact_page_footprint_countries_presence" CASCADE;
  DROP TABLE "impact_page_footprint_countries" CASCADE;
  DROP TABLE "impact_page_sdgs_goals_entries" CASCADE;
  DROP TABLE "impact_page_sdgs_goals" CASCADE;
  DROP TABLE "impact_page_contribution_pillars" CASCADE;
  DROP TABLE "impact_page_contribution_case_points" CASCADE;
  DROP TABLE "impact_page_women_leaders" CASCADE;
  DROP TABLE "impact_page_women_functions" CASCADE;
  DROP TABLE "impact_page_measurement_items" CASCADE;
  DROP TABLE "impact_page_measurement_reports" CASCADE;
  DROP TABLE "impact_page_measurement_process" CASCADE;
  ALTER TABLE "companies" DROP CONSTRAINT "companies_impact_image_id_media_id_fk";
  
  ALTER TABLE "_companies_v" DROP CONSTRAINT "_companies_v_version_impact_image_id_media_id_fk";
  
  DROP INDEX "companies_impact_impact_image_idx";
  DROP INDEX "_companies_v_version_impact_version_impact_image_idx";
  ALTER TABLE "impact_page" ADD COLUMN "eyebrow" varchar NOT NULL;
  ALTER TABLE "impact_page" ADD COLUMN "headline" varchar NOT NULL;
  ALTER TABLE "impact_page" ADD COLUMN "intro" varchar NOT NULL;
  ALTER TABLE "impact_page_stats" ADD CONSTRAINT "impact_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_themes" ADD CONSTRAINT "impact_page_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "impact_page_stats_order_idx" ON "impact_page_stats" USING btree ("_order");
  CREATE INDEX "impact_page_stats_parent_id_idx" ON "impact_page_stats" USING btree ("_parent_id");
  CREATE INDEX "impact_page_themes_order_idx" ON "impact_page_themes" USING btree ("_order");
  CREATE INDEX "impact_page_themes_parent_id_idx" ON "impact_page_themes" USING btree ("_parent_id");
  ALTER TABLE "companies" DROP COLUMN "impact_show";
  ALTER TABLE "companies" DROP COLUMN "impact_featured";
  ALTER TABLE "companies" DROP COLUMN "impact_order";
  ALTER TABLE "companies" DROP COLUMN "impact_sector_label";
  ALTER TABLE "companies" DROP COLUMN "impact_stage";
  ALTER TABLE "companies" DROP COLUMN "impact_period";
  ALTER TABLE "companies" DROP COLUMN "impact_tagline";
  ALTER TABLE "companies" DROP COLUMN "impact_image_id";
  ALTER TABLE "companies" DROP COLUMN "impact_closer_value";
  ALTER TABLE "companies" DROP COLUMN "impact_closer_text";
  ALTER TABLE "companies" DROP COLUMN "impact_evidence";
  ALTER TABLE "companies" DROP COLUMN "impact_sources";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_show";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_featured";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_order";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_sector_label";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_stage";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_period";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_tagline";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_image_id";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_closer_value";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_closer_text";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_evidence";
  ALTER TABLE "_companies_v" DROP COLUMN "version_impact_sources";
  ALTER TABLE "impact_page" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "hero_headline";
  ALTER TABLE "impact_page" DROP COLUMN "hero_statement";
  ALTER TABLE "impact_page" DROP COLUMN "hero_intro";
  ALTER TABLE "impact_page" DROP COLUMN "hero_primary_label";
  ALTER TABLE "impact_page" DROP COLUMN "hero_secondary_label";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_headline";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_intro";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_status";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_coverage_title";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_coverage_text";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_coverage_note";
  ALTER TABLE "impact_page" DROP COLUMN "outcomes_footnote";
  ALTER TABLE "impact_page" DROP COLUMN "footprint_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "footprint_headline";
  ALTER TABLE "impact_page" DROP COLUMN "footprint_intro";
  ALTER TABLE "impact_page" DROP COLUMN "footprint_card_text";
  ALTER TABLE "impact_page" DROP COLUMN "footprint_footnote";
  ALTER TABLE "impact_page" DROP COLUMN "sdgs_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "sdgs_headline";
  ALTER TABLE "impact_page" DROP COLUMN "sdgs_intro";
  ALTER TABLE "impact_page" DROP COLUMN "sdgs_note";
  ALTER TABLE "impact_page" DROP COLUMN "carousel_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "carousel_headline";
  ALTER TABLE "impact_page" DROP COLUMN "carousel_intro";
  ALTER TABLE "impact_page" DROP COLUMN "carousel_footnote";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_headline";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_intro";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_case_label";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_case_title";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_case_source";
  ALTER TABLE "impact_page" DROP COLUMN "contribution_footnote";
  ALTER TABLE "impact_page" DROP COLUMN "women_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "women_headline";
  ALTER TABLE "impact_page" DROP COLUMN "women_intro";
  ALTER TABLE "impact_page" DROP COLUMN "women_footnote";
  ALTER TABLE "impact_page" DROP COLUMN "perspectives_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "perspectives_headline";
  ALTER TABLE "impact_page" DROP COLUMN "perspectives_intro";
  ALTER TABLE "impact_page" DROP COLUMN "perspectives_footnote";
  ALTER TABLE "impact_page" DROP COLUMN "measurement_eyebrow";
  ALTER TABLE "impact_page" DROP COLUMN "measurement_headline";
  ALTER TABLE "impact_page" DROP COLUMN "measurement_intro";
  ALTER TABLE "impact_page" DROP COLUMN "measurement_process_title";
  DROP TYPE "public"."enum_impact_page_footprint_countries_presence";`)
}
