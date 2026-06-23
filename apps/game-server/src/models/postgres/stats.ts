import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const stats = pgTable("stats", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    loot_boxes_opened_total: integer("loot_boxes_opened_total")
        .notNull()
        .default(0),
    launches_total: integer("launches_total").notNull().default(0),
});

export const lootBoxesByType = pgTable("loot_boxes_by_type", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => stats.user_id, { onDelete: "cascade" }),
    box_type: varchar("box_type", { length: 50 }).notNull(),
    count: integer("count").notNull().default(0),
});

export const launchesByItem = pgTable("launches_by_item", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => stats.user_id, { onDelete: "cascade" }),
    item_type: varchar("item_type", { length: 50 }).notNull(),
    count: integer("count").notNull().default(0),
});

export const statsRelations = relations(stats, ({ one, many }) => ({
    profile: one(mainProfiles, {
        fields: [stats.user_id],
        references: [mainProfiles.user_id],
    }),
    lootBoxesByType: many(lootBoxesByType),
    launchesByItem: many(launchesByItem),
}));

export const lootBoxesByTypeRelations = relations(
    lootBoxesByType,
    ({ one }) => ({
        stats: one(stats, {
            fields: [lootBoxesByType.user_id],
            references: [stats.user_id],
        }),
        profile: one(mainProfiles, {
            fields: [lootBoxesByType.user_id],
            references: [mainProfiles.user_id],
        }),
    })
);

export const launchesByItemRelations = relations(launchesByItem, ({ one }) => ({
    stats: one(stats, {
        fields: [launchesByItem.user_id],
        references: [stats.user_id],
    }),
    profile: one(mainProfiles, {
        fields: [launchesByItem.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type Stat = typeof stats.$inferSelect;
export type NewStat = typeof stats.$inferInsert;
export type LootBoxByType = typeof lootBoxesByType.$inferSelect;
export type NewLootBoxByType = typeof lootBoxesByType.$inferInsert;
export type LaunchByItem = typeof launchesByItem.$inferSelect;
export type NewLaunchByItem = typeof launchesByItem.$inferInsert;
