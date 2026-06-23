import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const miners = pgTable("miners", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    // astroid-miner, land-miner
    miner_type: varchar("miner_type", { length: 255 }).notNull(),
    // 1, 2, 3, ...
    miner_level: integer("miner_level").notNull().default(0),
    upgrade_timer: timestamp("upgrade_timer", { withTimezone: true }),
});

// Relations
export const minersRelations = relations(miners, ({ one }) => ({
    profile: one(mainProfiles, {
        fields: [miners.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type Miner = typeof miners.$inferSelect;
export type NewMiner = typeof miners.$inferInsert;
