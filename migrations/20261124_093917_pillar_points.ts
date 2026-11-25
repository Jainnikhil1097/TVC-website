import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_pillars_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "_home_page_v_version_pillars_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "home_page_pillars" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "_home_page_v_version_pillars" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "home_page_pillars_points" ADD CONSTRAINT "home_page_pillars_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_pillars_points" ADD CONSTRAINT "_home_page_v_version_pillars_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_version_pillars"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_pillars_points_order_idx" ON "home_page_pillars_points" USING btree ("_order");
  CREATE INDEX "home_page_pillars_points_parent_id_idx" ON "home_page_pillars_points" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_pillars_points_order_idx" ON "_home_page_v_version_pillars_points" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_pillars_points_parent_id_idx" ON "_home_page_v_version_pillars_points" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_pillars_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_version_pillars_points" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_page_pillars_points" CASCADE;
  DROP TABLE "_home_page_v_version_pillars_points" CASCADE;
  ALTER TABLE "home_page_pillars" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "_home_page_v_version_pillars" ALTER COLUMN "text" SET NOT NULL;`)
}
