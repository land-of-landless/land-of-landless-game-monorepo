import { pgTable, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const miniGames = pgTable("mini_games", {
    userId: varchar("user_id", { length: 255 }).primaryKey(),

    // Guess the Number (miniGame2)
    mg2TargetNumber: integer("mg2_target_number"),
    mg2UserCorrectGuesses: integer("mg2_user_correct_guesses").notNull().default(0),

    // Pick the Boxes (miniGame3)
    mg3UserCorrectGuesses: integer("mg3_user_correct_guesses").notNull().default(0),
    mg3IsStarted: boolean("mg3_is_started").notNull().default(false),

    // Rock Paper Scissors (miniGame4)
    mg4IsStarted: boolean("mg4_is_started").notNull().default(false),
    mg4UserCorrectGuesses: integer("mg4_user_correct_guesses").notNull().default(0),
});

export const mg2RemainingNumbers = pgTable("mg2_remaining_numbers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => miniGames.userId),
    num: integer("num").notNull(),
});

export const mg3BoxesState = pgTable("mg3_boxes_state", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => miniGames.userId),
    position: integer("position").notNull(),
    state: integer("state").notNull(),
});

export const miniGamesRelations = relations(miniGames, ({ many }) => ({
    mg2RemainingNumbers: many(mg2RemainingNumbers),
    mg3BoxesState: many(mg3BoxesState),
}));

export const mg2RemainingNumbersRelations = relations(
    mg2RemainingNumbers,
    ({ one }) => ({
        miniGame: one(miniGames, {
            fields: [mg2RemainingNumbers.userId],
            references: [miniGames.userId],
        }),
    }),
);

export const mg3BoxesStateRelations = relations(mg3BoxesState, ({ one }) => ({
    miniGame: one(miniGames, {
        fields: [mg3BoxesState.userId],
        references: [miniGames.userId],
    }),
}));
