import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mines = pgTable("mines", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    beingUpgradedMinerId: integer("being_upgraded_miner_id").notNull().default(-1),
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
