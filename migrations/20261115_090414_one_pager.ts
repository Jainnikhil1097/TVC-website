import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "companies_callouts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar,
  	"x" numeric DEFAULT 50,
  	"y" numeric DEFAULT 50
  );
  
  CREATE TABLE "companies_traction" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar
  );
  
  CREATE TABLE "_companies_v_version_callouts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar,
  	"x" numeric DEFAULT 50,
  	"y" numeric DEFAULT 50,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_companies_v_version_traction" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"point" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "companies" ADD COLUMN "product_image_id" integer;
  ALTER TABLE "companies" ADD COLUMN "proof_value" varchar;
  ALTER TABLE "companies" ADD COLUMN "proof_label" varchar;
  ALTER TABLE "companies" ADD COLUMN "deployment" varchar;
  ALTER TABLE "companies" ADD COLUMN "customers" varchar;
  ALTER TABLE "companies" ADD COLUMN "market_gap" varchar;
  ALTER TABLE "companies" ADD COLUMN "breakthrough" varchar;
  ALTER TABLE "companies" ADD COLUMN "market_opportunity" varchar;
  ALTER TABLE "companies" ADD COLUMN "founder_track_record" varchar;
  ALTER TABLE "companies" ADD COLUMN "why_they_win" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_product_image_id" integer;
  ALTER TABLE "_companies_v" ADD COLUMN "version_proof_value" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_proof_label" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_deployment" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_customers" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_market_gap" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_breakthrough" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_market_opportunity" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_founder_track_record" varchar;
  ALTER TABLE "_companies_v" ADD COLUMN "version_why_they_win" varchar;
  ALTER TABLE "companies_callouts" ADD CONSTRAINT "companies_callouts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_traction" ADD CONSTRAINT "companies_traction_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_version_callouts" ADD CONSTRAINT "_companies_v_version_callouts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v_version_traction" ADD CONSTRAINT "_companies_v_version_traction_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "companies_callouts_order_idx" ON "companies_callouts" USING btree ("_order");
  CREATE INDEX "companies_callouts_parent_id_idx" ON "companies_callouts" USING btree ("_parent_id");
  CREATE INDEX "companies_traction_order_idx" ON "companies_traction" USING btree ("_order");
  CREATE INDEX "companies_traction_parent_id_idx" ON "companies_traction" USING btree ("_parent_id");
  CREATE INDEX "_companies_v_version_callouts_order_idx" ON "_companies_v_version_callouts" USING btree ("_order");
  CREATE INDEX "_companies_v_version_callouts_parent_id_idx" ON "_companies_v_version_callouts" USING btree ("_parent_id");
  CREATE INDEX "_companies_v_version_traction_order_idx" ON "_companies_v_version_traction" USING btree ("_order");
  CREATE INDEX "_companies_v_version_traction_parent_id_idx" ON "_companies_v_version_traction" USING btree ("_parent_id");
  ALTER TABLE "companies" ADD CONSTRAINT "companies_product_image_id_media_id_fk" FOREIGN KEY ("product_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_product_image_id_media_id_fk" FOREIGN KEY ("version_product_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "companies_product_image_idx" ON "companies" USING btree ("product_image_id");
  CREATE INDEX "_companies_v_version_version_product_image_idx" ON "_companies_v" USING btree ("version_product_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "companies_callouts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "companies_traction" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_companies_v_version_callouts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_companies_v_version_traction" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "companies_callouts" CASCADE;
  DROP TABLE "companies_traction" CASCADE;
  DROP TABLE "_companies_v_version_callouts" CASCADE;
  DROP TABLE "_companies_v_version_traction" CASCADE;
  ALTER TABLE "companies" DROP CONSTRAINT "companies_product_image_id_media_id_fk";
  
  ALTER TABLE "_companies_v" DROP CONSTRAINT "_companies_v_version_product_image_id_media_id_fk";
  
  DROP INDEX "companies_product_image_idx";
  DROP INDEX "_companies_v_version_version_product_image_idx";
  ALTER TABLE "companies" DROP COLUMN "product_image_id";
  ALTER TABLE "companies" DROP COLUMN "proof_value";
  ALTER TABLE "companies" DROP COLUMN "proof_label";
  ALTER TABLE "companies" DROP COLUMN "deployment";
  ALTER TABLE "companies" DROP COLUMN "customers";
  ALTER TABLE "companies" DROP COLUMN "market_gap";
  ALTER TABLE "companies" DROP COLUMN "breakthrough";
  ALTER TABLE "companies" DROP COLUMN "market_opportunity";
  ALTER TABLE "companies" DROP COLUMN "founder_track_record";
  ALTER TABLE "companies" DROP COLUMN "why_they_win";
  ALTER TABLE "_companies_v" DROP COLUMN "version_product_image_id";
  ALTER TABLE "_companies_v" DROP COLUMN "version_proof_value";
  ALTER TABLE "_companies_v" DROP COLUMN "version_proof_label";
  ALTER TABLE "_companies_v" DROP COLUMN "version_deployment";
  ALTER TABLE "_companies_v" DROP COLUMN "version_customers";
  ALTER TABLE "_companies_v" DROP COLUMN "version_market_gap";
  ALTER TABLE "_companies_v" DROP COLUMN "version_breakthrough";
  ALTER TABLE "_companies_v" DROP COLUMN "version_market_opportunity";
  ALTER TABLE "_companies_v" DROP COLUMN "version_founder_track_record";
  ALTER TABLE "_companies_v" DROP COLUMN "version_why_they_win";`)
}
