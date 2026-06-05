import { pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const billings = pgTable("billings", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),
});

export const invoices = pgTable("invoices", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => billings.userId),
    status: varchar("status", { length: 20 }).notNull(), // 'ongoing' or 'finished'
});

export const billingsRelations = relations(billings, ({ many }) => ({
    invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
    billing: one(billings, {
        fields: [invoices.userId],
        references: [billings.userId],
    }),
}));
