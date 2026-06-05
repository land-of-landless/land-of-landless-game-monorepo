import { db } from "./connection.js";
import {
    miniGames,
    mg2RemainingNumbers,
    mg3BoxesState,
} from "../models/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for MiniGames-related operations.
 * Handles database persistence and retrieval for mini-game profiles in PostgreSQL.
 */
export default class MiniGamesDAO {
    /**
     * Creates a new MiniGames profile for a user.
     * @param miniGamesData - The initial mini-games profile data.
     * @returns The created mini-games data.
     */
    static async createMiniGamesProfile(miniGamesData: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx.insert(miniGames).values({
                    userId: miniGamesData.userId,
                    mg2TargetNumber: miniGamesData.miniGame2?.target_number,
                    mg2UserCorrectGuesses: miniGamesData.miniGame2?.user_correct_guesses,
                    mg3UserCorrectGuesses: miniGamesData.miniGame3?.user_correct_guesses,
                    mg3IsStarted: miniGamesData.miniGame3?.is_started,
                    mg4IsStarted: miniGamesData.miniGame4?.is_started,
                    mg4UserCorrectGuesses: miniGamesData.miniGame4?.user_correct_guesses,
                });

                if (miniGamesData.miniGame2?.remaining_numbers?.length > 0) {
                    await tx.insert(mg2RemainingNumbers).values(
                        miniGamesData.miniGame2.remaining_numbers.map((num: number) => ({
                            userId: miniGamesData.userId,
                            num,
                        })),
                    );
                }

                if (miniGamesData.miniGame3?.boxes_state?.length > 0) {
                    await tx.insert(mg3BoxesState).values(
                        miniGamesData.miniGame3.boxes_state.map(
                            (state: number, index: number) => ({
                                userId: miniGamesData.userId,
                                position: index,
                                state,
                            }),
                        ),
                    );
                }

                return miniGamesData;
            });
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.createMiniGamesProfile] Error for userId: ${miniGamesData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a MiniGames profile by user ID.
     * @param userId - The ID of the user.
     * @returns The mini-games data if found, otherwise null.
     */
    static async findMiniGamesProfileByUserId(userId: string) {
        try {
            const res = await db.query.miniGames.findFirst({
                where: eq(miniGames.userId, userId),
            });
            if (!res) return null;

            const mg2Nums = await db
                .select()
                .from(mg2RemainingNumbers)
                .where(eq(mg2RemainingNumbers.userId, userId));
            const mg3States = await db
                .select()
                .from(mg3BoxesState)
                .where(eq(mg3BoxesState.userId, userId))
                .orderBy(mg3BoxesState.position);

            return {
                userId: res.userId,
                miniGame2: {
                    target_number: res.mg2TargetNumber,
                    user_correct_guesses: res.mg2UserCorrectGuesses,
                    remaining_numbers: mg2Nums.map((n) => n.num),
                },
                miniGame3: {
                    boxes_state: mg3States.map((s) => s.state),
                    user_correct_guesses: res.mg3UserCorrectGuesses,
                    is_started: res.mg3IsStarted,
                },
                miniGame4: {
                    is_started: res.mg4IsStarted,
                    user_correct_guesses: res.mg4UserCorrectGuesses,
                },
            };
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.findMiniGamesProfileByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves (upserts) a MiniGames profile.
     * @param miniGamesProfile - The mini-games profile data to save.
     * @returns The saved mini-games data.
     */
    static async saveMiniGamesProfile(miniGamesProfile: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx
                    .insert(miniGames)
                    .values({
                        userId: miniGamesProfile.userId,
                        mg2TargetNumber: miniGamesProfile.miniGame2?.target_number,
                        mg2UserCorrectGuesses:
                            miniGamesProfile.miniGame2?.user_correct_guesses,
                        mg3UserCorrectGuesses:
                            miniGamesProfile.miniGame3?.user_correct_guesses,
                        mg3IsStarted: miniGamesProfile.miniGame3?.is_started,
                        mg4IsStarted: miniGamesProfile.miniGame4?.is_started,
                        mg4UserCorrectGuesses:
                            miniGamesProfile.miniGame4?.user_correct_guesses,
                    })
                    .onConflictDoUpdate({
                        target: miniGames.userId,
                        set: {
                            mg2TargetNumber: miniGamesProfile.miniGame2?.target_number,
                            mg2UserCorrectGuesses:
                                miniGamesProfile.miniGame2?.user_correct_guesses,
                            mg3UserCorrectGuesses:
                                miniGamesProfile.miniGame3?.user_correct_guesses,
                            mg3IsStarted: miniGamesProfile.miniGame3?.is_started,
                            mg4IsStarted: miniGamesProfile.miniGame4?.is_started,
                            mg4UserCorrectGuesses:
                                miniGamesProfile.miniGame4?.user_correct_guesses,
                        },
                    });

                await tx
                    .delete(mg2RemainingNumbers)
                    .where(eq(mg2RemainingNumbers.userId, miniGamesProfile.userId));
                if (miniGamesProfile.miniGame2?.remaining_numbers?.length > 0) {
                    await tx.insert(mg2RemainingNumbers).values(
                        miniGamesProfile.miniGame2.remaining_numbers.map((num: number) => ({
                            userId: miniGamesProfile.userId,
                            num,
                        })),
                    );
                }

                await tx
                    .delete(mg3BoxesState)
                    .where(eq(mg3BoxesState.userId, miniGamesProfile.userId));
                if (miniGamesProfile.miniGame3?.boxes_state?.length > 0) {
                    await tx.insert(mg3BoxesState).values(
                        miniGamesProfile.miniGame3.boxes_state.map(
                            (state: number, index: number) => ({
                                userId: miniGamesProfile.userId,
                                position: index,
                                state,
                            }),
                        ),
                    );
                }

                return miniGamesProfile;
            });
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.saveMiniGamesProfile] Error for userId: ${miniGamesProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
