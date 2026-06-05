import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const stats = pgTable("stats", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    lootBoxesOpenedTotal: integer("loot_boxes_opened_total").notNull().default(0),
    launchesTotal: integer("launches_total").notNull().default(0),
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
