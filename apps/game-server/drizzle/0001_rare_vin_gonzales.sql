ALTER TABLE "builder_pads" ALTER COLUMN "secondary_item_index" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mines" ALTER COLUMN "being_upgraded_miner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mini_games" ALTER COLUMN "mg2_user_correct_guesses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mini_games" ALTER COLUMN "mg3_user_correct_guesses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mini_games" ALTER COLUMN "mg3_is_started" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mini_games" ALTER COLUMN "mg4_is_started" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mini_games" ALTER COLUMN "mg4_user_correct_guesses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "loot_boxes_opened_total" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "launches_total" SET NOT NULL;