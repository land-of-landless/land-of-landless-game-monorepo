import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const launchSites = pgTable("launch_sites", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    launch_site_upgrade_timer: timestamp("launch_site_upgrade_timer", {
        withTimezone: true,
    }),
    satellites_launched: integer("satellites_launched").notNull().default(0),
    wormholes_launched: integer("wormholes_launched").notNull().default(0),
    astroid_diggers_launched: integer("astroid_diggers_launched")
        .notNull()
        .default(0),
    cyborgs_launched: integer("cyborgs_launched").notNull().default(0),
    dyson_sphere_parts_launched: integer("dyson_sphere_parts_launched")
        .notNull()
        .default(0),
});

export const satelliteTimers = pgTable("satellite_timers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.user_id),
    timer: timestamp("timer", { withTimezone: true }).notNull(),
});

export const dysonSphereTimers = pgTable("dyson_sphere_timers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.user_id),
    timer: timestamp("timer", { withTimezone: true }).notNull(),
});

export const launchSitesRelations = relations(launchSites, ({ many }) => ({
    satelliteTimers: many(satelliteTimers),
    dysonSphereTimers: many(dysonSphereTimers),
}));

export const satelliteTimersRelations = relations(
    satelliteTimers,
    ({ one }) => ({
        launchSite: one(launchSites, {
            fields: [satelliteTimers.user_id],
            references: [launchSites.user_id],
        }),
    })
);

export const dysonSphereTimersRelations = relations(
    dysonSphereTimers,
    ({ one }) => ({
        launchSite: one(launchSites, {
            fields: [dysonSphereTimers.user_id],
            references: [launchSites.user_id],
        }),
    })
);

// Types
export type LaunchSite = typeof launchSites.$inferSelect;
export type NewLaunchSite = typeof launchSites.$inferInsert;
export type SatelliteTimer = typeof satelliteTimers.$inferSelect;
export type NewSatelliteTimer = typeof satelliteTimers.$inferInsert;
export type DysonSphereTimer = typeof dysonSphereTimers.$inferSelect;
export type NewDysonSphereTimer = typeof dysonSphereTimers.$inferInsert;
