import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_page_pillars_icon" AS ENUM('engineering', 'research', 'india', 'capital', 'long-term', 'partnership', 'network', 'speed', 'industry', 'energy', 'growth', 'focus');
  CREATE TYPE "public"."enum__home_page_v_version_pillars_icon" AS ENUM('engineering', 'research', 'india', 'capital', 'long-term', 'partnership', 'network', 'speed', 'industry', 'energy', 'growth', 'focus');
  CREATE TABLE "home_page_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" "enum_home_page_pillars_icon" DEFAULT 'engineering' NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"positioning" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_page_v_version_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" "enum__home_page_v_version_pillars_icon" DEFAULT 'engineering' NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_positioning" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "companies" ADD COLUMN "cover_image_id" integer;
  ALTER TABLE "_companies_v" ADD COLUMN "version_cover_image_id" integer;
  ALTER TABLE "page_seo" ADD COLUMN "funds_title" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "funds_description" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "funds_image_id" integer;
  ALTER TABLE "fund_metrics_items" ADD COLUMN "show_on_home" boolean DEFAULT false;
  ALTER TABLE "_fund_metrics_v_version_items" ADD COLUMN "show_on_home" boolean DEFAULT false;
  ALTER TABLE "home_page_pillars" ADD CONSTRAINT "home_page_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_faq" ADD CONSTRAINT "home_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_pillars" ADD CONSTRAINT "_home_page_v_version_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_faq" ADD CONSTRAINT "_home_page_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_pillars_order_idx" ON "home_page_pillars" USING btree ("_order");
  CREATE INDEX "home_page_pillars_parent_id_idx" ON "home_page_pillars" USING btree ("_parent_id");
  CREATE INDEX "home_page_faq_order_idx" ON "home_page_faq" USING btree ("_order");
  CREATE INDEX "home_page_faq_parent_id_idx" ON "home_page_faq" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_pillars_order_idx" ON "_home_page_v_version_pillars" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_pillars_parent_id_idx" ON "_home_page_v_version_pillars" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_faq_order_idx" ON "_home_page_v_version_faq" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_faq_parent_id_idx" ON "_home_page_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  ALTER TABLE "companies" ADD CONSTRAINT "companies_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_funds_image_id_media_id_fk" FOREIGN KEY ("funds_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "companies_cover_image_idx" ON "companies" USING btree ("cover_image_id");
  CREATE INDEX "_companies_v_version_version_cover_image_idx" ON "_companies_v" USING btree ("version_cover_image_id");
  CREATE INDEX "page_seo_funds_funds_image_idx" ON "page_seo" USING btree ("funds_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_version_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_page_pillars" CASCADE;
  DROP TABLE "home_page_faq" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "_home_page_v_version_pillars" CASCADE;
  DROP TABLE "_home_page_v_version_faq" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  ALTER TABLE "companies" DROP CONSTRAINT "companies_cover_image_id_media_id_fk";
  
  ALTER TABLE "_companies_v" DROP CONSTRAINT "_companies_v_version_cover_image_id_media_id_fk";
  
  ALTER TABLE "page_seo" DROP CONSTRAINT "page_seo_funds_image_id_media_id_fk";
  
  DROP INDEX "companies_cover_image_idx";
  DROP INDEX "_companies_v_version_version_cover_image_idx";
  DROP INDEX "page_seo_funds_funds_image_idx";
  ALTER TABLE "companies" DROP COLUMN "cover_image_id";
  ALTER TABLE "_companies_v" DROP COLUMN "version_cover_image_id";
  ALTER TABLE "page_seo" DROP COLUMN "funds_title";
  ALTER TABLE "page_seo" DROP COLUMN "funds_description";
  ALTER TABLE "page_seo" DROP COLUMN "funds_image_id";
  ALTER TABLE "fund_metrics_items" DROP COLUMN "show_on_home";
  ALTER TABLE "_fund_metrics_v_version_items" DROP COLUMN "show_on_home";
  DROP TYPE "public"."enum_home_page_pillars_icon";
  DROP TYPE "public"."enum__home_page_v_version_pillars_icon";`)
}
