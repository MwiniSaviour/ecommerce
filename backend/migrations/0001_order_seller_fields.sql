ALTER TABLE "orders" ADD COLUMN "commission" double precision NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "seller_status" text NOT NULL DEFAULT 'pending';--> statement-breakpoint
