import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const labs = pgTable("labs", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
    level: integer("level").notNull().default(0),
    labUpgradeTimer: timestamp("lab_upgrade_timer"),
    factoryTech: integer("factory_tech").notNull().default(0),
    energyGeneratorTech: integer("energy_generator_tech").notNull().default(0),
    rocketTech: integer("rocket_tech").notNull().default(0),
    miningTech: integer("mining_tech").notNull().default(0),
    portalTech: integer("portal_tech").notNull().default(0),
    generalTech: integer("general_tech").notNull().default(0),
});
