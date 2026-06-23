import {
    integer,
    pgTable,
    timestamp,
    varchar,
    jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const billings = pgTable("billings", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),

    //example possible columns
    num_of_purchases: integer("num_of_purchases").notNull().default(0),
});

export const invoices = pgTable("billing_invoices", {
    id: varchar("id", { length: 255 }).primaryKey(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => billings.user_id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(), // 'ongoing' or 'finished'
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const donations = pgTable("donations", {
    id: varchar("id", { length: 255 }).primaryKey(), // track_id from OxaPay
    user_id: varchar("user_id", { length: 255 }).references(
        () => billings.user_id,
        { onDelete: "cascade" }
    ), // Nullable if anonymous
    amount: varchar("amount", { length: 50 }).notNull(), // e.g. amount in USD or crypto
    currency: varchar("currency", { length: 20 }).notNull(), // e.g. USDT, BTC
    status: varchar("status", { length: 20 }).notNull(), // e.g. 'paid', 'failed', 'expired', 'pending'
    tx_id: varchar("tx_id", { length: 255 }), // blockchain transaction hash
    network: varchar("network", { length: 50 }), // blockchain network (e.g. TRC20)
    payment_address: varchar("payment_address", { length: 255 }), // wallet address used
    order_id: varchar("order_id", { length: 255 }), // pass-through order_id from OxaPay
    raw_payload: jsonb("raw_payload"), // for complete debugging context
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const billingRelations = relations(billings, ({ one, many }) => ({
    profile: one(mainProfiles, {
        fields: [billings.user_id],
        references: [mainProfiles.user_id],
    }),
    invoices: many(invoices),
    donations: many(donations),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
    billing: one(billings, {
        fields: [invoices.user_id],
        references: [billings.user_id],
    }),
    profile: one(mainProfiles, {
        fields: [invoices.user_id],
        references: [mainProfiles.user_id],
    }),
}));

export const donationRelations = relations(donations, ({ one }) => ({
    billing: one(billings, {
        fields: [donations.user_id],
        references: [billings.user_id],
    }),
    profile: one(mainProfiles, {
        fields: [donations.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type Billing = typeof billings.$inferSelect;
export type NewBilling = typeof billings.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
