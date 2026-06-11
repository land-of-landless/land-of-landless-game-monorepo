import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const factories = pgTable("factories", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    factory_upgrade_timer: timestamp("factory_upgrade_timer", {
        withTimezone: true,
    }),
    rockets: integer("rockets").notNull().default(0),
    rocket_type: integer("rocket_type").notNull().default(0),
    explorers: integer("explorers").notNull().default(0),
    satellites: integer("satellites").notNull().default(0),
    wormhole: integer("wormhole").notNull().default(0),
    astroid_diggers: integer("astroid_diggers").notNull().default(0),
    cyborg: integer("cyborg").notNull().default(0),
    dyson_sphere: integer("dyson_sphere").notNull().default(0),
});

export const factorySpaceships = pgTable("factory_spaceships", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => factories.user_id),
    spaceship_type: integer("spaceship_type").notNull(),
    count: integer("count").notNull().default(0),
});

export const builderPads = pgTable("builder_pads", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => factories.user_id),
    pad_index: integer("pad_index").notNull(),
    item_being_built: varchar("item_being_built", { length: 50 }),
    timer: timestamp("timer", { withTimezone: true }),
    secondary_item_index: integer("secondary_item_index").notNull().default(-1),
});

export const factoriesRelations = relations(factories, ({ many }) => ({
    spaceships: many(factorySpaceships),
    builderPads: many(builderPads),
}));

export const factorySpaceshipsRelations = relations(
    factorySpaceships,
    ({ one }) => ({
        factory: one(factories, {
            fields: [factorySpaceships.user_id],
            references: [factories.user_id],
        }),
    })
);

export const builderPadsRelations = relations(builderPads, ({ one }) => ({
    factory: one(factories, {
        fields: [builderPads.user_id],
        references: [factories.user_id],
    }),
}));

// Types
export type Factory = typeof factories.$inferSelect;
export type NewFactory = typeof factories.$inferInsert;
export type FactorySpaceship = typeof factorySpaceships.$inferSelect;
export type NewFactorySpaceship = typeof factorySpaceships.$inferInsert;
export type BuilderPad = typeof builderPads.$inferSelect;
export type NewBuilderPad = typeof builderPads.$inferInsert;
