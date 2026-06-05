import {
    pgTable,
    varchar,
    integer,
    boolean,
    timestamp,
    real,
    doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mainProfiles = pgTable("main_profiles", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    profilePictureIndex: integer("profile_picture_index").notNull().default(0),
    name: varchar("name", { length: 255 }).notNull(),
    representedFlag: varchar("represented_flag", { length: 10 }),
    refCode: varchar("ref_code", { length: 255 }).notNull().unique(),
    gamePass: boolean("game_pass").notNull().default(false),
    gamePassPurchaseTime: timestamp("game_pass_purchase_time"),
    lootBoxesOpeningRate: doublePrecision("loot_boxes_opening_rate")
        .notNull()
        .default(1),
    lootBoxKeys: integer("loot_box_keys").notNull().default(0),
    coins: integer("coins").notNull().default(0),
    gems: integer("gems").notNull().default(0),
    ticketsType1: integer("tickets_type1").notNull().default(0),
    ticketsType2: integer("tickets_type2").notNull().default(0),
    xp: integer("xp").notNull().default(0),
    energy: real("energy").notNull().default(0),
    energyGenerationRate: real("energy_generation_rate").notNull().default(0),
    energyMax: real("energy_max").notNull().default(0),
    energyUpdatedAt: timestamp("energy_updated_at"),
    mineral: real("mineral").notNull().default(0),
    mineralGenerationRate: real("mineral_generation_rate").notNull().default(0),
    mineralMax: real("mineral_max").notNull().default(0),
    mineralUpdatedAt: timestamp("mineral_updated_at"),
    atmosphereTrashType1: integer("atmosphere_trash_type1").notNull().default(0),
    atmosphereTrashType2: integer("atmosphere_trash_type2").notNull().default(0),
    atmosphereTrashUpdatedAt: timestamp("atmosphere_trash_updated_at"),
    lastDailyRewardClaimedAt: timestamp("last_daily_reward_claimed_at"),
    dailyRewardClaimCounter: integer("daily_reward_claim_counter")
        .notNull()
        .default(0),
    referredBy: varchar("referred_by", { length: 255 }),
    referrals: integer("referrals").notNull().default(0),
});

export const workerBots = pgTable("worker_bots", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.userId),
    botType: integer("bot_type").notNull(), // 0 or 1
});

export const lootBoxes = pgTable("loot_boxes", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.userId),
    boxType: varchar("box_type", { length: 50 }).notNull(), // MiniGamesLootBox or ""
    timer: timestamp("timer"),
    position: integer("position").notNull(), // index in the array
});

export const lootBoxesOpened = pgTable("loot_boxes_opened", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.userId),
    boxTypeIndex: integer("box_type_index").notNull(),
    count: integer("count").notNull().default(0),
});

export const mainProfilesRelations = relations(mainProfiles, ({ many }) => ({
    workerBots: many(workerBots),
    lootBoxes: many(lootBoxes),
    lootBoxesOpened: many(lootBoxesOpened),
}));

export const workerBotsRelations = relations(workerBots, ({ one }) => ({
    profile: one(mainProfiles, {
        fields: [workerBots.userId],
        references: [mainProfiles.userId],
    }),
}));

export const lootBoxesRelations = relations(lootBoxes, ({ one }) => ({
    profile: one(mainProfiles, {
        fields: [lootBoxes.userId],
        references: [mainProfiles.userId],
    }),
}));

export const lootBoxesOpenedRelations = relations(
    lootBoxesOpened,
    ({ one }) => ({
        profile: one(mainProfiles, {
            fields: [lootBoxesOpened.userId],
            references: [mainProfiles.userId],
        }),
    }),
);
