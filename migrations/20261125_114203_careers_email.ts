import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" ADD COLUMN "careers_email" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_careers_email" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" DROP COLUMN "careers_email";
  ALTER TABLE "_site_v" DROP COLUMN "version_careers_email";`)
}
