import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_companies_sector" AS ENUM('drone', 'industrial', 'platforms', 'utility-grid', 'renewables', 'hydrogen', 'mobility', 'data-centers');
  CREATE TYPE "public"."enum_companies_stage" AS ENUM('Pre-Seed', 'Seed', 'Pre-Series A', 'Series A', 'TBD');
  CREATE TYPE "public"."enum_companies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__companies_v_version_sector" AS ENUM('drone', 'industrial', 'platforms', 'utility-grid', 'renewables', 'hydrogen', 'mobility', 'data-centers');
  CREATE TYPE "public"."enum__companies_v_version_stage" AS ENUM('Pre-Seed', 'Seed', 'Pre-Series A', 'Series A', 'TBD');
  CREATE TYPE "public"."enum__companies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_team_group" AS ENUM('founding', 'executive', 'advisors');
  CREATE TYPE "public"."enum_team_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_v_version_group" AS ENUM('founding', 'executive', 'advisors');
  CREATE TYPE "public"."enum__team_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reports_sector" AS ENUM('drone', 'industrial', 'platforms', 'utility-grid', 'renewables', 'hydrogen', 'mobility', 'data-centers');
  CREATE TYPE "public"."enum__reports_v_version_sector" AS ENUM('drone', 'industrial', 'platforms', 'utility-grid', 'renewables', 'hydrogen', 'mobility', 'data-centers');
  CREATE TYPE "public"."enum_funds_status" AS ENUM('raising', 'investing', 'deployed', 'closed');
  CREATE TYPE "public"."enum__funds_v_version_status" AS ENUM('raising', 'investing', 'deployed', 'closed');
  CREATE TYPE "public"."enum_submissions_status" AS ENUM('new', 'reviewed', 'archived');
  CREATE TYPE "public"."enum_submissions_type" AS ENUM('startup', 'investor', 'partner', 'careers');
  CREATE TYPE "public"."enum_users_role" AS ENUM('editor', 'admin');
  CREATE TYPE "public"."enum_home_sectors_sectors_portfolio_sector" AS ENUM('drone', 'industrial', 'platforms', 'utility-grid', 'renewables', 'hydrogen', 'mobility', 'data-centers');
  CREATE TABLE "companies_founders" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"linkedin" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"summary" varchar,
  	"sector" "enum_companies_sector",
  	"stage" "enum_companies_stage",
  	"year_invested" numeric,
  	"website" varchar,
  	"logo_id" integer,
  	"why_we_invested" varchar,
  	"essay_url" varchar,
  	"video_url" varchar,
  	"status" "enum_companies_status" DEFAULT 'active',
  	"exit_year" numeric,
  	"exit_note" varchar,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"show_on_site" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_companies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_companies_v_version_founders" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"linkedin" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_companies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_summary" varchar,
  	"version_sector" "enum__companies_v_version_sector",
  	"version_stage" "enum__companies_v_version_stage",
  	"version_year_invested" numeric,
  	"version_website" varchar,
  	"version_logo_id" integer,
  	"version_why_we_invested" varchar,
  	"version_essay_url" varchar,
  	"version_video_url" varchar,
  	"version_status" "enum__companies_v_version_status" DEFAULT 'active',
  	"version_exit_year" numeric,
  	"version_exit_note" varchar,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_show_on_site" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__companies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"group" "enum_team_group" DEFAULT 'executive',
  	"photo_id" integer,
  	"linkedin" varchar,
  	"bio" varchar,
  	"show_on_site" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_team_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_title" varchar,
  	"version_group" "enum__team_v_version_group" DEFAULT 'executive',
  	"version_photo_id" integer,
  	"version_linkedin" varchar,
  	"version_bio" varchar,
  	"version_show_on_site" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_source" varchar NOT NULL,
  	"version_date" timestamp(3) with time zone NOT NULL,
  	"version_url" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"location" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_start_date" timestamp(3) with time zone NOT NULL,
  	"version_end_date" timestamp(3) with time zone,
  	"version_location" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_link" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"summary" varchar,
  	"cover_id" integer,
  	"file_id" integer,
  	"external_url" varchar,
  	"sector" "enum_reports_sector",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"companies_id" integer
  );
  
  CREATE TABLE "_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_date" timestamp(3) with time zone NOT NULL,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_file_id" integer,
  	"version_external_url" varchar,
  	"version_sector" "enum__reports_v_version_sector",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_reports_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"companies_id" integer
  );
  
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
  
  CREATE TABLE "funds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"size" varchar,
  	"status" "enum_funds_status" DEFAULT 'investing' NOT NULL,
  	"description" varchar,
  	"show_on_home" boolean DEFAULT false,
  	"sebi_category" varchar NOT NULL,
  	"sebi_registration" varchar NOT NULL,
  	"manager" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_funds_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_size" varchar,
  	"version_status" "enum__funds_v_version_status" DEFAULT 'investing' NOT NULL,
  	"version_description" varchar,
  	"version_show_on_home" boolean DEFAULT false,
  	"version_sebi_category" varchar NOT NULL,
  	"version_sebi_registration" varchar NOT NULL,
  	"version_manager" varchar NOT NULL,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_submissions_status" DEFAULT 'new',
  	"type" "enum_submissions_type" NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"company" varchar,
  	"message" varchar,
  	"sector" varchar,
  	"amount" varchar,
  	"valuation" varchar,
  	"file_name" varchar,
  	"file_size" numeric,
  	"file_path" varchar,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_portrait_url" varchar,
  	"sizes_portrait_width" numeric,
  	"sizes_portrait_height" numeric,
  	"sizes_portrait_mime_type" varchar,
  	"sizes_portrait_filesize" numeric,
  	"sizes_portrait_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"companies_id" integer,
  	"team_id" integer,
  	"news_id" integer,
  	"events_id" integer,
  	"reports_id" integer,
  	"jobs_id" integer,
  	"funds_id" integer,
  	"submissions_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_policies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"file_id" integer NOT NULL
  );
  
  CREATE TABLE "site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" varchar NOT NULL,
  	"hero" varchar NOT NULL,
  	"about" varchar NOT NULL,
  	"approach" varchar NOT NULL,
  	"thesis" varchar NOT NULL,
  	"stage" varchar NOT NULL,
  	"cheque" varchar NOT NULL,
  	"footer_headline" varchar NOT NULL,
  	"newsletter_blurb" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"map_url" varchar,
  	"investor_login_url" varchar,
  	"substack_url" varchar NOT NULL,
  	"youtube_url" varchar,
  	"youtube_channel_id" varchar,
  	"default_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_v_version_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_v_version_policies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"file_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_tagline" varchar NOT NULL,
  	"version_hero" varchar NOT NULL,
  	"version_about" varchar NOT NULL,
  	"version_approach" varchar NOT NULL,
  	"version_thesis" varchar NOT NULL,
  	"version_stage" varchar NOT NULL,
  	"version_cheque" varchar NOT NULL,
  	"version_footer_headline" varchar NOT NULL,
  	"version_newsletter_blurb" varchar NOT NULL,
  	"version_email" varchar NOT NULL,
  	"version_address" varchar NOT NULL,
  	"version_map_url" varchar,
  	"version_investor_login_url" varchar,
  	"version_substack_url" varchar NOT NULL,
  	"version_youtube_url" varchar,
  	"version_youtube_channel_id" varchar,
  	"version_default_share_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "announcement" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"message" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"home_title" varchar,
  	"home_description" varchar,
  	"home_image_id" integer,
  	"about_title" varchar,
  	"about_description" varchar,
  	"about_image_id" integer,
  	"portfolio_title" varchar,
  	"portfolio_description" varchar,
  	"portfolio_image_id" integer,
  	"perspectives_title" varchar,
  	"perspectives_description" varchar,
  	"perspectives_image_id" integer,
  	"impact_title" varchar,
  	"impact_description" varchar,
  	"impact_image_id" integer,
  	"gift_city_title" varchar,
  	"gift_city_description" varchar,
  	"gift_city_image_id" integer,
  	"careers_title" varchar,
  	"careers_description" varchar,
  	"careers_image_id" integer,
  	"contact_title" varchar,
  	"contact_description" varchar,
  	"contact_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_sectors_sectors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"line" varchar NOT NULL,
  	"portfolio_sector" "enum_home_sectors_sectors_portfolio_sector"
  );
  
  CREATE TABLE "home_sectors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "impact_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "impact_page_themes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "impact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "impact_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"companies_id" integer
  );
  
  CREATE TABLE "gift_city_page_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "gift_city_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"cta_label" varchar DEFAULT 'Investor enquiries',
  	"cta_href" varchar DEFAULT '/contact?type=investor',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "fund_metrics_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "fund_metrics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"as_of" timestamp(3) with time zone,
  	"disclaimer" varchar DEFAULT 'Past performance is not indicative of future results. Figures relate to Transition Venture Capital Fund I.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_fund_metrics_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_fund_metrics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_as_of" timestamp(3) with time zone,
  	"version_disclaimer" varchar DEFAULT 'Past performance is not indicative of future results. Figures relate to Transition Venture Capital Fund I.',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "companies_founders" ADD CONSTRAINT "companies_founders_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies_founders" ADD CONSTRAINT "companies_founders_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v_version_founders" ADD CONSTRAINT "_companies_v_version_founders_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v_version_founders" ADD CONSTRAINT "_companies_v_version_founders_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_companies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_parent_id_companies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_companies_v" ADD CONSTRAINT "_companies_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_parent_id_team_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_parent_id_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_company_id_companies_id_fk" FOREIGN KEY ("version_company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funds_v" ADD CONSTRAINT "_funds_v_parent_id_funds_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_socials" ADD CONSTRAINT "site_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_policies" ADD CONSTRAINT "site_policies_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_policies" ADD CONSTRAINT "site_policies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_default_share_image_id_media_id_fk" FOREIGN KEY ("default_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_v_version_socials" ADD CONSTRAINT "_site_v_version_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_policies" ADD CONSTRAINT "_site_v_version_policies_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_v_version_policies" ADD CONSTRAINT "_site_v_version_policies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v" ADD CONSTRAINT "_site_v_version_default_share_image_id_media_id_fk" FOREIGN KEY ("version_default_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_home_image_id_media_id_fk" FOREIGN KEY ("home_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_about_image_id_media_id_fk" FOREIGN KEY ("about_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_portfolio_image_id_media_id_fk" FOREIGN KEY ("portfolio_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_perspectives_image_id_media_id_fk" FOREIGN KEY ("perspectives_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_impact_image_id_media_id_fk" FOREIGN KEY ("impact_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_gift_city_image_id_media_id_fk" FOREIGN KEY ("gift_city_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_careers_image_id_media_id_fk" FOREIGN KEY ("careers_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_contact_image_id_media_id_fk" FOREIGN KEY ("contact_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_sectors_sectors" ADD CONSTRAINT "home_sectors_sectors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_stats" ADD CONSTRAINT "impact_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_themes" ADD CONSTRAINT "impact_page_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_rels" ADD CONSTRAINT "impact_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."impact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impact_page_rels" ADD CONSTRAINT "impact_page_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_city_page_highlights" ADD CONSTRAINT "gift_city_page_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_city_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fund_metrics_items" ADD CONSTRAINT "fund_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fund_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fund_metrics_v_version_items" ADD CONSTRAINT "_fund_metrics_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fund_metrics_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "companies_founders_order_idx" ON "companies_founders" USING btree ("_order");
  CREATE INDEX "companies_founders_parent_id_idx" ON "companies_founders" USING btree ("_parent_id");
  CREATE INDEX "companies_founders_photo_idx" ON "companies_founders" USING btree ("photo_id");
  CREATE INDEX "companies_logo_idx" ON "companies" USING btree ("logo_id");
  CREATE UNIQUE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "companies__status_idx" ON "companies" USING btree ("_status");
  CREATE INDEX "_companies_v_version_founders_order_idx" ON "_companies_v_version_founders" USING btree ("_order");
  CREATE INDEX "_companies_v_version_founders_parent_id_idx" ON "_companies_v_version_founders" USING btree ("_parent_id");
  CREATE INDEX "_companies_v_version_founders_photo_idx" ON "_companies_v_version_founders" USING btree ("photo_id");
  CREATE INDEX "_companies_v_parent_idx" ON "_companies_v" USING btree ("parent_id");
  CREATE INDEX "_companies_v_version_version_logo_idx" ON "_companies_v" USING btree ("version_logo_id");
  CREATE INDEX "_companies_v_version_version_slug_idx" ON "_companies_v" USING btree ("version_slug");
  CREATE INDEX "_companies_v_version_version_updated_at_idx" ON "_companies_v" USING btree ("version_updated_at");
  CREATE INDEX "_companies_v_version_version_created_at_idx" ON "_companies_v" USING btree ("version_created_at");
  CREATE INDEX "_companies_v_version_version__status_idx" ON "_companies_v" USING btree ("version__status");
  CREATE INDEX "_companies_v_created_at_idx" ON "_companies_v" USING btree ("created_at");
  CREATE INDEX "_companies_v_updated_at_idx" ON "_companies_v" USING btree ("updated_at");
  CREATE INDEX "_companies_v_latest_idx" ON "_companies_v" USING btree ("latest");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "team__status_idx" ON "team" USING btree ("_status");
  CREATE INDEX "_team_v_parent_idx" ON "_team_v" USING btree ("parent_id");
  CREATE INDEX "_team_v_version_version_photo_idx" ON "_team_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_v_version_version_updated_at_idx" ON "_team_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_v_version_version_created_at_idx" ON "_team_v" USING btree ("version_created_at");
  CREATE INDEX "_team_v_version_version__status_idx" ON "_team_v" USING btree ("version__status");
  CREATE INDEX "_team_v_created_at_idx" ON "_team_v" USING btree ("created_at");
  CREATE INDEX "_team_v_updated_at_idx" ON "_team_v" USING btree ("updated_at");
  CREATE INDEX "_team_v_latest_idx" ON "_team_v" USING btree ("latest");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "reports_cover_idx" ON "reports" USING btree ("cover_id");
  CREATE INDEX "reports_file_idx" ON "reports" USING btree ("file_id");
  CREATE INDEX "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
  CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");
  CREATE INDEX "reports_rels_order_idx" ON "reports_rels" USING btree ("order");
  CREATE INDEX "reports_rels_parent_idx" ON "reports_rels" USING btree ("parent_id");
  CREATE INDEX "reports_rels_path_idx" ON "reports_rels" USING btree ("path");
  CREATE INDEX "reports_rels_companies_id_idx" ON "reports_rels" USING btree ("companies_id");
  CREATE INDEX "_reports_v_parent_idx" ON "_reports_v" USING btree ("parent_id");
  CREATE INDEX "_reports_v_version_version_cover_idx" ON "_reports_v" USING btree ("version_cover_id");
  CREATE INDEX "_reports_v_version_version_file_idx" ON "_reports_v" USING btree ("version_file_id");
  CREATE INDEX "_reports_v_version_version_updated_at_idx" ON "_reports_v" USING btree ("version_updated_at");
  CREATE INDEX "_reports_v_version_version_created_at_idx" ON "_reports_v" USING btree ("version_created_at");
  CREATE INDEX "_reports_v_created_at_idx" ON "_reports_v" USING btree ("created_at");
  CREATE INDEX "_reports_v_updated_at_idx" ON "_reports_v" USING btree ("updated_at");
  CREATE INDEX "_reports_v_rels_order_idx" ON "_reports_v_rels" USING btree ("order");
  CREATE INDEX "_reports_v_rels_parent_idx" ON "_reports_v_rels" USING btree ("parent_id");
  CREATE INDEX "_reports_v_rels_path_idx" ON "_reports_v_rels" USING btree ("path");
  CREATE INDEX "_reports_v_rels_companies_id_idx" ON "_reports_v_rels" USING btree ("companies_id");
  CREATE INDEX "jobs_company_idx" ON "jobs" USING btree ("company_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_company_idx" ON "_jobs_v" USING btree ("version_company_id");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  CREATE INDEX "funds_updated_at_idx" ON "funds" USING btree ("updated_at");
  CREATE INDEX "funds_created_at_idx" ON "funds" USING btree ("created_at");
  CREATE INDEX "_funds_v_parent_idx" ON "_funds_v" USING btree ("parent_id");
  CREATE INDEX "_funds_v_version_version_updated_at_idx" ON "_funds_v" USING btree ("version_updated_at");
  CREATE INDEX "_funds_v_version_version_created_at_idx" ON "_funds_v" USING btree ("version_created_at");
  CREATE INDEX "_funds_v_created_at_idx" ON "_funds_v" USING btree ("created_at");
  CREATE INDEX "_funds_v_updated_at_idx" ON "_funds_v" USING btree ("updated_at");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_portrait_sizes_portrait_filename_idx" ON "media" USING btree ("sizes_portrait_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_funds_id_idx" ON "payload_locked_documents_rels" USING btree ("funds_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_socials_order_idx" ON "site_socials" USING btree ("_order");
  CREATE INDEX "site_socials_parent_id_idx" ON "site_socials" USING btree ("_parent_id");
  CREATE INDEX "site_policies_order_idx" ON "site_policies" USING btree ("_order");
  CREATE INDEX "site_policies_parent_id_idx" ON "site_policies" USING btree ("_parent_id");
  CREATE INDEX "site_policies_file_idx" ON "site_policies" USING btree ("file_id");
  CREATE INDEX "site_default_share_image_idx" ON "site" USING btree ("default_share_image_id");
  CREATE INDEX "_site_v_version_socials_order_idx" ON "_site_v_version_socials" USING btree ("_order");
  CREATE INDEX "_site_v_version_socials_parent_id_idx" ON "_site_v_version_socials" USING btree ("_parent_id");
  CREATE INDEX "_site_v_version_policies_order_idx" ON "_site_v_version_policies" USING btree ("_order");
  CREATE INDEX "_site_v_version_policies_parent_id_idx" ON "_site_v_version_policies" USING btree ("_parent_id");
  CREATE INDEX "_site_v_version_policies_file_idx" ON "_site_v_version_policies" USING btree ("file_id");
  CREATE INDEX "_site_v_version_version_default_share_image_idx" ON "_site_v" USING btree ("version_default_share_image_id");
  CREATE INDEX "_site_v_created_at_idx" ON "_site_v" USING btree ("created_at");
  CREATE INDEX "_site_v_updated_at_idx" ON "_site_v" USING btree ("updated_at");
  CREATE INDEX "page_seo_home_home_image_idx" ON "page_seo" USING btree ("home_image_id");
  CREATE INDEX "page_seo_about_about_image_idx" ON "page_seo" USING btree ("about_image_id");
  CREATE INDEX "page_seo_portfolio_portfolio_image_idx" ON "page_seo" USING btree ("portfolio_image_id");
  CREATE INDEX "page_seo_perspectives_perspectives_image_idx" ON "page_seo" USING btree ("perspectives_image_id");
  CREATE INDEX "page_seo_impact_impact_image_idx" ON "page_seo" USING btree ("impact_image_id");
  CREATE INDEX "page_seo_gift_city_gift_city_image_idx" ON "page_seo" USING btree ("gift_city_image_id");
  CREATE INDEX "page_seo_careers_careers_image_idx" ON "page_seo" USING btree ("careers_image_id");
  CREATE INDEX "page_seo_contact_contact_image_idx" ON "page_seo" USING btree ("contact_image_id");
  CREATE INDEX "home_sectors_sectors_order_idx" ON "home_sectors_sectors" USING btree ("_order");
  CREATE INDEX "home_sectors_sectors_parent_id_idx" ON "home_sectors_sectors" USING btree ("_parent_id");
  CREATE INDEX "impact_page_stats_order_idx" ON "impact_page_stats" USING btree ("_order");
  CREATE INDEX "impact_page_stats_parent_id_idx" ON "impact_page_stats" USING btree ("_parent_id");
  CREATE INDEX "impact_page_themes_order_idx" ON "impact_page_themes" USING btree ("_order");
  CREATE INDEX "impact_page_themes_parent_id_idx" ON "impact_page_themes" USING btree ("_parent_id");
  CREATE INDEX "impact_page_rels_order_idx" ON "impact_page_rels" USING btree ("order");
  CREATE INDEX "impact_page_rels_parent_idx" ON "impact_page_rels" USING btree ("parent_id");
  CREATE INDEX "impact_page_rels_path_idx" ON "impact_page_rels" USING btree ("path");
  CREATE INDEX "impact_page_rels_companies_id_idx" ON "impact_page_rels" USING btree ("companies_id");
  CREATE INDEX "gift_city_page_highlights_order_idx" ON "gift_city_page_highlights" USING btree ("_order");
  CREATE INDEX "gift_city_page_highlights_parent_id_idx" ON "gift_city_page_highlights" USING btree ("_parent_id");
  CREATE INDEX "fund_metrics_items_order_idx" ON "fund_metrics_items" USING btree ("_order");
  CREATE INDEX "fund_metrics_items_parent_id_idx" ON "fund_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "_fund_metrics_v_version_items_order_idx" ON "_fund_metrics_v_version_items" USING btree ("_order");
  CREATE INDEX "_fund_metrics_v_version_items_parent_id_idx" ON "_fund_metrics_v_version_items" USING btree ("_parent_id");
  CREATE INDEX "_fund_metrics_v_created_at_idx" ON "_fund_metrics_v" USING btree ("created_at");
  CREATE INDEX "_fund_metrics_v_updated_at_idx" ON "_fund_metrics_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "companies_founders" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "_companies_v_version_founders" CASCADE;
  DROP TABLE "_companies_v" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "_team_v" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "reports" CASCADE;
  DROP TABLE "reports_rels" CASCADE;
  DROP TABLE "_reports_v" CASCADE;
  DROP TABLE "_reports_v_rels" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  DROP TABLE "funds" CASCADE;
  DROP TABLE "_funds_v" CASCADE;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_socials" CASCADE;
  DROP TABLE "site_policies" CASCADE;
  DROP TABLE "site" CASCADE;
  DROP TABLE "_site_v_version_socials" CASCADE;
  DROP TABLE "_site_v_version_policies" CASCADE;
  DROP TABLE "_site_v" CASCADE;
  DROP TABLE "announcement" CASCADE;
  DROP TABLE "page_seo" CASCADE;
  DROP TABLE "home_sectors_sectors" CASCADE;
  DROP TABLE "home_sectors" CASCADE;
  DROP TABLE "impact_page_stats" CASCADE;
  DROP TABLE "impact_page_themes" CASCADE;
  DROP TABLE "impact_page" CASCADE;
  DROP TABLE "impact_page_rels" CASCADE;
  DROP TABLE "gift_city_page_highlights" CASCADE;
  DROP TABLE "gift_city_page" CASCADE;
  DROP TABLE "fund_metrics_items" CASCADE;
  DROP TABLE "fund_metrics" CASCADE;
  DROP TABLE "_fund_metrics_v_version_items" CASCADE;
  DROP TABLE "_fund_metrics_v" CASCADE;
  DROP TYPE "public"."enum_companies_sector";
  DROP TYPE "public"."enum_companies_stage";
  DROP TYPE "public"."enum_companies_status";
  DROP TYPE "public"."enum__companies_v_version_sector";
  DROP TYPE "public"."enum__companies_v_version_stage";
  DROP TYPE "public"."enum__companies_v_version_status";
  DROP TYPE "public"."enum_team_group";
  DROP TYPE "public"."enum_team_status";
  DROP TYPE "public"."enum__team_v_version_group";
  DROP TYPE "public"."enum__team_v_version_status";
  DROP TYPE "public"."enum_reports_sector";
  DROP TYPE "public"."enum__reports_v_version_sector";
  DROP TYPE "public"."enum_funds_status";
  DROP TYPE "public"."enum__funds_v_version_status";
  DROP TYPE "public"."enum_submissions_status";
  DROP TYPE "public"."enum_submissions_type";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_home_sectors_sectors_portfolio_sector";`)
}
