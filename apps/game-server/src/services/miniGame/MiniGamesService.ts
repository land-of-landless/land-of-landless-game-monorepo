import {
    MINI_GAMES_INFO,
    MiniGamesLootBoxEnum,
    MINIGAME_OPERATION_START,
    MINIGAME_OPERATION_GUESS,
    MINIGAME_OPERATION_END,
    SUM_OF_LOOT_BOX_CHANCES,
    LOOT_BOX_CHANCE_RANGES,
    MINIGAME_2_GUESS_LESS,
    MINIGAME_2_GUESS_GREATER,
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
import ProfileService from "@/services/mainProfile/ProfileService.js";
import { MiniGamesDAO } from "@/daos/postgres/miniGames.js";
import { ERRORS } from "@/common/errors/appError.js";
import _ from "lodash";
import logger from "@/utils/logger.js";

export default class MiniGamesService {
    static async runGame1(userId: string) {
        const profile = await ProfileService.getProfile(userId);
        if (!profile) throw ERRORS.NOT_FOUND("Profile not found");

        const gameInfo = (MINI_GAMES_INFO as any)["miniGame1"];
        if (profile.energy < gameInfo.energy) {
            throw ERRORS.VALIDATION("Not enough energy");
        }

        await ProfileService.chargeEnergy(userId, gameInfo.energy);

        const randomNumber = Math.floor(Math.random() * SUM_OF_LOOT_BOX_CHANCES) + 1;
        let lootBoxType: any = MiniGamesLootBoxEnum.COMMON;
        if (randomNumber >= LOOT_BOX_CHANCE_RANGES.common.start && randomNumber <= LOOT_BOX_CHANCE_RANGES.common.end) {
            lootBoxType = MiniGamesLootBoxEnum.COMMON;
        } else if (randomNumber >= LOOT_BOX_CHANCE_RANGES.uncommon.start && randomNumber <= LOOT_BOX_CHANCE_RANGES.uncommon.end) {
            lootBoxType = MiniGamesLootBoxEnum.UNCOMMON;
        } else if (randomNumber >= LOOT_BOX_CHANCE_RANGES.rare.start && randomNumber <= LOOT_BOX_CHANCE_RANGES.rare.end) {
            lootBoxType = MiniGamesLootBoxEnum.RARE;
        } else if (randomNumber >= LOOT_BOX_CHANCE_RANGES.epic.start && randomNumber <= LOOT_BOX_CHANCE_RANGES.epic.end) {
            lootBoxType = MiniGamesLootBoxEnum.EPIC;
        } else if (randomNumber >= LOOT_BOX_CHANCE_RANGES.legendary.start && randomNumber <= LOOT_BOX_CHANCE_RANGES.legendary.end) {
            lootBoxType = MiniGamesLootBoxEnum.LEGENDARY;
        }

        await ProfileService.addLootBox(userId, lootBoxType);

        return {
            success: true,
            status: MINIGAME_STATUS_SUCCESS,
            data: { randomNumber, reward: lootBoxType },
        };
    }

    static async handleGame2(userId: string, operation: string, userGuess?: any) {
        try {
            const fetchedMiniGamesProfile = await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
            if (!fetchedMiniGamesProfile) throw ERRORS.NOT_FOUND("MiniGames profile not found");

            if (operation === MINIGAME_OPERATION_START) {
                if (fetchedMiniGamesProfile.miniGame2.target_number > 0) throw ERRORS.VALIDATION("Mini Game 2 already in progress");

                await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any)["miniGame2"].energy);

                fetchedMiniGamesProfile.miniGame2.target_number = Math.floor(Math.random() * (MINIGAME_2_MAX_NUMBER - MINIGAME_2_MIN_NUMBER + 1)) + MINIGAME_2_MIN_NUMBER;
                fetchedMiniGamesProfile.miniGame2.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame2.remaining_numbers = [MINIGAME_2_MIN_NUMBER, MINIGAME_2_MAX_NUMBER];

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) throw ERRORS.VALIDATION("Missing guess");
                if (fetchedMiniGamesProfile.miniGame2.target_number <= 0) throw ERRORS.VALIDATION("Mini Game 2 has not been started");
                if (fetchedMiniGamesProfile.miniGame2.user_correct_guesses === MINIGAME_2_MAX_GUESSES) throw ERRORS.VALIDATION("Game already completed");

                const target = fetchedMiniGamesProfile.miniGame2.target_number;
                let remaining = fetchedMiniGamesProfile.miniGame2.remaining_numbers;
                const median = (remaining[0] + remaining[remaining.length - 1]) / 2;

                let userLost = false;
                if (target > median) {
                    remaining = [Math.ceil(median), remaining[remaining.length - 1]];
                    if (userGuess === MINIGAME_2_GUESS_GREATER) fetchedMiniGamesProfile.miniGame2.user_correct_guesses += 1;
                    else userLost = true;
                } else {
                    remaining = [remaining[0], Math.floor(median)];
                    if (userGuess === MINIGAME_2_GUESS_LESS) fetchedMiniGamesProfile.miniGame2.user_correct_guesses += 1;
                    else userLost = true;
                }

                fetchedMiniGamesProfile.miniGame2.remaining_numbers = remaining;
                if (userLost) {
                    fetchedMiniGamesProfile.miniGame2.target_number = 0;
                    fetchedMiniGamesProfile.miniGame2.user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame2.remaining_numbers = [MINIGAME_2_MIN_NUMBER, MINIGAME_2_MAX_NUMBER];
                }

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return {
                    status: userLost ? MINIGAME_STATUS_LOST : MINIGAME_STATUS_SUCCESS,
                    remainingNumbers: fetchedMiniGamesProfile.miniGame2.remaining_numbers,
                    userCorrectGuesses: fetchedMiniGamesProfile.miniGame2.user_correct_guesses,
                    targetNumber: userLost ? target : null,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                if (fetchedMiniGamesProfile.miniGame2.target_number <= 0) throw ERRORS.VALIDATION("Mini Game 2 has not been started");

                const correct = fetchedMiniGamesProfile.miniGame2.user_correct_guesses;
                if (correct <= 0) throw ERRORS.VALIDATION("You haven't guessed any number");

                if (correct === 1) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.COMMON);
                else if (correct === 2) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.UNCOMMON);
                else if (correct >= 3 && correct <= 4) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.RARE);
                else if (correct === 5) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.EPIC);
                else if (correct === 6) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.LEGENDARY);

                const prevTarget = fetchedMiniGamesProfile.miniGame2.target_number;
                fetchedMiniGamesProfile.miniGame2.target_number = 0;
                fetchedMiniGamesProfile.miniGame2.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame2.remaining_numbers = [MINIGAME_2_MIN_NUMBER, MINIGAME_2_MAX_NUMBER];

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: MINIGAME_STATUS_SUCCESS, targetNumber: prevTarget, success: true };
            }
            throw ERRORS.VALIDATION("Invalid operation");
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[MiniGamesService.handleGame2] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to handle game 2: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async handleGame3(userId: string, operation: string, userGuess?: number) {
        try {
            const fetchedMiniGamesProfile = await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
            if (!fetchedMiniGamesProfile) throw ERRORS.NOT_FOUND("MiniGames profile not found");

            if (operation === MINIGAME_OPERATION_START) {
                if (fetchedMiniGamesProfile.miniGame3.is_started) throw ERRORS.VALIDATION("MiniGame 3 already in progress");

                await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any)["miniGame3"].energy);

                const getRandomUniqueIndices = (count: number, min: number, max: number): number[] => {
                    const indices: Set<number> = new Set();
                    while (indices.size < count) {
                        const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
                        indices.add(randomIndex);
                    }
                    return Array.from(indices);
                };

                const state = Array(MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE * MINIGAMES_GAME3_NUMBER_OF_PHASES).fill(1);
                for (let i = 0; i < MINIGAMES_GAME3_NUMBER_OF_PHASES; i++) {
                    const start = i * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE;
                    const end = start + MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE - 1;
                    let bad = MINIGAMES_GAME3_DEFAULT_BAD_BOXES;
                    if (MINIGAMES_GAME3_HARD_PHASE_INDICES.includes(i)) bad = MINIGAMES_GAME3_HARD_PHASE_BAD_BOXES;
                    const indices = getRandomUniqueIndices(bad, start, end);
                    for (const idx of indices) state[idx] = 0;
                }

                fetchedMiniGamesProfile.miniGame3.boxes_state = state;
                fetchedMiniGamesProfile.miniGame3.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame3.is_started = true;

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) throw ERRORS.VALIDATION("Missing guess");
                if (!fetchedMiniGamesProfile.miniGame3.is_started) throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                if (fetchedMiniGamesProfile.miniGame3.user_correct_guesses >= 5) throw ERRORS.VALIDATION("Mini Game 3 already solved");

                const phase = (fetchedMiniGamesProfile.miniGame3.user_correct_guesses || 0) + 1;
                const state = fetchedMiniGamesProfile.miniGame3.boxes_state;
                const inPhase = state.slice((phase - 1) * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE, phase * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE);
                const nullIdxs = inPhase.map((box: number, idx: number) => box === 0 ? idx : -1).filter((idx: number) => idx !== -1);
                const selected = inPhase[userGuess - 1];
                let userLost = false;

                if (selected === 0) {
                    userLost = true;
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame3.is_started = false;
                } else {
                    fetchedMiniGamesProfile.miniGame3.user_correct_guesses += 1;
                }

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: userLost ? MINIGAME_STATUS_LOST : MINIGAME_STATUS_SUCCESS, userCorrectGuesses: fetchedMiniGamesProfile.miniGame3.user_correct_guesses, nullBoxIndexes: nullIdxs };
            } else if (operation === MINIGAME_OPERATION_END) {
                if (!fetchedMiniGamesProfile.miniGame3.is_started) throw ERRORS.VALIDATION("Mini Game 3 has not been started");

                const correct = fetchedMiniGamesProfile.miniGame3.user_correct_guesses;
                if (correct <= 0) throw ERRORS.VALIDATION("You haven't won any round");

                if (correct === 1) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.COMMON);
                else if (correct === 2) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.UNCOMMON);
                else if (correct === 3) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.RARE);
                else if (correct === 4) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.EPIC);
                else if (correct === 5) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.LEGENDARY);

                fetchedMiniGamesProfile.miniGame3.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame3.is_started = false;
                fetchedMiniGamesProfile.miniGame3.boxes_state = [];

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
            }
            throw ERRORS.VALIDATION("Invalid operation");
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[MiniGamesService.handleGame3] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to handle game 3: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async handleGame4(userId: string, operation: string, userGuess?: any) {
        try {
            const fetchedMiniGamesProfile = await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
            if (!fetchedMiniGamesProfile) throw ERRORS.NOT_FOUND("MiniGames profile not found");

            if (operation === MINIGAME_OPERATION_START) {
                if (fetchedMiniGamesProfile.miniGame4.is_started) throw ERRORS.VALIDATION("MiniGame 4 already in progress");

                await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any)["miniGame4"].energy);

                fetchedMiniGamesProfile.miniGame4.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame4.is_started = true;

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) throw ERRORS.VALIDATION("Missing guess");
                if (!fetchedMiniGamesProfile.miniGame4.is_started) throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                if (fetchedMiniGamesProfile.miniGame4.user_correct_guesses >= MINIGAME_4_MAX_POINTS) throw ERRORS.VALIDATION("Mini Game 4 already solved");

                const computer = MINIGAME_4_MOVES[Math.floor(Math.random() * MINIGAME_4_MOVES.length)];
                let userLost = false;

                if (computer === "rock") {
                    if (userGuess === "rock") fetchedMiniGamesProfile.miniGame4.user_correct_guesses += MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "paper") fetchedMiniGamesProfile.miniGame4.user_correct_guesses += MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                } else if (computer === "paper") {
                    if (userGuess === "paper") fetchedMiniGamesProfile.miniGame4.user_correct_guesses += MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "scissors") fetchedMiniGamesProfile.miniGame4.user_correct_guesses += MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                } else if (computer === "scissors") {
                    if (userGuess === "scissors") fetchedMiniGamesProfile.miniGame4.user_correct_guesses += MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "rock") fetchedMiniGamesProfile.miniGame4.user_correct_guesses += MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                }

                if (userLost) {
                    fetchedMiniGamesProfile.miniGame4.user_correct_guesses = 0;
                    fetchedMiniGamesProfile.miniGame4.is_started = false;
                }

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: userLost ? MINIGAME_STATUS_LOST : MINIGAME_STATUS_SUCCESS, userCorrectGuesses: fetchedMiniGamesProfile.miniGame4.user_correct_guesses, computerMove: computer };
            } else if (operation === MINIGAME_OPERATION_END) {
                if (!fetchedMiniGamesProfile.miniGame4.is_started) throw ERRORS.VALIDATION("Mini Game 4 has not been started");

                const correct = fetchedMiniGamesProfile.miniGame4.user_correct_guesses;
                if (correct <= 0) throw ERRORS.VALIDATION("You haven't won any round");

                if (correct >= 1 && correct < 2) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.COMMON);
                else if (correct >= 2 && correct < 4) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.UNCOMMON);
                else if (correct >= 4 && correct < 6) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.RARE);
                else if (correct >= 6 && correct < 8) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.EPIC);
                else if (correct === MINIGAME_4_MAX_POINTS) await ProfileService.addLootBox(userId, MiniGamesLootBoxEnum.LEGENDARY);

                fetchedMiniGamesProfile.miniGame4.user_correct_guesses = 0;
                fetchedMiniGamesProfile.miniGame4.is_started = false;

                await MiniGamesDAO.saveMiniGamesProfile(fetchedMiniGamesProfile);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
            }
            throw ERRORS.VALIDATION("Invalid operation");
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[MiniGamesService.handleGame4] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to handle game 4: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
