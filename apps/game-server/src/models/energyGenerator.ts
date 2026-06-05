import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const energyGenerators = pgTable("energy_generators", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    panelCount: integer("panel_count").notNull().default(0),
    level: integer("level").notNull().default(0),
    upgradeTimer: timestamp("upgrade_timer"),
});
