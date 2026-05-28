import {
    pgTable,
    varchar,
    integer,
    boolean,
    timestamp,
    real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Main Profile
export const mainProfiles = pgTable("main_profiles", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    profilePictureIndex: integer("profile_picture_index").notNull().default(0),
    name: varchar("name", { length: 255 }).notNull(),
    representedFlag: varchar("represented_flag", { length: 10 }),
    refCode: varchar("ref_code", { length: 255 }).notNull().unique(),
    gamePass: boolean("game_pass").notNull().default(false),
    gamePassPurchaseTime: timestamp("game_pass_purchase_time"),
    lootBoxesOpeningRate: real("loot_boxes_opening_rate").notNull().default(1),
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

export const lootBoxesOpenedRelations = relations(lootBoxesOpened, ({ one }) => ({
    profile: one(mainProfiles, {
        fields: [lootBoxesOpened.userId],
        references: [mainProfiles.userId],
    }),
}));

// Billing
export const billings = pgTable("billings", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
});

export const invoices = pgTable("invoices", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => billings.userId),
    status: varchar("status", { length: 20 }).notNull(), // 'ongoing' or 'finished'
});

export const billingsRelations = relations(billings, ({ many }) => ({
    invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
    billing: one(billings, {
        fields: [invoices.userId],
        references: [billings.userId],
    }),
}));

// Energy Generator
export const energyGenerators = pgTable("energy_generators", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    panelCount: integer("panel_count").notNull().default(0),
    level: integer("level").notNull().default(0),
    upgradeTimer: timestamp("upgrade_timer"),
});

// Factory
export const factories = pgTable("factories", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    factoryUpgradeTimer: timestamp("factory_upgrade_timer"),
    rockets: integer("rockets").notNull().default(0),
    rocketType: integer("rocket_type").notNull().default(0),
    explorers: integer("explorers").notNull().default(0),
    satellites: integer("satellites").notNull().default(0),
    wormhole: integer("wormhole").notNull().default(0),
    astroidDiggers: integer("astroid_diggers").notNull().default(0),
    cyborg: integer("cyborg").notNull().default(0),
    dysonSphere: integer("dyson_sphere").notNull().default(0),
});

export const factorySpaceships = pgTable("factory_spaceships", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => factories.userId),
    spaceshipType: integer("spaceship_type").notNull(),
    count: integer("count").notNull().default(0),
});

export const builderPads = pgTable("builder_pads", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => factories.userId),
    padIndex: integer("pad_index").notNull(),
    itemBeingBuilt: varchar("item_being_built", { length: 50 }),
    timer: timestamp("timer"),
    secondaryItemIndex: integer("secondary_item_index").default(-1),
});

export const factoriesRelations = relations(factories, ({ many }) => ({
    spaceships: many(factorySpaceships),
    builderPads: many(builderPads),
}));

export const factorySpaceshipsRelations = relations(
    factorySpaceships,
    ({ one }) => ({
        factory: one(factories, {
            fields: [factorySpaceships.userId],
            references: [factories.userId],
        }),
    }),
);

export const builderPadsRelations = relations(builderPads, ({ one }) => ({
    factory: one(factories, {
        fields: [builderPads.userId],
        references: [factories.userId],
    }),
}));

// Identity
export const identities = pgTable("identities", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
});

export const identityIps = pgTable("identity_ips", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => identities.userId),
    ip: varchar("ip", { length: 45 }).notNull(),
    count: integer("count").notNull().default(0),
});

export const identitiesRelations = relations(identities, ({ many }) => ({
    ips: many(identityIps),
}));

export const identityIpsRelations = relations(identityIps, ({ one }) => ({
    identity: one(identities, {
        fields: [identityIps.userId],
        references: [identities.userId],
    }),
}));

// Lab
export const labs = pgTable("labs", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    labUpgradeTimer: timestamp("lab_upgrade_timer"),
    factoryTech: integer("factory_tech").notNull().default(0),
    energyGeneratorTech: integer("energy_generator_tech").notNull().default(0),
    rocketTech: integer("rocket_tech").notNull().default(0),
    miningTech: integer("mining_tech").notNull().default(0),
    portalTech: integer("portal_tech").notNull().default(0),
    generalTech: integer("general_tech").notNull().default(0),
});

// Launch Site
export const launchSites = pgTable("launch_sites", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    launchSiteUpgradeTimer: timestamp("launch_site_upgrade_timer"),
    satellitesLaunched: integer("satellites_launched").notNull().default(0),
    wormholesLaunched: integer("wormholes_launched").notNull().default(0),
    astroidDiggersLaunched: integer("astroid_diggers_launched")
        .notNull()
        .default(0),
    cyborgsLaunched: integer("cyborgs_launched").notNull().default(0),
    dysonSpherePartsLaunched: integer("dyson_sphere_parts_launched")
        .notNull()
        .default(0),
});

export const satelliteTimers = pgTable("satellite_timers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.userId),
    timer: timestamp("timer").notNull(),
});

export const dysonSphereTimers = pgTable("dyson_sphere_timers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.userId),
    timer: timestamp("timer").notNull(),
});

export const launchSitesRelations = relations(launchSites, ({ many }) => ({
    satelliteTimers: many(satelliteTimers),
    dysonSphereTimers: many(dysonSphereTimers),
}));

export const satelliteTimersRelations = relations(
    satelliteTimers,
    ({ one }) => ({
        launchSite: one(launchSites, {
            fields: [satelliteTimers.userId],
            references: [launchSites.userId],
        }),
    }),
);

export const dysonSphereTimersRelations = relations(
    dysonSphereTimers,
    ({ one }) => ({
        launchSite: one(launchSites, {
            fields: [dysonSphereTimers.userId],
            references: [launchSites.userId],
        }),
    }),
);

// Mine
export const mines = pgTable("mines", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    beingUpgradedMinerId: integer("being_upgraded_miner_id").default(-1),
    upgradeTimer: timestamp("upgrade_timer"),
});

export const miners = pgTable("miners", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mines.userId),
    minerId: integer("miner_id").notNull(), // 1, 2, or 3
    level: integer("level").notNull().default(0),
});

export const minesRelations = relations(mines, ({ many }) => ({
    miners: many(miners),
}));

export const minersRelations = relations(miners, ({ one }) => ({
    mine: one(mines, {
        fields: [miners.userId],
        references: [mines.userId],
    }),
}));

// Mini Games
export const miniGames = pgTable("mini_games", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),

    // Guess the Number (miniGame2)
    mg2TargetNumber: integer("mg2_target_number"),
    mg2UserCorrectGuesses: integer("mg2_user_correct_guesses").default(0),

    // Pick the Boxes (miniGame3)
    mg3UserCorrectGuesses: integer("mg3_user_correct_guesses").default(0),
    mg3IsStarted: boolean("mg3_is_started").default(false),

    // Rock Paper Scissors (miniGame4)
    mg4IsStarted: boolean("mg4_is_started").default(false),
    mg4UserCorrectGuesses: integer("mg4_user_correct_guesses").default(0),
});

export const mg2RemainingNumbers = pgTable("mg2_remaining_numbers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => miniGames.userId),
    num: integer("num").notNull(),
});

export const mg3BoxesState = pgTable("mg3_boxes_state", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => miniGames.userId),
    position: integer("position").notNull(),
    state: integer("state").notNull(),
});

export const miniGamesRelations = relations(miniGames, ({ many }) => ({
    mg2RemainingNumbers: many(mg2RemainingNumbers),
    mg3BoxesState: many(mg3BoxesState),
}));

export const mg2RemainingNumbersRelations = relations(
    mg2RemainingNumbers,
    ({ one }) => ({
        miniGame: one(miniGames, {
            fields: [mg2RemainingNumbers.userId],
            references: [miniGames.userId],
        }),
    }),
);

export const mg3BoxesStateRelations = relations(mg3BoxesState, ({ one }) => ({
    miniGame: one(miniGames, {
        fields: [mg3BoxesState.userId],
        references: [miniGames.userId],
    }),
}));

// Stats
export const stats = pgTable("stats", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    lootBoxesOpenedTotal: integer("loot_boxes_opened_total").default(0),
    launchesTotal: integer("launches_total").default(0),
});

export const lootBoxesByType = pgTable("loot_boxes_by_type", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => stats.userId),
    boxType: varchar("box_type", { length: 50 }).notNull(),
    count: integer("count").notNull().default(0),
});

export const launchesByItem = pgTable("launches_by_item", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => stats.userId),
    itemType: varchar("item_type", { length: 50 }).notNull(),
    count: integer("count").notNull().default(0),
});

export const statsRelations = relations(stats, ({ many }) => ({
    lootBoxesByType: many(lootBoxesByType),
    launchesByItem: many(launchesByItem),
}));

export const lootBoxesByTypeRelations = relations(
    lootBoxesByType,
    ({ one }) => ({
        stats: one(stats, {
            fields: [lootBoxesByType.userId],
            references: [stats.userId],
        }),
    }),
);

export const launchesByItemRelations = relations(launchesByItem, ({ one }) => ({
    stats: one(stats, {
        fields: [launchesByItem.userId],
        references: [stats.userId],
    }),
}));
