import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "about_page_group_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  ALTER TABLE "site" ADD COLUMN "cheque_usd" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_cheque_usd" varchar;
  ALTER TABLE "home_page" ADD COLUMN "about_photo_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "about_photo_caption" varchar;
  ALTER TABLE "_home_page_v" ADD COLUMN "version_about_photo_id" integer;
  ALTER TABLE "_home_page_v" ADD COLUMN "version_about_photo_caption" varchar;
  ALTER TABLE "about_page_group_photos" ADD CONSTRAINT "about_page_group_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_group_photos" ADD CONSTRAINT "about_page_group_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "about_page_group_photos_order_idx" ON "about_page_group_photos" USING btree ("_order");
  CREATE INDEX "about_page_group_photos_parent_id_idx" ON "about_page_group_photos" USING btree ("_parent_id");
  CREATE INDEX "about_page_group_photos_image_idx" ON "about_page_group_photos" USING btree ("image_id");
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_about_photo_id_media_id_fk" FOREIGN KEY ("about_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_about_photo_id_media_id_fk" FOREIGN KEY ("version_about_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_page_about_photo_idx" ON "home_page" USING btree ("about_photo_id");
  CREATE INDEX "_home_page_v_version_version_about_photo_idx" ON "_home_page_v" USING btree ("version_about_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about_page_group_photos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "about_page_group_photos" CASCADE;
  ALTER TABLE "home_page" DROP CONSTRAINT "home_page_about_photo_id_media_id_fk";
  
  ALTER TABLE "_home_page_v" DROP CONSTRAINT "_home_page_v_version_about_photo_id_media_id_fk";
  
  DROP INDEX "home_page_about_photo_idx";
  DROP INDEX "_home_page_v_version_version_about_photo_idx";
  ALTER TABLE "site" DROP COLUMN "cheque_usd";
  ALTER TABLE "_site_v" DROP COLUMN "version_cheque_usd";
  ALTER TABLE "home_page" DROP COLUMN "about_photo_id";
  ALTER TABLE "home_page" DROP COLUMN "about_photo_caption";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_about_photo_id";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_about_photo_caption";`)
}
