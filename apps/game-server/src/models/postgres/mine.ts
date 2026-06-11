import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mines = pgTable("mines", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    being_upgraded_miner_id: integer("being_upgraded_miner_id")
        .notNull()
        .default(-1),
    upgrade_timer: timestamp("upgrade_timer", { withTimezone: true }),
});

export const miners = pgTable("miners", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mines.user_id),
    miner_id: integer("miner_id").notNull(), // 1, 2, or 3
    level: integer("level").notNull().default(0),
});

export const minesRelations = relations(mines, ({ many }) => ({
    miners: many(miners),
}));

export const minersRelations = relations(miners, ({ one }) => ({
    mine: one(mines, {
        fields: [miners.user_id],
        references: [mines.user_id],
    }),
}));

// Types
export type Mine = typeof mines.$inferSelect;
export type NewMine = typeof mines.$inferInsert;
export type Miner = typeof miners.$inferSelect;
export type NewMiner = typeof miners.$inferInsert;
