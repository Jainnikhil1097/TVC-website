import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "gift_city_page_disclosures_funds" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"registration_number" varchar,
  	"category" varchar
  );
  
  CREATE TABLE "gift_city_page_disclosures_service_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar NOT NULL,
  	"name" varchar,
  	"address" varchar,
  	"telephone" varchar
  );
  
  CREATE TABLE "gift_city_page_disclosures_grievance_complaints" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quarter_ended" varchar NOT NULL,
  	"pending_start" varchar,
  	"received" varchar,
  	"disposed" varchar,
  	"pending_end" varchar
  );
  
  CREATE TABLE "gift_city_page_disclosures_officers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"designation" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"telephone" varchar
  );
  
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_show" boolean DEFAULT true;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_as_of" timestamp(3) with time zone;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_fme_name" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_fme_legal_form" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_fme_category" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_fme_registration_number" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_fme_registration_date" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_contact_registered_office" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_contact_correspondence" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_contact_telephone" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_contact_email" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_grievance_text" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_grievance_policy_id" integer;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_grievance_complaints_note" varchar DEFAULT 'Not applicable';
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_actions_action" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_actions_status" varchar;
  ALTER TABLE "gift_city_page" ADD COLUMN "disclosures_disclaimer" varchar;
  ALTER TABLE "gift_city_page_disclosures_funds" ADD CONSTRAINT "gift_city_page_disclosures_funds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_city_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_city_page_disclosures_service_providers" ADD CONSTRAINT "gift_city_page_disclosures_service_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_city_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_city_page_disclosures_grievance_complaints" ADD CONSTRAINT "gift_city_page_disclosures_grievance_complaints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_city_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_city_page_disclosures_officers" ADD CONSTRAINT "gift_city_page_disclosures_officers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_city_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "gift_city_page_disclosures_funds_order_idx" ON "gift_city_page_disclosures_funds" USING btree ("_order");
  CREATE INDEX "gift_city_page_disclosures_funds_parent_id_idx" ON "gift_city_page_disclosures_funds" USING btree ("_parent_id");
  CREATE INDEX "gift_city_page_disclosures_service_providers_order_idx" ON "gift_city_page_disclosures_service_providers" USING btree ("_order");
  CREATE INDEX "gift_city_page_disclosures_service_providers_parent_id_idx" ON "gift_city_page_disclosures_service_providers" USING btree ("_parent_id");
  CREATE INDEX "gift_city_page_disclosures_grievance_complaints_order_idx" ON "gift_city_page_disclosures_grievance_complaints" USING btree ("_order");
  CREATE INDEX "gift_city_page_disclosures_grievance_complaints_parent_id_idx" ON "gift_city_page_disclosures_grievance_complaints" USING btree ("_parent_id");
  CREATE INDEX "gift_city_page_disclosures_officers_order_idx" ON "gift_city_page_disclosures_officers" USING btree ("_order");
  CREATE INDEX "gift_city_page_disclosures_officers_parent_id_idx" ON "gift_city_page_disclosures_officers" USING btree ("_parent_id");
  ALTER TABLE "gift_city_page" ADD CONSTRAINT "gift_city_page_disclosures_grievance_policy_id_media_id_fk" FOREIGN KEY ("disclosures_grievance_policy_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "gift_city_page_disclosures_grievance_disclosures_grievan_idx" ON "gift_city_page" USING btree ("disclosures_grievance_policy_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "gift_city_page_disclosures_funds" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gift_city_page_disclosures_service_providers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gift_city_page_disclosures_grievance_complaints" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gift_city_page_disclosures_officers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "gift_city_page_disclosures_funds" CASCADE;
  DROP TABLE "gift_city_page_disclosures_service_providers" CASCADE;
  DROP TABLE "gift_city_page_disclosures_grievance_complaints" CASCADE;
  DROP TABLE "gift_city_page_disclosures_officers" CASCADE;
  ALTER TABLE "gift_city_page" DROP CONSTRAINT "gift_city_page_disclosures_grievance_policy_id_media_id_fk";
  
  DROP INDEX "gift_city_page_disclosures_grievance_disclosures_grievan_idx";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_show";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_as_of";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_fme_name";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_fme_legal_form";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_fme_category";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_fme_registration_number";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_fme_registration_date";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_contact_registered_office";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_contact_correspondence";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_contact_telephone";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_contact_email";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_grievance_text";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_grievance_policy_id";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_grievance_complaints_note";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_actions_action";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_actions_status";
  ALTER TABLE "gift_city_page" DROP COLUMN "disclosures_disclaimer";`)
}
