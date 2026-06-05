import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const identities = pgTable("identities", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
});

export const identityIps = pgTable("identity_ips", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => identities.userId),
    ip: varchar("ip", { length: 45 }).notNull(),
    count: integer("count").notNull().default(0),
});

export const identitiesRelations = relations(identities, ({ many }) => ({
    ips: many(identityIps),
}));

export const identityIpsRelations = relations(identityIps, ({ one }) => ({
    identity: one(identities, {
        fields: [identityIps.userId],
        references: [identities.userId],
    }),
}));
