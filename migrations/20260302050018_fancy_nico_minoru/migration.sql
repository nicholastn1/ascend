CREATE TYPE "application_status" AS ENUM('applied', 'screening', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "salary_period" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "application" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"current_status" "application_status" DEFAULT 'applied'::"application_status" NOT NULL,
	"company_name" text NOT NULL,
	"job_title" text NOT NULL,
	"job_url" text,
	"salary_amount" numeric,
	"salary_currency" text DEFAULT 'USD',
	"salary_period" "salary_period",
	"notes" text,
	"application_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_contact" (
	"id" uuid PRIMARY KEY,
	"application_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"phone" text,
	"linkedin_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_history" (
	"id" uuid PRIMARY KEY,
	"application_id" uuid NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status" NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "application_user_id_current_status_index" ON "application" ("user_id","current_status");--> statement-breakpoint
CREATE INDEX "application_user_id_created_at_index" ON "application" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "application_user_id_company_name_index" ON "application" ("user_id","company_name");--> statement-breakpoint
CREATE INDEX "application_contact_application_id_index" ON "application_contact" ("application_id");--> statement-breakpoint
CREATE INDEX "application_history_application_id_changed_at_index" ON "application_history" ("application_id","changed_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application_contact" ADD CONSTRAINT "application_contact_application_id_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_application_id_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;