import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_home_page_pillars_icon" ADD VALUE 'talent';
  ALTER TYPE "public"."enum_home_page_pillars_icon" ADD VALUE 'grants';
  ALTER TYPE "public"."enum_home_page_pillars_icon" ADD VALUE 'communications';
  ALTER TYPE "public"."enum_home_page_pillars_icon" ADD VALUE 'events';
  ALTER TYPE "public"."enum__home_page_v_version_pillars_icon" ADD VALUE 'talent';
  ALTER TYPE "public"."enum__home_page_v_version_pillars_icon" ADD VALUE 'grants';
  ALTER TYPE "public"."enum__home_page_v_version_pillars_icon" ADD VALUE 'communications';
  ALTER TYPE "public"."enum__home_page_v_version_pillars_icon" ADD VALUE 'events';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_pillars" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "home_page_pillars" ALTER COLUMN "icon" SET DEFAULT 'engineering'::text;
  DROP TYPE "public"."enum_home_page_pillars_icon";
  CREATE TYPE "public"."enum_home_page_pillars_icon" AS ENUM('engineering', 'research', 'india', 'capital', 'long-term', 'partnership', 'network', 'speed', 'industry', 'energy', 'growth', 'focus');
  ALTER TABLE "home_page_pillars" ALTER COLUMN "icon" SET DEFAULT 'engineering'::"public"."enum_home_page_pillars_icon";
  ALTER TABLE "home_page_pillars" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_home_page_pillars_icon" USING "icon"::"public"."enum_home_page_pillars_icon";
  ALTER TABLE "_home_page_v_version_pillars" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "_home_page_v_version_pillars" ALTER COLUMN "icon" SET DEFAULT 'engineering'::text;
  DROP TYPE "public"."enum__home_page_v_version_pillars_icon";
  CREATE TYPE "public"."enum__home_page_v_version_pillars_icon" AS ENUM('engineering', 'research', 'india', 'capital', 'long-term', 'partnership', 'network', 'speed', 'industry', 'energy', 'growth', 'focus');
  ALTER TABLE "_home_page_v_version_pillars" ALTER COLUMN "icon" SET DEFAULT 'engineering'::"public"."enum__home_page_v_version_pillars_icon";
  ALTER TABLE "_home_page_v_version_pillars" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__home_page_v_version_pillars_icon" USING "icon"::"public"."enum__home_page_v_version_pillars_icon";`)
}
