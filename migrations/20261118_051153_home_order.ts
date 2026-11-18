import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "companies" ADD COLUMN "home_order" numeric;
  ALTER TABLE "_companies_v" ADD COLUMN "version_home_order" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "companies" DROP COLUMN "home_order";
  ALTER TABLE "_companies_v" DROP COLUMN "version_home_order";`)
}
