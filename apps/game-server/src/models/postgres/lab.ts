import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const labs = pgTable("labs", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    level: integer("level").notNull().default(0),
    lab_upgrade_timer: timestamp("lab_upgrade_timer", { withTimezone: true }),
    factory_tech: integer("factory_tech").notNull().default(0),
    energy_generator_tech: integer("energy_generator_tech")
        .notNull()
        .default(0),
    rocket_tech: integer("rocket_tech").notNull().default(0),
    mining_tech: integer("mining_tech").notNull().default(0),
    portal_tech: integer("portal_tech").notNull().default(0),
    general_tech: integer("general_tech").notNull().default(0),
});

// Types
export type Lab = typeof labs.$inferSelect;
export type NewLab = typeof labs.$inferInsert;
