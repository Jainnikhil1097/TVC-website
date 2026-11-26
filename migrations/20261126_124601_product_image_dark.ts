import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "companies" ADD COLUMN "product_image_dark_id" integer;
  ALTER TABLE "_companies_v" ADD COLUMN "version_product_image_dark_id" integer;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_product_image_dark_id_media_id_fk" FOREIGN KEY ("product_image_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_product_image_dark_id_media_id_fk" FOREIGN KEY ("version_product_image_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "companies_product_image_dark_idx" ON "companies" USING btree ("product_image_dark_id");
  CREATE INDEX "_companies_v_version_version_product_image_dark_idx" ON "_companies_v" USING btree ("version_product_image_dark_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "companies" DROP CONSTRAINT "companies_product_image_dark_id_media_id_fk";
  
  ALTER TABLE "_companies_v" DROP CONSTRAINT "_companies_v_version_product_image_dark_id_media_id_fk";
  
  DROP INDEX "companies_product_image_dark_idx";
  DROP INDEX "_companies_v_version_version_product_image_dark_idx";
  ALTER TABLE "companies" DROP COLUMN "product_image_dark_id";
  ALTER TABLE "_companies_v" DROP COLUMN "version_product_image_dark_id";`)
}
