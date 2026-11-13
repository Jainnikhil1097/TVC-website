import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_jobs_fk";
  
  ALTER TABLE "page_seo" DROP CONSTRAINT "page_seo_careers_image_id_media_id_fk";
  
  ALTER TABLE "submissions" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_submissions_type";
  CREATE TYPE "public"."enum_submissions_type" AS ENUM('startup', 'investor', 'partner');
  ALTER TABLE "submissions" ALTER COLUMN "type" SET DATA TYPE "public"."enum_submissions_type" USING "type"::"public"."enum_submissions_type";
  DROP INDEX "payload_locked_documents_rels_jobs_id_idx";
  DROP INDEX "page_seo_careers_careers_image_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "jobs_id";
  ALTER TABLE "page_seo" DROP COLUMN "careers_title";
  ALTER TABLE "page_seo" DROP COLUMN "careers_description";
  ALTER TABLE "page_seo" DROP COLUMN "careers_image_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_submissions_type" ADD VALUE 'careers';
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"company_id" integer,
  	"function" varchar,
  	"experience" varchar,
  	"location" varchar DEFAULT 'Bengaluru · On-site',
  	"apply_url" varchar,
  	"open" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_company_id" integer,
  	"version_function" varchar,
  	"version_experience" varchar,
  	"version_location" varchar DEFAULT 'Bengaluru · On-site',
  	"version_apply_url" varchar,
  	"version_open" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "page_seo" ADD COLUMN "careers_title" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "careers_description" varchar;
  ALTER TABLE "page_seo" ADD COLUMN "careers_image_id" integer;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_company_id_companies_id_fk" FOREIGN KEY ("version_company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "jobs_company_idx" ON "jobs" USING btree ("company_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_company_idx" ON "_jobs_v" USING btree ("version_company_id");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_careers_image_id_media_id_fk" FOREIGN KEY ("careers_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "page_seo_careers_careers_image_idx" ON "page_seo" USING btree ("careers_image_id");`)
}
