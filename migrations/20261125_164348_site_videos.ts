import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_v_version_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  ALTER TABLE "site_videos" ADD CONSTRAINT "site_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_videos" ADD CONSTRAINT "_site_v_version_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_videos_order_idx" ON "site_videos" USING btree ("_order");
  CREATE INDEX "site_videos_parent_id_idx" ON "site_videos" USING btree ("_parent_id");
  CREATE INDEX "_site_v_version_videos_order_idx" ON "_site_v_version_videos" USING btree ("_order");
  CREATE INDEX "_site_v_version_videos_parent_id_idx" ON "_site_v_version_videos" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_videos" CASCADE;
  DROP TABLE "_site_v_version_videos" CASCADE;`)
}
