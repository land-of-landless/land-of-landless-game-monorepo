CREATE TABLE "billings" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_pads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "builder_pads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"pad_index" integer NOT NULL,
	"item_being_built" varchar(50),
	"timer" timestamp,
	"secondary_item_index" integer DEFAULT -1
);
--> statement-breakpoint
CREATE TABLE "dyson_sphere_timers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dyson_sphere_timers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"timer" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "energy_generators" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"panel_count" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"upgrade_timer" timestamp
);
--> statement-breakpoint
CREATE TABLE "factories" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"factory_upgrade_timer" timestamp,
	"rockets" integer DEFAULT 0 NOT NULL,
	"rocket_type" integer DEFAULT 0 NOT NULL,
	"explorers" integer DEFAULT 0 NOT NULL,
	"satellites" integer DEFAULT 0 NOT NULL,
	"wormhole" integer DEFAULT 0 NOT NULL,
	"astroid_diggers" integer DEFAULT 0 NOT NULL,
	"cyborg" integer DEFAULT 0 NOT NULL,
	"dyson_sphere" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_spaceships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "factory_spaceships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"spaceship_type" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity_ips" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "identity_ips_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"ip" varchar(45) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labs" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"lab_upgrade_timer" timestamp,
	"factory_tech" integer DEFAULT 0 NOT NULL,
	"energy_generator_tech" integer DEFAULT 0 NOT NULL,
	"rocket_tech" integer DEFAULT 0 NOT NULL,
	"mining_tech" integer DEFAULT 0 NOT NULL,
	"portal_tech" integer DEFAULT 0 NOT NULL,
	"general_tech" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_sites" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"launch_site_upgrade_timer" timestamp,
	"satellites_launched" integer DEFAULT 0 NOT NULL,
	"wormholes_launched" integer DEFAULT 0 NOT NULL,
	"astroid_diggers_launched" integer DEFAULT 0 NOT NULL,
	"cyborgs_launched" integer DEFAULT 0 NOT NULL,
	"dyson_sphere_parts_launched" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launches_by_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "launches_by_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"item_type" varchar(50) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loot_boxes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "loot_boxes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"box_type" varchar(50) NOT NULL,
	"timer" timestamp,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loot_boxes_by_type" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "loot_boxes_by_type_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"box_type" varchar(50) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loot_boxes_opened" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "loot_boxes_opened_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"box_type_index" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main_profiles" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"profile_picture_index" integer DEFAULT 0 NOT NULL,
	"name" varchar(255) NOT NULL,
	"represented_flag" varchar(10),
	"ref_code" varchar(255) NOT NULL,
	"game_pass" boolean DEFAULT false NOT NULL,
	"game_pass_purchase_time" timestamp,
	"loot_boxes_opening_rate" real DEFAULT 1 NOT NULL,
	"loot_box_keys" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"gems" integer DEFAULT 0 NOT NULL,
	"tickets_type1" integer DEFAULT 0 NOT NULL,
	"tickets_type2" integer DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"energy" real DEFAULT 0 NOT NULL,
	"energy_generation_rate" real DEFAULT 0 NOT NULL,
	"energy_max" real DEFAULT 0 NOT NULL,
	"energy_updated_at" timestamp,
	"mineral" real DEFAULT 0 NOT NULL,
	"mineral_generation_rate" real DEFAULT 0 NOT NULL,
	"mineral_max" real DEFAULT 0 NOT NULL,
	"mineral_updated_at" timestamp,
	"atmosphere_trash_type1" integer DEFAULT 0 NOT NULL,
	"atmosphere_trash_type2" integer DEFAULT 0 NOT NULL,
	"atmosphere_trash_updated_at" timestamp,
	"last_daily_reward_claimed_at" timestamp,
	"daily_reward_claim_counter" integer DEFAULT 0 NOT NULL,
	"referred_by" varchar(255),
	"referrals" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "main_profiles_ref_code_unique" UNIQUE("ref_code")
);
--> statement-breakpoint
CREATE TABLE "mg2_remaining_numbers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mg2_remaining_numbers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"num" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mg3_boxes_state" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mg3_boxes_state_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"position" integer NOT NULL,
	"state" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "miners" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "miners_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"miner_id" integer NOT NULL,
	"level" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mines" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"being_upgraded_miner_id" integer DEFAULT -1,
	"upgrade_timer" timestamp
);
--> statement-breakpoint
CREATE TABLE "mini_games" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"mg2_target_number" integer,
	"mg2_user_correct_guesses" integer DEFAULT 0,
	"mg3_user_correct_guesses" integer DEFAULT 0,
	"mg3_is_started" boolean DEFAULT false,
	"mg4_is_started" boolean DEFAULT false,
	"mg4_user_correct_guesses" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "satellite_timers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "satellite_timers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"timer" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"loot_boxes_opened_total" integer DEFAULT 0,
	"launches_total" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "worker_bots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "worker_bots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"bot_type" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_pads" ADD CONSTRAINT "builder_pads_user_id_factories_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."factories"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dyson_sphere_timers" ADD CONSTRAINT "dyson_sphere_timers_user_id_launch_sites_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."launch_sites"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_spaceships" ADD CONSTRAINT "factory_spaceships_user_id_factories_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."factories"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_ips" ADD CONSTRAINT "identity_ips_user_id_identities_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."identities"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_billings_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."billings"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launches_by_item" ADD CONSTRAINT "launches_by_item_user_id_stats_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stats"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_boxes" ADD CONSTRAINT "loot_boxes_user_id_main_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."main_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_boxes_by_type" ADD CONSTRAINT "loot_boxes_by_type_user_id_stats_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."stats"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loot_boxes_opened" ADD CONSTRAINT "loot_boxes_opened_user_id_main_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."main_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mg2_remaining_numbers" ADD CONSTRAINT "mg2_remaining_numbers_user_id_mini_games_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mini_games"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mg3_boxes_state" ADD CONSTRAINT "mg3_boxes_state_user_id_mini_games_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mini_games"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miners" ADD CONSTRAINT "miners_user_id_mines_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mines"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_timers" ADD CONSTRAINT "satellite_timers_user_id_launch_sites_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."launch_sites"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_bots" ADD CONSTRAINT "worker_bots_user_id_main_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."main_profiles"("user_id") ON DELETE no action ON UPDATE no action;