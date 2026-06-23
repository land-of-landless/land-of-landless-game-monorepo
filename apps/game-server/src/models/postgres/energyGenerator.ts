import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const energyGenerators = pgTable("energy_generators", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    solar_panel_count: integer("solar_panel_count").notNull().default(0),
    wind_turbine_count: integer("wind_turbine_count").notNull().default(0),
    fusion_reactor_count: integer("fusion_reactor_count").notNull().default(0),
    dyson_sphere_count: integer("dyson_sphere_count").notNull().default(0),
    level: integer("level").notNull().default(0),
    upgrade_timer: timestamp("upgrade_timer", { withTimezone: true }),
});

// Relations
export const energyGeneratorsRelations = relations(
    energyGenerators,
    ({ one }) => ({
        profile: one(mainProfiles, {
            fields: [energyGenerators.user_id],
            references: [mainProfiles.user_id],
        }),
    })
);

// Types
export type EnergyGenerator = typeof energyGenerators.$inferSelect;
export type NewEnergyGenerator = typeof energyGenerators.$inferInsert;
