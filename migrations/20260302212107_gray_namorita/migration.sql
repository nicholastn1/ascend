CREATE TABLE "conversation" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text,
	"agent_type" text DEFAULT 'general' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "conversation_user_id_index" ON "conversation" ("user_id");--> statement-breakpoint
CREATE INDEX "conversation_user_id_updated_at_index" ON "conversation" ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "message_conversation_id_index" ON "message" ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_conversation_id_created_at_index" ON "message" ("conversation_id","created_at");--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE CASCADE;