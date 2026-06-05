import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
    secondaryItemIndex: integer("secondary_item_index").notNull().default(-1),
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
