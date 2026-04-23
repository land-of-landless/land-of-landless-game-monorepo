import ProfileService from "@/services/mainProfile/ProfileService.js";
import MiniGamesDAO from "@/daos/redis/miniGames.js";
import { LootBoxType } from "@/constants/index.js";
import { MINI_GAMES_ENERGY_COST } from "@/constants/miniGames.js";
import {
    NOT_ENOUGH_ENERGY,
    NOT_ENOUGH_SPACE_FOR_LOOTBOX,
    PROFILE_NOT_FOUND,
    MINIGAME_INVALID_OPERATION,
    MINIGAME_MISSING_GUESS,
} from "@/api/v1/errors/index.js";
import { gameLogger } from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class MiniGamesService {
    /**
     * Runs Mini Game 1 (Lootbox Spin)
     * Handles energy deduction, space validation, and reward calculation
     */
    static async runGame1(userId: string) {
        // check for the user's energy level
        const profile = await ProfileService.getProfile(userId);

        if (!profile) {
            throw PROFILE_NOT_FOUND;
        }

        if (profile.energy < MINI_GAMES_ENERGY_COST[1].energy) {
            throw NOT_ENOUGH_ENERGY;
        }

        // check if user got a blank spot in their loot boxes space
        let blankSpot = -1;
        for (let i = 0; i < profile.lootBoxes.length; i++) {
            if (profile.lootBoxes[i] === "") {
                blankSpot = i;
                break;
            }
        }

        if (blankSpot === -1) {
            throw NOT_ENOUGH_SPACE_FOR_LOOTBOX;
        }

        // Deduct energy
        await ProfileService.chargeEnergy(userId, 1);

        // Calculate reward
        const randomNumber = Math.floor(Math.random() * 27);

        let lootBoxType: LootBoxType = "COMMON";
        if (randomNumber >= 0 && randomNumber <= 15) {
            lootBoxType = "COMMON";
        } else if (randomNumber >= 16 && randomNumber <= 23) {
            lootBoxType = "UNCOMMON";
        } else if (randomNumber >= 24 && randomNumber <= 25) {
            lootBoxType = "RARE";
        } else if (randomNumber === 26) {
            lootBoxType = "EPIC";
        }

        await ProfileService.addLootBox(userId, lootBoxType);

        const result = {
            randomNumber: randomNumber,
            reward: lootBoxType,
        };

        gameLogger.info("MiniGame 1 (Lootbox) run", {
            userId,
            result,
        });

        return result;
    }

    /**
     * Handles operations for Mini Game 2
     */
    static async handleGame2(
        userId: string,
        operation: string,
        userGuess?: "less" | "greater",
    ) {
        try {
            if (operation === "start") {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame2.target_number > 0) {
                    throw ERRORS.VALIDATION("Mini Game 2 already in progress");
                }

                await ProfileService.chargeEnergy(userId, 2);

                const miniGame2_target_number = Math.ceil(Math.random() * 32);
                fetchedMiniGamesProfile.miniGame2_target_number =
                    miniGame2_target_number;
                fetchedMiniGamesProfile.miniGame2_user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame2_remaining_numbers = [1, 32];

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return { status: "success", success: true };
            } else if (operation === "guess") {
                if (userGuess === undefined) {
                    throw MINIGAME_MISSING_GUESS;
                }
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame2.target_number <= 0) {
                    throw ERRORS.VALIDATION("Mini Game 2 has not been started");
                }
                if (
                    fetchedMiniGamesProfile.miniGame2_user_correct_guesses === 5
                ) {
                    throw ERRORS.VALIDATION("Game already completed");
                }

                const miniGame2_target_number =
                    fetchedMiniGamesProfile.miniGame2.target_number;
                let miniGame2_remaining_numbers =
                    fetchedMiniGamesProfile.miniGame2.remaining_numbers;
                const median =
                    (miniGame2_remaining_numbers[0] +
                        miniGame2_remaining_numbers[1]) /
                    2;

                let user_lost = false;
                if (miniGame2_target_number > median) {
                    miniGame2_remaining_numbers = [
                        Math.ceil(median),
                        miniGame2_remaining_numbers[1],
                    ];
                    if (userGuess === "greater") {
                        fetchedMiniGamesProfile.miniGame2.user_correct_guesses += 1;
                    } else {
                        user_lost = true;
                    }
                } else {
                    miniGame2_remaining_numbers = [
                        miniGame2_remaining_numbers[0],
                        Math.floor(median),
                    ];
                    if (userGuess === "less") {
                        fetchedMiniGamesProfile.miniGame2.user_correct_guesses += 1;
                    } else {
                        user_lost = true;
                    }
                }

                fetchedMiniGamesProfile.miniGame2_remaining_numbers =
                    miniGame2_remaining_numbers;

                if (user_lost) {
                    fetchedMiniGamesProfile.miniGame2_target_number = 0;
                    fetchedMiniGamesProfile.miniGame2_user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame2_remaining_numbers = [
                        1, 32,
                    ];
                }

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return {
                    status: user_lost ? "lost" : "success",
                    remaining_numbers:
                        fetchedMiniGamesProfile.miniGame2_remaining_numbers,
                    user_correct_guesses:
                        fetchedMiniGamesProfile.miniGame2_user_correct_guesses,
                    target_number: user_lost ? miniGame2_target_number : null,
                };
            } else if (operation === "end") {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame2.target_number <= 0) {
                    throw ERRORS.VALIDATION("Mini Game 2 has not been started");
                }

                const correct_guesses =
                    fetchedMiniGamesProfile.miniGame2.user_correct_guesses;
                if (correct_guesses <= 0) {
                    throw ERRORS.VALIDATION("You haven't guessed any number");
                }

                if (correct_guesses === 1) {
                    await ProfileService.addLootBox(userId, "COMMON");
                } else if (correct_guesses === 2 || correct_guesses === 3) {
                    await ProfileService.addLootBox(userId, "UNCOMMON");
                } else if (correct_guesses === 4) {
                    await ProfileService.addLootBox(userId, "EPIC");
                } else if (correct_guesses === 5) {
                    await ProfileService.addLootBox(userId, "LEGENDARY");
                }

                const previousTargetNumber =
                    fetchedMiniGamesProfile.miniGame2_target_number;
                fetchedMiniGamesProfile.miniGame2_target_number = 0;
                fetchedMiniGamesProfile.miniGame2_user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame2_remaining_numbers = [1, 32];

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return {
                    status: "success",
                    target_number: previousTargetNumber,
                    success: true,
                };
            }

            throw MINIGAME_INVALID_OPERATION;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[MiniGamesService.handleGame2] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to handle game 2: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Handles operations for Mini Game 3
     */
    static async handleGame3(
        userId: string,
        operation: string,
        userGuess?: number,
    ) {
        try {
            if (operation === "start") {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame3_is_started) {
                    throw ERRORS.VALIDATION("MiniGame 3 already in progress");
                }

                await ProfileService.chargeEnergy(userId, 3);

                const miniGame3_boxes_state = [
                    1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
                ];
                for (let i = 1; i <= 5; i++) {
                    const randomIndex1 =
                        Math.floor(Math.random() * 4) + (i - 1) * 4;
                    miniGame3_boxes_state[randomIndex1] = 0;
                    if (i === 4 || i === 5) {
                        let randomIndex2 = randomIndex1;
                        while (randomIndex1 === randomIndex2) {
                            randomIndex2 =
                                Math.floor(Math.random() * 4) + (i - 1) * 4;
                        }
                        miniGame3_boxes_state[randomIndex2] = 0;
                    }
                }

                fetchedMiniGamesProfile.miniGame3_boxes_state =
                    miniGame3_boxes_state;
                fetchedMiniGamesProfile.miniGame3_user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame3_is_started = true;

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return { status: "success", success: true };
            } else if (operation === "guess") {
                if (userGuess === undefined) {
                    throw MINIGAME_MISSING_GUESS;
                }
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame3_is_started) {
                    throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                }

                const phase =
                    (fetchedMiniGamesProfile.miniGame3.user_correct_guesses ||
                        0) + 1;
                const miniGame3_boxes_state =
                    fetchedMiniGamesProfile.miniGame3.boxes_state || [];
                const miniGame3_boxes_in_phase = miniGame3_boxes_state.slice(
                    (phase - 1) * 4,
                    phase * 4,
                );

                const null_box_indexes = miniGame3_boxes_in_phase
                    .map((box: number, index: number) => (box === 0 ? index : -1))
                    .filter((index: number) => index !== -1);

                const selectedBox = miniGame3_boxes_in_phase[userGuess - 1];
                let user_lost = false;

                if (selectedBox === 0) {
                    user_lost = true;
                    fetchedMiniGamesProfile.miniGame3_user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame3_is_started = false;
                } else {
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses += 1;
                }

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return {
                    status: user_lost ? "lost" : "success",
                    user_correct_guesses:
                        fetchedMiniGamesProfile.miniGame3_user_correct_guesses,
                    null_box_indexes,
                };
            } else if (operation === "end") {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame3_is_started) {
                    throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                }

                const correct_guesses =
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses;
                if (correct_guesses <= 0) {
                    throw ERRORS.VALIDATION("You haven't won any round");
                }

                if (correct_guesses === 1) {
                    await ProfileService.addLootBox(userId, "COMMON");
                } else if (correct_guesses === 2) {
                    await ProfileService.addLootBox(userId, "UNCOMMON");
                } else if (correct_guesses === 3) {
                    await ProfileService.addLootBox(userId, "LEGENDARY");
                }

                fetchedMiniGamesProfile.miniGame3_user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame3_is_started = false;
                fetchedMiniGamesProfile.miniGame3_boxes_state = [];

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return { status: "success", success: true };
            }

            throw MINIGAME_INVALID_OPERATION;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[MiniGamesService.handleGame3] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to handle game 3: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Handles operations for Mini Game 4
     */
    static async handleGame4(
        userId: string,
        operation: string,
        userGuess?: "rock" | "paper" | "scissors",
    ) {
        try {
            if (operation === "start") {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame4_is_started) {
                    throw ERRORS.VALIDATION("MiniGame 4 already in progress");
                }

                await ProfileService.chargeEnergy(userId, 4);

                fetchedMiniGamesProfile.miniGame4_user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame4_is_started = true;

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return { status: "success", success: true };
            } else if (operation === "guess") {
                if (userGuess === undefined) {
                    throw MINIGAME_MISSING_GUESS;
                }
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame4_is_started) {
                    throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                }
                if (
                    fetchedMiniGamesProfile.miniGame4.user_correct_guesses >= 5
                ) {
                    throw ERRORS.VALIDATION("Mini Game 4 already solved");
                }

                const moves = ["rock", "paper", "scissors"];
                const computer_move =
                    moves[Math.floor(Math.random() * moves.length)];
                let user_lost = false;

                if (computer_move === "rock") {
                    if (userGuess === "rock")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses += 0.5;
                    else if (userGuess === "paper")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses += 1;
                    else user_lost = true;
                } else if (computer_move === "paper") {
                    if (userGuess === "paper")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses += 0.5;
                    else if (userGuess === "scissors")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses += 1;
                    else user_lost = true;
                } else if (computer_move === "scissors") {
                    if (userGuess === "scissors")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses += 0.5;
                    else if (userGuess === "rock")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses += 1;
                    else user_lost = true;
                }

                if (user_lost) {
                    fetchedMiniGamesProfile.miniGame4_user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame4_is_started = false;
                }

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return {
                    status: user_lost ? "lost" : "success",
                    user_correct_guesses:
                        fetchedMiniGamesProfile.miniGame4_user_correct_guesses,
                    computer_move,
                };
            } else if (operation === "end") {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame4_is_started) {
                    throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                }

                const correct_guesses =
                    fetchedMiniGamesProfile.miniGame4.user_correct_guesses;
                if (correct_guesses <= 0) {
                    throw ERRORS.VALIDATION("You haven't guessed any number");
                }

                if (correct_guesses >= 1 && correct_guesses < 2) {
                    await ProfileService.addLootBox(userId, "COMMON");
                } else if (correct_guesses >= 2 && correct_guesses < 4) {
                    await ProfileService.addLootBox(userId, "UNCOMMON");
                } else if (correct_guesses >= 4 && correct_guesses < 5) {
                    await ProfileService.addLootBox(userId, "EPIC");
                } else if (correct_guesses >= 5) {
                    await ProfileService.addLootBox(userId, "LEGENDARY");
                }

                fetchedMiniGamesProfile.miniGame4_user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame4_is_started = false;

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile,
                );
                return { status: "success", success: true };
            }

            throw MINIGAME_INVALID_OPERATION;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[MiniGamesService.handleGame4] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to handle game 4: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
