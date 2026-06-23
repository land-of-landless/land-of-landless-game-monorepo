import {
    pgTable,
    varchar,
    integer,
    timestamp,
    jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const labs = pgTable("labs", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    level: integer("level").notNull().default(0),
    lab_upgrade_timer: timestamp("lab_upgrade_timer", { withTimezone: true }),

    factory_upgrade_tree: jsonb("factory_upgrade_tree")
        .$type<{
            a: {
                c: number;
                d: number;
            };
            b: number;
        }>()
        .notNull()
        .default({ a: { c: 0, d: 1 }, b: 0 }),
    energy_generator_upgrade_tree: jsonb("energy_generator_upgrade_tree")
        .$type<{
            a: {
                c: number;
                d: number;
            };
            b: number;
        }>()
        .notNull()
        .default({ a: { c: 0, d: 1 }, b: 0 }),
    launch_site_upgrade_tree: jsonb("launch_site_upgrade_tree")
        .$type<{
            a: {
                c: number;
                d: number;
            };
            b: number;
        }>()
        .notNull()
        .default({ a: { c: 0, d: 1 }, b: 0 }),
    mining_upgrade_tree: jsonb("mining_upgrade_tree")
        .$type<{
            a: {
                c: number;
                d: number;
            };
            b: number;
        }>()
        .notNull()
        .default({ a: { c: 0, d: 1 }, b: 0 }),
    general_upgrade_tree: jsonb("general_upgrade_tree")
        .$type<{
            a: {
                c: number;
                d: number;
            };
            b: number;
        }>()
        .notNull()
        .default({ a: { c: 0, d: 1 }, b: 0 }),

    minigame_tech_upgrade_tree: jsonb("minigame_tech_upgrade_tree")
        .$type<{
            a: {
                c: number;
                d: number;
            };
            b: number;
        }>()
        .notNull()
        .default({ a: { c: 0, d: 1 }, b: 0 }),

    factory_tech_upgrade_timer: timestamp("factory_tech_upgrade_timer", {
        withTimezone: true,
    }),
    energy_generator_tech_upgrade_timer: timestamp(
        "energy_generator_tech_upgrade_timer",
        { withTimezone: true }
    ),
    rocket_tech_upgrade_timer: timestamp("rocket_tech_upgrade_timer", {
        withTimezone: true,
    }),
    mining_tech_upgrade_timer: timestamp("mining_tech_upgrade_timer", {
        withTimezone: true,
    }),
    portal_tech_upgrade_timer: timestamp("portal_tech_upgrade_timer", {
        withTimezone: true,
    }),
    general_tech_upgrade_timer: timestamp("general_tech_upgrade_timer", {
        withTimezone: true,
    }),

    minigame_tech_upgrade_timer: timestamp("minigame_tech_upgrade_timer", {
        withTimezone: true,
    }),
});

// Relations
export const labsRelations = relations(labs, ({ one }) => ({
    profile: one(mainProfiles, {
        fields: [labs.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type Lab = typeof labs.$inferSelect;
export type NewLab = typeof labs.$inferInsert;
