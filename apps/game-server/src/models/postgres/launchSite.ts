import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const launchSites = pgTable("launch_sites", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id),
    updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),

    level: integer("level").notNull().default(0),
    upgrade_timer: timestamp("upgrade_timer", { withTimezone: true }),

    launch_success_chance: integer("launch_success_chance")
        .notNull()
        .default(0),
});

export const satellites = pgTable("satellites", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.user_id, { onDelete: "cascade" }),

    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
    satellite_type: varchar("satellite_type", { length: 255 })
        .notNull()
        .$type<"normal" | "ai" | "dyson_sphere">(),
    life_span: integer("life_span").notNull(),
});

export const launchSitesRelations = relations(launchSites, ({ one, many }) => ({
    profile: one(mainProfiles, {
        fields: [launchSites.user_id],
        references: [mainProfiles.user_id],
    }),
    satellites: many(satellites),
}));

export const satelliteRelations = relations(satellites, ({ one }) => ({
    launchSite: one(launchSites, {
        fields: [satellites.user_id],
        references: [launchSites.user_id],
    }),
    profile: one(mainProfiles, {
        fields: [satellites.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type LaunchSite = typeof launchSites.$inferSelect;
export type NewLaunchSite = typeof launchSites.$inferInsert;
export type Satellite = typeof satellites.$inferSelect;
export type NewSatellite = typeof satellites.$inferInsert;
