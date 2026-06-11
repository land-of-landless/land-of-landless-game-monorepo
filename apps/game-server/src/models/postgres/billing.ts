import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const billings = pgTable("billings", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    status: varchar("status", { length: 20 }).notNull(), // 'ongoing' or 'finished'
});

// Types
export type Billing = typeof billings.$inferSelect;
export type NewBilling = typeof billings.$inferInsert;
