import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // "Pre Fund" is no longer an option: any company still set to it moves to Fund I first.
  await db.execute(sql`
  UPDATE "companies" SET "fund" = 'fund-1' WHERE "fund" = 'pre-fund';
  UPDATE "_companies_v" SET "version_fund" = 'fund-1' WHERE "version_fund" = 'pre-fund';
   ALTER TABLE "companies" ALTER COLUMN "fund" SET DATA TYPE text;
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DEFAULT 'fund-1'::text;
  DROP TYPE "public"."enum_companies_fund";
  CREATE TYPE "public"."enum_companies_fund" AS ENUM('fund-1', 'fund-2');
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DEFAULT 'fund-1'::"public"."enum_companies_fund";
  ALTER TABLE "companies" ALTER COLUMN "fund" SET DATA TYPE "public"."enum_companies_fund" USING "fund"::"public"."enum_companies_fund";
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DATA TYPE text;
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DEFAULT 'fund-1'::text;
  DROP TYPE "public"."enum__companies_v_version_fund";
  CREATE TYPE "public"."enum__companies_v_version_fund" AS ENUM('fund-1', 'fund-2');
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DEFAULT 'fund-1'::"public"."enum__companies_v_version_fund";
  ALTER TABLE "_companies_v" ALTER COLUMN "version_fund" SET DATA TYPE "public"."enum__companies_v_version_fund" USING "version_fund"::"public"."enum__companies_v_version_fund";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_companies_fund" ADD VALUE 'pre-fund' BEFORE 'fund-1';
  ALTER TYPE "public"."enum__companies_v_version_fund" ADD VALUE 'pre-fund' BEFORE 'fund-1';`)
}
