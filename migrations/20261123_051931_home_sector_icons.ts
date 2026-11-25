import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_sectors_sectors_icon" AS ENUM('mobility', 'industrial', 'built', 'semiconductors', 'electronics', 'renewables', 'storage', 'fuels', 'general');
  ALTER TABLE "home_sectors_sectors" ADD COLUMN "icon" "enum_home_sectors_sectors_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_sectors_sectors" DROP COLUMN "icon";
  DROP TYPE "public"."enum_home_sectors_sectors_icon";`)
}
