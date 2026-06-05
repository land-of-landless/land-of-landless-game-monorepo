import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const launchSites = pgTable("launch_sites", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    launchSiteUpgradeTimer: timestamp("launch_site_upgrade_timer"),
    satellitesLaunched: integer("satellites_launched").notNull().default(0),
    wormholesLaunched: integer("wormholes_launched").notNull().default(0),
    astroidDiggersLaunched: integer("astroid_diggers_launched")
        .notNull()
        .default(0),
    cyborgsLaunched: integer("cyborgs_launched").notNull().default(0),
    dysonSpherePartsLaunched: integer("dyson_sphere_parts_launched")
        .notNull()
        .default(0),
});

export const satelliteTimers = pgTable("satellite_timers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.userId),
    timer: timestamp("timer").notNull(),
});

export const dysonSphereTimers = pgTable("dyson_sphere_timers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => launchSites.userId),
    timer: timestamp("timer").notNull(),
});

export const launchSitesRelations = relations(launchSites, ({ many }) => ({
    satelliteTimers: many(satelliteTimers),
    dysonSphereTimers: many(dysonSphereTimers),
}));

export const satelliteTimersRelations = relations(
    satelliteTimers,
    ({ one }) => ({
        launchSite: one(launchSites, {
            fields: [satelliteTimers.userId],
            references: [launchSites.userId],
        }),
    }),
);

export const dysonSphereTimersRelations = relations(
    dysonSphereTimers,
    ({ one }) => ({
        launchSite: one(launchSites, {
            fields: [dysonSphereTimers.userId],
            references: [launchSites.userId],
        }),
    }),
);
