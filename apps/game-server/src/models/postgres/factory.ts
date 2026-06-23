import {
    pgTable,
    varchar,
    integer,
    timestamp,
    jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.ts";

export const factories = pgTable("factories", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.user_id),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    level: integer("level").notNull().default(0),
    factory_upgrade_timer: timestamp("factory_upgrade_timer", {
        withTimezone: true,
    }),
});

export const factoryBuilderPads = pgTable("factory_builder_pads", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    factory_id: integer("factory_id")
        .notNull()
        .references(() => factories.id),
    pad_index: integer("pad_index").notNull(),
    item_being_built: varchar("item_being_built", { length: 50 }),
    item_being_built_metadata: jsonb("item_being_built_metadata")
        .$type<{
            rocket_variant?: "falcon" | "starship" | "soyuz" | "atlas";
        }>()
        .notNull()
        .default({}),
    item_being_built_started_at: timestamp("item_being_built_started_at", {
        withTimezone: true,
    }),
});

export const inventories = pgTable("inventories", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    factory_id: integer("factory_id")
        .notNull()
        .references(() => factories.id),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.user_id),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    item_type: varchar("item_type", { length: 255 }).notNull(),
    item_count: integer("item_count").notNull().default(0),
    item_metadata: jsonb("item_metadata")
        .$type<{
            rocket_variant?: "falcon" | "starship" | "soyuz" | "atlas";
            //TODO: add more types
        }>()
        .notNull()
        .default({}),
});

export const factoriesRelations = relations(factories, ({ one, many }) => ({
    builderPads: many(factoryBuilderPads),
    inventories: many(inventories),
    profile: one(mainProfiles, {
        fields: [factories.user_id],
        references: [mainProfiles.user_id],
    }),
}));

export const factoryBuilderPadsRelations = relations(
    factoryBuilderPads,
    ({ one }) => ({
        factory: one(factories, {
            fields: [factoryBuilderPads.factory_id],
            references: [factories.id],
        }),
    })
);

export const inventoriesRelations = relations(inventories, ({ one }) => ({
    factory: one(factories, {
        fields: [inventories.factory_id],
        references: [factories.id],
    }),
    profile: one(mainProfiles, {
        fields: [inventories.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type Factory = typeof factories.$inferSelect;
export type NewFactory = typeof factories.$inferInsert;
export type BuilderPad = typeof factoryBuilderPads.$inferSelect;
export type NewBuilderPad = typeof factoryBuilderPads.$inferInsert;
export type Inventory = typeof inventories.$inferSelect;
export type NewInventory = typeof inventories.$inferInsert;
