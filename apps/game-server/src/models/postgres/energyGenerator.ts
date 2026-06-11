import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const energyGenerators = pgTable("energy_generators", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    panel_count: integer("panel_count").notNull().default(0),
    level: integer("level").notNull().default(0),
    upgrade_timer: timestamp("upgrade_timer", { withTimezone: true }),
});

// Types
export type EnergyGenerator = typeof energyGenerators.$inferSelect;
export type NewEnergyGenerator = typeof energyGenerators.$inferInsert;
