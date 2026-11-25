import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_companies_fund" ADD VALUE 'pre-fund' BEFORE 'fund-1';
  ALTER TYPE "public"."enum__companies_v_version_fund" ADD VALUE 'pre-fund' BEFORE 'fund-1';
  CREATE TABLE "team_logo_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "_team_v_version_logo_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE text;
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'investments'::text;
  DROP TYPE "public"."enum_team_group";
  CREATE TYPE "public"."enum_team_group" AS ENUM('founding', 'advisors', 'investments', 'investor-relations', 'portfolio-investments', 'finance', 'hr', 'marketing', 'executive');
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'investments'::"public"."enum_team_group";
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE "public"."enum_team_group" USING "group"::"public"."enum_team_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE text;
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'investments'::text;
  DROP TYPE "public"."enum__team_v_version_group";
  CREATE TYPE "public"."enum__team_v_version_group" AS ENUM('founding', 'advisors', 'investments', 'investor-relations', 'portfolio-investments', 'finance', 'hr', 'marketing', 'executive');
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'investments'::"public"."enum__team_v_version_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE "public"."enum__team_v_version_group" USING "version_group"::"public"."enum__team_v_version_group";
  ALTER TABLE "team_logo_rows" ADD CONSTRAINT "team_logo_rows_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_logo_rows" ADD CONSTRAINT "team_logo_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_v_version_logo_rows" ADD CONSTRAINT "_team_v_version_logo_rows_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v_version_logo_rows" ADD CONSTRAINT "_team_v_version_logo_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "team_logo_rows_order_idx" ON "team_logo_rows" USING btree ("_order");
  CREATE INDEX "team_logo_rows_parent_id_idx" ON "team_logo_rows" USING btree ("_parent_id");
  CREATE INDEX "team_logo_rows_image_idx" ON "team_logo_rows" USING btree ("image_id");
  CREATE INDEX "_team_v_version_logo_rows_order_idx" ON "_team_v_version_logo_rows" USING btree ("_order");
  CREATE INDEX "_team_v_version_logo_rows_parent_id_idx" ON "_team_v_version_logo_rows" USING btree ("_parent_id");
  CREATE INDEX "_team_v_version_logo_rows_image_idx" ON "_team_v_version_logo_rows" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "team_logo_rows" CASCADE;
  DROP TABLE "_team_v_version_logo_rows" CASCADE;
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DATA TYPE text;
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DEFAULT 'fund-1'::text;
  DROP TYPE "public"."enum_companies_fund";
  CREATE TYPE "public"."enum_companies_fund" AS ENUM('fund-1', 'fund-2');
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DEFAULT 'fund-1'::"public"."enum_companies_fund";
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DATA TYPE "public"."enum_companies_fund" USING "fund"::"public"."enum_companies_fund";
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DATA TYPE text;
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DEFAULT 'fund-1'::text;
  DROP TYPE "public"."enum__companies_v_version_fund";
  CREATE TYPE "public"."enum__companies_v_version_fund" AS ENUM('fund-1', 'fund-2');
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DEFAULT 'fund-1'::"public"."enum__companies_v_version_fund";
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DATA TYPE "public"."enum__companies_v_version_fund" USING "version_fund"::"public"."enum__companies_v_version_fund";
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
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE "public"."enum__team_v_version_group" USING "version_group"::"public"."enum__team_v_version_group";`)
}
