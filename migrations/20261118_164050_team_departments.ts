import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "team_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_team_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE text;
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'investments'::text;
  DROP TYPE "public"."enum_team_group";
  CREATE TYPE "public"."enum_team_group" AS ENUM('founding', 'investments', 'investor-relations', 'capital-formation', 'portfolio-investments', 'marketing', 'finance', 'hr', 'advisors', 'executive');
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'investments'::"public"."enum_team_group";
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE "public"."enum_team_group" USING "group"::"public"."enum_team_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE text;
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'investments'::text;
  DROP TYPE "public"."enum__team_v_version_group";
  CREATE TYPE "public"."enum__team_v_version_group" AS ENUM('founding', 'investments', 'investor-relations', 'capital-formation', 'portfolio-investments', 'marketing', 'finance', 'hr', 'advisors', 'executive');
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'investments'::"public"."enum__team_v_version_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE "public"."enum__team_v_version_group" USING "version_group"::"public"."enum__team_v_version_group";
  ALTER TABLE "team_highlights" ADD CONSTRAINT "team_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_v_version_highlights" ADD CONSTRAINT "_team_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "team_highlights_order_idx" ON "team_highlights" USING btree ("_order");
  CREATE INDEX "team_highlights_parent_id_idx" ON "team_highlights" USING btree ("_parent_id");
  CREATE INDEX "_team_v_version_highlights_order_idx" ON "_team_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_team_v_version_highlights_parent_id_idx" ON "_team_v_version_highlights" USING btree ("_parent_id");`)

  // Data: move people from the old catch-all "Executive Team" into their teams (team
  // sheet, Nov 2026). Anyone not listed stays "executive" until sorted in the CMS.
  await db.execute(sql`
  UPDATE "team" SET "group" = 'investments' WHERE "group" = 'executive' AND "name" IN ('Gaurav Patil', 'Vishvas Shah', 'Vaibhav Shrivastav', 'Riddhim Sehgal', 'Bhoomika Jain');
  UPDATE "_team_v" SET "version_group" = 'investments' WHERE "version_group" = 'executive' AND "version_name" IN ('Gaurav Patil', 'Vishvas Shah', 'Vaibhav Shrivastav', 'Riddhim Sehgal', 'Bhoomika Jain');
  UPDATE "team" SET "group" = 'investor-relations' WHERE "group" = 'executive' AND "name" IN ('Stenson Sajee', 'Dristi Kedia');
  UPDATE "_team_v" SET "version_group" = 'investor-relations' WHERE "version_group" = 'executive' AND "version_name" IN ('Stenson Sajee', 'Dristi Kedia');
  UPDATE "team" SET "group" = 'capital-formation' WHERE "group" = 'executive' AND "name" IN ('Venkata Krishna', 'Leelesh Gholkar');
  UPDATE "_team_v" SET "version_group" = 'capital-formation' WHERE "version_group" = 'executive' AND "version_name" IN ('Venkata Krishna', 'Leelesh Gholkar');
  UPDATE "team" SET "group" = 'portfolio-investments' WHERE "group" = 'executive' AND "name" IN ('Yashodhara Bakliwal', 'Anavi Panjwani');
  UPDATE "_team_v" SET "version_group" = 'portfolio-investments' WHERE "version_group" = 'executive' AND "version_name" IN ('Yashodhara Bakliwal', 'Anavi Panjwani');
  UPDATE "team" SET "group" = 'marketing' WHERE "group" = 'executive' AND "name" IN ('Aditi Manjunath', 'Navi Sharma');
  UPDATE "_team_v" SET "version_group" = 'marketing' WHERE "version_group" = 'executive' AND "version_name" IN ('Aditi Manjunath', 'Navi Sharma');
  UPDATE "team" SET "group" = 'finance' WHERE "group" = 'executive' AND "name" IN ('Bharat Takhtani', 'Harsh Bihani', 'Simran Panwar', 'Usman Pasha');
  UPDATE "_team_v" SET "version_group" = 'finance' WHERE "version_group" = 'executive' AND "version_name" IN ('Bharat Takhtani', 'Harsh Bihani', 'Simran Panwar', 'Usman Pasha');
  UPDATE "team" SET "group" = 'hr' WHERE "group" = 'executive' AND "name" IN ('Anchit Donthi', 'Ashrita Ashwin', 'Saloni Pattnaik', 'Anjali Devakumar', 'Padmashree P');
  UPDATE "_team_v" SET "version_group" = 'hr' WHERE "version_group" = 'executive' AND "version_name" IN ('Anchit Donthi', 'Ashrita Ashwin', 'Saloni Pattnaik', 'Anjali Devakumar', 'Padmashree P');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The old enum only has founding / executive / advisors: fold the new teams back first.
  await db.execute(sql`
  UPDATE "team" SET "group" = 'executive' WHERE "group" NOT IN ('founding', 'executive', 'advisors');
  UPDATE "_team_v" SET "version_group" = 'executive' WHERE "version_group" NOT IN ('founding', 'executive', 'advisors');`)
  await db.execute(sql`
   ALTER TABLE "team_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_v_version_highlights" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "team_highlights" CASCADE;
  DROP TABLE "_team_v_version_highlights" CASCADE;
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE text;
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'executive'::text;
  DROP TYPE "public"."enum_team_group";
  CREATE TYPE "public"."enum_team_group" AS ENUM('founding', 'executive', 'advisors');
  ALTER TABLE "team" ALTER COLUMN "group" SET DEFAULT 'executive'::"public"."enum_team_group";
  ALTER TABLE "team" ALTER COLUMN "group" SET DATA TYPE "public"."enum_team_group" USING "group"::"public"."enum_team_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE text;
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'executive'::text;
  DROP TYPE "public"."enum__team_v_version_group";
  CREATE TYPE "public"."enum__team_v_version_group" AS ENUM('founding', 'executive', 'advisors');
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DEFAULT 'executive'::"public"."enum__team_v_version_group";
  ALTER TABLE "_team_v" ALTER COLUMN "version_group" SET DATA TYPE "public"."enum__team_v_version_group" USING "version_group"::"public"."enum__team_v_version_group";`)
}
