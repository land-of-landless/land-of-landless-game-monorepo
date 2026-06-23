/**
 * WebAuthn Schema
 * Add these tables to your schema.ts file
 *
 * Usage:
 * 1. Copy the tables and relations to your schema.ts
 * 2. Create a Drizzle migration: `drizzle-kit generate`
 * 3. Run migration: `drizzle-kit migrate`
 */

import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * WebAuthn Credentials Table
 * Stores user's registered WebAuthn credentials
 */
export const webAuthnCredentials = pgTable(
  "webauthn_credentials",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    user_id: varchar("user_id", { length: 255 }).notNull(),
    // .references(() => mainProfiles.user_id) - add reference if using foreign keys

    // Credential data
    credential_id: text("credential_id").notNull().unique(),
    public_key: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    transports: jsonb("transports").default([]),

    // Metadata
    credential_name: varchar("credential_name", { length: 255 }),
    is_resident_key: boolean("is_resident_key").default(false),
    is_user_verifying: boolean("is_user_verifying").default(true),
    backup_eligible: boolean("backup_eligible").default(false),
    backup_state: boolean("backup_state").default(false),

    // Timestamps
    created_at: timestamp("created_at").notNull().defaultNow(),
    last_used_at: timestamp("last_used_at"),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("webauthn_credentials_user_id_idx").on(table.user_id),
    credentialIdIdx: index("webauthn_credentials_credential_id_idx").on(
      table.credential_id
    ),
  })
);

/**
 * WebAuthn Recovery Codes Table
 * One-time use backup codes for account recovery
 * Used primarily for admins
 */
export const webAuthnRecoveryCodes = pgTable(
  "webauthn_recovery_codes",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    user_id: varchar("user_id", { length: 255 }).notNull(),
    // .references(() => mainProfiles.user_id) - add reference if using foreign keys

    code_hash: varchar("code_hash", { length: 255 }).notNull(),
    used_at: timestamp("used_at"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("webauthn_recovery_codes_user_id_idx").on(table.user_id),
    usedIdx: index("webauthn_recovery_codes_used_at_idx").on(table.used_at),
  })
);

/**
 * Relations (optional - if using Drizzle relations)
 */
export const webAuthnCredentialsRelations = relations(
  webAuthnCredentials,
  ({ one }) => ({
    // user: one(mainProfiles, {
    //   fields: [webAuthnCredentials.user_id],
    //   references: [mainProfiles.user_id],
    // }),
  })
);

export const webAuthnRecoveryCodesRelations = relations(
  webAuthnRecoveryCodes,
  ({ one }) => ({
    // user: one(mainProfiles, {
    //   fields: [webAuthnRecoveryCodes.user_id],
    //   references: [mainProfiles.user_id],
    // }),
  })
);
