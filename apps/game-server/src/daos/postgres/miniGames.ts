import { db } from "./connection.js";
import {
    miniGames,
    mg2RemainingNumbers,
    mg3BoxesState,
} from "@/models/postgres/schema.js";
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
            return await db.transaction(async tx => {
                await tx.insert(miniGames).values({
                    user_id: miniGamesData.userId,
                    mg2_target_number: miniGamesData.miniGame2?.target_number,
                    mg2_user_correct_guesses:
                        miniGamesData.miniGame2?.user_correct_guesses,
                    mg3_user_correct_guesses:
                        miniGamesData.miniGame3?.user_correct_guesses,
                    mg3_is_started: miniGamesData.miniGame3?.is_started,
                    mg4_is_started: miniGamesData.miniGame4?.is_started,
                    mg4_user_correct_guesses:
                        miniGamesData.miniGame4?.user_correct_guesses,
                });

                if (miniGamesData.miniGame2?.remaining_numbers?.length > 0) {
                    await tx.insert(mg2RemainingNumbers).values(
                        miniGamesData.miniGame2.remaining_numbers.map(
                            (num: number) => ({
                                user_id: miniGamesData.userId,
                                num,
                            })
                        )
                    );
                }

                if (miniGamesData.miniGame3?.boxes_state?.length > 0) {
                    await tx.insert(mg3BoxesState).values(
                        miniGamesData.miniGame3.boxes_state.map(
                            (state: number, index: number) => ({
                                user_id: miniGamesData.userId,
                                position: index,
                                state,
                            })
                        )
                    );
                }

                return miniGamesData;
            });
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.createMiniGamesProfile] Error for userId: ${miniGamesData.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`
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
                where: eq(miniGames.user_id, userId),
            });
            if (!res) return null;

            const mg2Nums = await db
                .select()
                .from(mg2RemainingNumbers)
                .where(eq(mg2RemainingNumbers.user_id, userId));
            const mg3States = await db
                .select()
                .from(mg3BoxesState)
                .where(eq(mg3BoxesState.user_id, userId))
                .orderBy(mg3BoxesState.position);

            return {
                userId: res.user_id,
                miniGame2: {
                    target_number: res.mg2_target_number,
                    user_correct_guesses: res.mg2_user_correct_guesses,
                    remaining_numbers: mg2Nums.map(n => n.num),
                },
                miniGame3: {
                    boxes_state: mg3States.map(s => s.state),
                    user_correct_guesses: res.mg3_user_correct_guesses,
                    is_started: res.mg3_is_started,
                },
                miniGame4: {
                    is_started: res.mg4_is_started,
                    user_correct_guesses: res.mg4_user_correct_guesses,
                },
            };
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.findMiniGamesProfileByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`
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
            return await db.transaction(async tx => {
                await tx
                    .insert(miniGames)
                    .values({
                        user_id: miniGamesProfile.userId,
                        mg2_target_number:
                            miniGamesProfile.miniGame2?.target_number,
                        mg2_user_correct_guesses:
                            miniGamesProfile.miniGame2?.user_correct_guesses,
                        mg3_user_correct_guesses:
                            miniGamesProfile.miniGame3?.user_correct_guesses,
                        mg3_is_started: miniGamesProfile.miniGame3?.is_started,
                        mg4_is_started: miniGamesProfile.miniGame4?.is_started,
                        mg4_user_correct_guesses:
                            miniGamesProfile.miniGame4?.user_correct_guesses,
                    })
                    .onConflictDoUpdate({
                        target: miniGames.user_id,
                        set: {
                            mg2_target_number:
                                miniGamesProfile.miniGame2?.target_number,
                            mg2_user_correct_guesses:
                                miniGamesProfile.miniGame2
                                    ?.user_correct_guesses,
                            mg3_user_correct_guesses:
                                miniGamesProfile.miniGame3
                                    ?.user_correct_guesses,
                            mg3_is_started:
                                miniGamesProfile.miniGame3?.is_started,
                            mg4_is_started:
                                miniGamesProfile.miniGame4?.is_started,
                            mg4_user_correct_guesses:
                                miniGamesProfile.miniGame4
                                    ?.user_correct_guesses,
                        },
                    });

                await tx
                    .delete(mg2RemainingNumbers)
                    .where(
                        eq(mg2RemainingNumbers.user_id, miniGamesProfile.userId)
                    );
                if (miniGamesProfile.miniGame2?.remaining_numbers?.length > 0) {
                    await tx.insert(mg2RemainingNumbers).values(
                        miniGamesProfile.miniGame2.remaining_numbers.map(
                            (num: number) => ({
                                user_id: miniGamesProfile.userId,
                                num,
                            })
                        )
                    );
                }

                await tx
                    .delete(mg3BoxesState)
                    .where(eq(mg3BoxesState.user_id, miniGamesProfile.userId));
                if (miniGamesProfile.miniGame3?.boxes_state?.length > 0) {
                    await tx.insert(mg3BoxesState).values(
                        miniGamesProfile.miniGame3.boxes_state.map(
                            (state: number, index: number) => ({
                                user_id: miniGamesProfile.userId,
                                position: index,
                                state,
                            })
                        )
                    );
                }

                return miniGamesProfile;
            });
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.saveMiniGamesProfile] Error for userId: ${miniGamesProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
