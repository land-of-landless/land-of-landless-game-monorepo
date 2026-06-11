import {
    pgTable,
    varchar,
    integer,
    boolean,
    timestamp,
    real,
    doublePrecision,
    serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mainProfiles = pgTable("main_profiles", {
    /**
     * set by oauth openid connect google id,
     * this value is stable because user always
     * can generate the same by login in
     */
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),

    /**
     * preferences and general info like name, picture, etc
     */
    profile_picture_index: integer("profile_picture_index")
        .notNull()
        .default(0),
    name: varchar("name", { length: 255 }).notNull(),
    represented_flag: varchar("represented_flag", { length: 10 }),
    /**
     * referral related
     */
    ref_code: varchar("ref_code", { length: 255 }).notNull().unique(),
    referred_by: varchar("referred_by", { length: 255 }),
    referrals: integer("referrals").notNull().default(0),
    /**
     * game pass
     */
    game_pass: boolean("game_pass").notNull().default(false),
    game_pass_purchase_time: timestamp("game_pass_purchase_time", {
        withTimezone: true,
    }),

    /**
     * game inventory, it holds info such as
     * coins, gems, xp, tickets, energy and etc
     */
    loot_boxes_opening_rate: doublePrecision("loot_boxes_opening_rate")
        .notNull()
        .default(1),
    loot_box_keys: integer("loot_box_keys").notNull().default(0),
    coins: integer("coins").notNull().default(0),
    gems: integer("gems").notNull().default(0),
    tickets_type1: integer("tickets_type1").notNull().default(0),
    tickets_type2: integer("tickets_type2").notNull().default(0),
    xp: integer("xp").notNull().default(0),
    energy: real("energy").notNull().default(0),
    energy_generation_rate: real("energy_generation_rate").notNull().default(0),
    energy_max: real("energy_max").notNull().default(0),
    energy_updated_at: timestamp("energy_updated_at", { withTimezone: true }),
    mineral: real("mineral").notNull().default(0),
    mineral_generation_rate: real("mineral_generation_rate")
        .notNull()
        .default(0),
    mineral_max: real("mineral_max").notNull().default(0),
    mineral_updated_at: timestamp("mineral_updated_at", { withTimezone: true }),
    atmosphere_trash_type1: integer("atmosphere_trash_type1")
        .notNull()
        .default(0),
    atmosphere_trash_type2: integer("atmosphere_trash_type2")
        .notNull()
        .default(0),
    atmosphere_trash_updated_at: timestamp("atmosphere_trash_updated_at", {
        withTimezone: true,
    }),
    last_daily_reward_claimed_at: timestamp("last_daily_reward_claimed_at", {
        withTimezone: true,
    }),
    daily_reward_claim_counter: integer("daily_reward_claim_counter")
        .notNull()
        .default(0),
});

export const mainProfileWorkerBots = pgTable("main_profiles_worker_bots", {
    id: serial("id").primaryKey(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.user_id),
    position: integer("position").notNull().default(0),
    bot_type: integer("bot_type").notNull(),
    assigned_to: varchar("assigned_to", { length: 255 }).notNull().default(""),
    status: varchar("status", { length: 255 }).notNull().default("idle"),
});

export const mainProfileLootBoxes = pgTable("main_profiles_loot_boxes", {
    id: serial("id").primaryKey(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.user_id),
    box_type: varchar("box_type", { length: 50 }).notNull(),
    timer: timestamp("timer", { withTimezone: true }),
    position: integer("position").notNull(),
});

// Relations
export const mainProfilesRelations = relations(mainProfiles, ({ many }) => ({
    workerBots: many(mainProfileWorkerBots),
    lootBoxes: many(mainProfileLootBoxes),
}));

export const mainProfileWorkerBotsRelations = relations(
    mainProfileWorkerBots,
    ({ one }) => ({
        profile: one(mainProfiles, {
            fields: [mainProfileWorkerBots.user_id],
            references: [mainProfiles.user_id],
        }),
    })
);

export const mainProfileLootBoxesRelations = relations(
    mainProfileLootBoxes,
    ({ one }) => ({
        profile: one(mainProfiles, {
            fields: [mainProfileLootBoxes.user_id],
            references: [mainProfiles.user_id],
        }),
    })
);

// Types
export type MainProfileTable = typeof mainProfiles.$inferSelect;
export type NewMainProfileTable = typeof mainProfiles.$inferInsert;

export type MainProfileWorkerBot = typeof mainProfileWorkerBots.$inferSelect;
export type NewMainProfileWorkerBot = typeof mainProfileWorkerBots.$inferInsert;

export type MainProfileLootBox = typeof mainProfileLootBoxes.$inferSelect;
export type NewMainProfileLootBox = typeof mainProfileLootBoxes.$inferInsert;
