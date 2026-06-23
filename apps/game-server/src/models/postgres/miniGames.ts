import {
    pgTable,
    varchar,
    integer,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mainProfiles } from "./mainProfile.js";

export const miniGames = pgTable("mini_games", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
    updated_at: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull()
        .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),

    // Guess the Number (miniGame2)
    mg2_target_number: integer("mg2_target_number"),
    mg2_user_correct_guesses: integer("mg2_user_correct_guesses")
        .notNull()
        .default(0),
    mg2_is_started: boolean("mg2_is_started").notNull().default(false),
    mg2_remaining_numbers: integer("mg2_remaining_numbers")
        .array()
        .notNull()
        .default([0, 32]),

    // Pick the Boxes (miniGame3)
    mg3_user_correct_guesses: integer("mg3_user_correct_guesses")
        .notNull()
        .default(0),
    mg3_is_started: boolean("mg3_is_started").notNull().default(false),
    mg3_boxes_state: integer("mg3_boxes_state").array().notNull().default([]),

    // Rock Paper Scissors (miniGame4)
    mg4_is_started: boolean("mg4_is_started").notNull().default(false),
    mg4_user_correct_guesses: integer("mg4_user_correct_guesses")
        .notNull()
        .default(0),
});

// Relations
export const miniGamesRelations = relations(miniGames, ({ one }) => ({
    profile: one(mainProfiles, {
        fields: [miniGames.user_id],
        references: [mainProfiles.user_id],
    }),
}));

// Types
export type MiniGame = typeof miniGames.$inferSelect;
export type NewMiniGame = typeof miniGames.$inferInsert;
