import ProfileService from "@/services/mainProfile/ProfileService.js";
import MiniGamesDAO from "@/daos/redis/miniGames.js";
import { MiniGamesLootBox } from "@/constants/index.js";
import {
    MINI_GAMES_INFO,
    MiniGamesLootBoxEnum,
    MiniGamesOperation,
    MINIGAME_OPERATION_START,
    MINIGAME_OPERATION_GUESS,
    MINIGAME_OPERATION_END,
    SUM_OF_LOOT_BOX_CHANCES,
    LOOT_BOX_CHANCE_RANGES,
    MiniGame2Guess,
    MINIGAME_2_GUESS_LESS,
    MINIGAME_2_GUESS_GREATER,
    MiniGame4Guess,
    MINIGAME_2_MIN_NUMBER,
    MINIGAME_2_MAX_NUMBER,
    MINIGAME_2_MAX_GUESSES,
    MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE,
    MINIGAMES_GAME3_NUMBER_OF_PHASES,
    MINIGAMES_GAME3_HARD_PHASE_INDICES,
    MINIGAMES_GAME3_DEFAULT_BAD_BOXES,
    MINIGAMES_GAME3_HARD_PHASE_BAD_BOXES,
    MINIGAME_4_MOVES,
    MINIGAME_4_MAX_POINTS,
    MINIGAME_4_WIN_POINTS,
    MINIGAME_4_DRAW_POINTS,
    MINIGAME_STATUS_SUCCESS,
    MINIGAME_STATUS_LOST,
} from "@/constants/miniGames.js";
import {
    NOT_ENOUGH_ENERGY,
    NOT_ENOUGH_SPACE_FOR_LOOTBOX,
    PROFILE_NOT_FOUND,
    MINIGAME_INVALID_OPERATION,
    MINIGAME_MISSING_GUESS,
} from "@/api/v1/errors/index.js";
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

        if (profile.energy < MINI_GAMES_INFO["miniGame1"].energy) {
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
        await ProfileService.chargeEnergy(userId, "miniGame1");

        // Calculate reward
        const randomNumber =
            Math.floor(Math.random() * SUM_OF_LOOT_BOX_CHANCES) + 1;

        let lootBoxType: MiniGamesLootBox = MiniGamesLootBoxEnum.COMMON;
        if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.common.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.common.end
        ) {
            lootBoxType = MiniGamesLootBoxEnum.COMMON;
        } else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.uncommon.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.uncommon.end
        ) {
            lootBoxType = MiniGamesLootBoxEnum.UNCOMMON;
        } else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.rare.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.rare.end
        ) {
            lootBoxType = MiniGamesLootBoxEnum.RARE;
        } else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.epic.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.epic.end
        ) {
            lootBoxType = MiniGamesLootBoxEnum.EPIC;
        } else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.legendary.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.legendary.end
        ) {
            lootBoxType = MiniGamesLootBoxEnum.LEGENDARY;
        }

        await ProfileService.addLootBox(userId, lootBoxType);

        // add logger later if you see any point in it

        return {
            success: true,
            status: MINIGAME_STATUS_SUCCESS,
            data: {
                randomNumber: randomNumber,
                reward: lootBoxType,
            },
        };
    }

    /**
     * Handles operations for Mini Game 2
     */
    static async handleGame2(
        userId: string,
        operation: MiniGamesOperation,
        userGuess?: MiniGame2Guess
    ) {
        try {
            if (operation === MINIGAME_OPERATION_START) {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame2.target_number > 0) {
                    throw ERRORS.VALIDATION("Mini Game 2 already in progress");
                }

                await ProfileService.chargeEnergy(userId, "miniGame2");

                const miniGame2TargetNumber =
                    Math.floor(
                        Math.random() *
                            (MINIGAME_2_MAX_NUMBER - MINIGAME_2_MIN_NUMBER + 1)
                    ) + MINIGAME_2_MIN_NUMBER;
                fetchedMiniGamesProfile.miniGame2.target_number =
                    miniGame2TargetNumber;
                fetchedMiniGamesProfile.miniGame2.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame2.remaining_numbers = [
                    MINIGAME_2_MIN_NUMBER,
                    MINIGAME_2_MAX_NUMBER,
                ];

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return { success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
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
                    fetchedMiniGamesProfile.miniGame2.user_correct_guesses ===
                    MINIGAME_2_MAX_GUESSES
                ) {
                    throw ERRORS.VALIDATION("Game already completed");
                }

                const miniGame2TargetNumber =
                    fetchedMiniGamesProfile.miniGame2.target_number;
                let miniGame2RemainingNumbers =
                    fetchedMiniGamesProfile.miniGame2.remaining_numbers;
                // median is the average of the first and last elements of remaining numbers array
                const median =
                    (miniGame2RemainingNumbers.at(0) +
                        miniGame2RemainingNumbers.at(-1)) /
                    2;

                let userLost = false;
                if (miniGame2TargetNumber > median) {
                    miniGame2RemainingNumbers = [
                        Math.ceil(median),
                        miniGame2RemainingNumbers.at(-1),
                    ];
                    if (userGuess === MINIGAME_2_GUESS_GREATER) {
                        fetchedMiniGamesProfile.miniGame2.user_correct_guesses += 1;
                    } else {
                        userLost = true;
                    }
                } else {
                    miniGame2RemainingNumbers = [
                        miniGame2RemainingNumbers[0],
                        Math.floor(median),
                    ];
                    if (userGuess === MINIGAME_2_GUESS_LESS) {
                        fetchedMiniGamesProfile.miniGame2.user_correct_guesses += 1;
                    } else {
                        userLost = true;
                    }
                }

                fetchedMiniGamesProfile.miniGame2.remaining_numbers =
                    miniGame2RemainingNumbers;

                if (userLost) {
                    fetchedMiniGamesProfile.miniGame2.target_number = 0;
                    fetchedMiniGamesProfile.miniGame2.user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame2.remaining_numbers = [
                        MINIGAME_2_MIN_NUMBER,
                        MINIGAME_2_MAX_NUMBER,
                    ];
                }

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: userLost
                        ? MINIGAME_STATUS_LOST
                        : MINIGAME_STATUS_SUCCESS,
                    remainingNumbers:
                        fetchedMiniGamesProfile.miniGame2.remaining_numbers,
                    userCorrectGuesses:
                        fetchedMiniGamesProfile.miniGame2.user_correct_guesses,
                    targetNumber: userLost ? miniGame2TargetNumber : null,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame2.target_number <= 0) {
                    throw ERRORS.VALIDATION("Mini Game 2 has not been started");
                }

                const userCorrectGuesses =
                    fetchedMiniGamesProfile.miniGame2.user_correct_guesses;
                if (userCorrectGuesses <= 0) {
                    throw ERRORS.VALIDATION("You haven't guessed any number");
                }

                // according to loot box chances from config every time the chance halves for correct guesses
                // config for loot box chances lives in constants/miniGames/LOOT_BOX_CHANCES
                if (userCorrectGuesses === 1) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.COMMON
                    );
                } else if (userCorrectGuesses === 2) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.UNCOMMON
                    );
                } else if (userCorrectGuesses >= 3 && userCorrectGuesses <= 4) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.RARE
                    );
                } else if (userCorrectGuesses === 5) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.EPIC
                    );
                } else if (userCorrectGuesses === 6) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.LEGENDARY
                    );
                }

                const previousTargetNumber =
                    fetchedMiniGamesProfile.miniGame2.target_number;
                fetchedMiniGamesProfile.miniGame2.target_number = 0;
                fetchedMiniGamesProfile.miniGame2.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame2.remaining_numbers = [
                    MINIGAME_2_MIN_NUMBER,
                    MINIGAME_2_MAX_NUMBER,
                ];

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: MINIGAME_STATUS_SUCCESS,
                    targetNumber: previousTargetNumber,
                    success: true,
                };
            }

            throw MINIGAME_INVALID_OPERATION;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[MiniGamesService.handleGame2] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to handle game 2: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Handles operations for Mini Game 3
     */
    static async handleGame3(
        userId: string,
        operation: MiniGamesOperation,
        userGuess?: number
    ) {
        try {
            if (operation === MINIGAME_OPERATION_START) {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame3.is_started) {
                    throw ERRORS.VALIDATION("MiniGame 3 already in progress");
                }

                await ProfileService.chargeEnergy(userId, "miniGame3");

                // Helper function to get unique random indices within a range
                const getRandomUniqueIndices = (
                    count: number,
                    min: number,
                    max: number
                ): number[] => {
                    const indices: Set<number> = new Set();
                    while (indices.size < count) {
                        const randomIndex =
                            Math.floor(Math.random() * (max - min + 1)) + min;
                        indices.add(randomIndex);
                    }
                    return Array.from(indices);
                };

                const miniGame3BoxesState = Array(
                    MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE *
                        MINIGAMES_GAME3_NUMBER_OF_PHASES
                ).fill(1);

                for (let i = 0; i < MINIGAMES_GAME3_NUMBER_OF_PHASES; i++) {
                    const phaseStartIndex =
                        i * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE;
                    const phaseEndIndex =
                        phaseStartIndex +
                        MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE -
                        1;

                    let badBoxesCount = MINIGAMES_GAME3_DEFAULT_BAD_BOXES;
                    if (MINIGAMES_GAME3_HARD_PHASE_INDICES.includes(i)) {
                        // Corresponds to original phases 4 and 5 (0-indexed)
                        badBoxesCount = MINIGAMES_GAME3_HARD_PHASE_BAD_BOXES;
                    }
                    const indicesToSetToZero = getRandomUniqueIndices(
                        badBoxesCount,
                        phaseStartIndex,
                        phaseEndIndex
                    );

                    for (const index of indicesToSetToZero) {
                        miniGame3BoxesState[index] = 0;
                    }
                }

                fetchedMiniGamesProfile.miniGame3.boxes_state =
                    miniGame3BoxesState;
                fetchedMiniGamesProfile.miniGame3.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame3.is_started = true;

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: MINIGAME_STATUS_SUCCESS,
                    success: true,
                };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) {
                    throw MINIGAME_MISSING_GUESS;
                }
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame3.is_started) {
                    throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                }

                if (
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses >= 5
                ) {
                    throw ERRORS.VALIDATION("Mini Game 3 already solved");
                }

                const phase =
                    (fetchedMiniGamesProfile.miniGame3.user_correct_guesses ||
                        0) + 1;

                const miniGame3BoxesState =
                    fetchedMiniGamesProfile.miniGame3.boxes_state;
                const miniGame3BoxesInPhase = miniGame3BoxesState.slice(
                    (phase - 1) * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE,
                    phase * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE
                );

                const nullBoxIndexes = miniGame3BoxesInPhase
                    .map((box: number, index: number) =>
                        box === 0 ? index : -1
                    )
                    .filter((index: number) => index !== -1);

                const selectedBox = miniGame3BoxesInPhase[userGuess - 1];
                let userLost = false;

                if (selectedBox === 0) {
                    userLost = true;
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame3.is_started = false;
                } else {
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses += 1;
                }

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: userLost
                        ? MINIGAME_STATUS_LOST
                        : MINIGAME_STATUS_SUCCESS,
                    userCorrectGuesses:
                        fetchedMiniGamesProfile.miniGame3.user_correct_guesses,
                    nullBoxIndexes,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame3.is_started) {
                    throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                }

                const correctGuesses =
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses;
                if (correctGuesses <= 0) {
                    throw ERRORS.VALIDATION("You haven't won any round");
                }

                if (correctGuesses === 1) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.COMMON
                    );
                } else if (correctGuesses === 2) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.UNCOMMON
                    );
                } else if (correctGuesses === 3) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.RARE
                    );
                } else if (correctGuesses === 4) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.EPIC
                    );
                } else if (correctGuesses === 5) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.LEGENDARY
                    );
                }

                fetchedMiniGamesProfile.miniGame3.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame3.is_started = false;
                fetchedMiniGamesProfile.miniGame3.boxes_state = [];

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: MINIGAME_STATUS_SUCCESS,
                    success: true,
                };
            }

            throw MINIGAME_INVALID_OPERATION;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[MiniGamesService.handleGame3] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to handle game 3: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Handles operations for Mini Game 4
     */
    static async handleGame4(
        userId: string,
        operation: MiniGamesOperation,
        userGuess?: MiniGame4Guess
    ) {
        try {
            if (operation === MINIGAME_OPERATION_START) {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (fetchedMiniGamesProfile.miniGame4.is_started) {
                    throw ERRORS.VALIDATION("MiniGame 4 already in progress");
                }

                await ProfileService.chargeEnergy(userId, "miniGame4");

                fetchedMiniGamesProfile.miniGame4.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame4.is_started = true;

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: MINIGAME_STATUS_SUCCESS,
                    success: true,
                };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) {
                    throw MINIGAME_MISSING_GUESS;
                }
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame4.is_started) {
                    throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                }
                if (
                    fetchedMiniGamesProfile.miniGame4.user_correct_guesses >=
                    MINIGAME_4_MAX_POINTS
                ) {
                    throw ERRORS.VALIDATION("Mini Game 4 already solved");
                }

                const computerMove =
                    MINIGAME_4_MOVES[
                        Math.floor(Math.random() * MINIGAME_4_MOVES.length)
                    ];
                let userLost = false;

                if (computerMove === "rock") {
                    if (userGuess === "rock")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses +=
                            MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "paper")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses +=
                            MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                } else if (computerMove === "paper") {
                    if (userGuess === "paper")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses +=
                            MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "scissors")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses +=
                            MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                } else if (computerMove === "scissors") {
                    if (userGuess === "scissors")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses +=
                            MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "rock")
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses +=
                            MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                }

                if (userLost) {
                    fetchedMiniGamesProfile.miniGame4.user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame4.is_started = false;
                }

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: userLost
                        ? MINIGAME_STATUS_LOST
                        : MINIGAME_STATUS_SUCCESS,
                    userCorrectGuesses:
                        fetchedMiniGamesProfile.miniGame4.user_correct_guesses,
                    computerMove,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                const fetchedMiniGamesProfile =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!fetchedMiniGamesProfile) {
                    throw ERRORS.NOT_FOUND("MiniGames profile not found");
                }
                if (!fetchedMiniGamesProfile.miniGame4.is_started) {
                    throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                }

                const correctGuesses =
                    fetchedMiniGamesProfile.miniGame4.user_correct_guesses;
                if (correctGuesses <= 0) {
                    throw ERRORS.VALIDATION("You haven't guessed any number");
                }

                // according to lootbox Chances Config
                if (correctGuesses >= 1 && correctGuesses < 2) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.COMMON
                    );
                } else if (correctGuesses >= 2 && correctGuesses < 4) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.UNCOMMON
                    );
                } else if (correctGuesses >= 4 && correctGuesses < 6) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.RARE
                    );
                } else if (correctGuesses >= 6 && correctGuesses < 8) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.EPIC
                    );
                } else if (correctGuesses === MINIGAME_4_MAX_POINTS) {
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.LEGENDARY
                    );
                }

                fetchedMiniGamesProfile.miniGame4.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame4.is_started = false;

                await MiniGamesDAO.saveMiniGamesProfile(
                    fetchedMiniGamesProfile
                );
                return {
                    status: MINIGAME_STATUS_SUCCESS,
                    success: true,
                };
            }

            throw MINIGAME_INVALID_OPERATION;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[MiniGamesService.handleGame4] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to handle game 4: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
