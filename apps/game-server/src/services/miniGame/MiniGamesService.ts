import ProfileService from "@/services/mainProfile/ProfileService.js";
import MiniGamesDAO from "@/daos/postgres/miniGames.ts";
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

/**
 * Service for MiniGames operations.
 * Backed by PostgreSQL via MiniGamesDAO (drizzle-orm).
 */
export default class MiniGamesService {
    static async runGame1(userId: string) {
        const profile = await ProfileService.getProfile(userId);
        if (!profile) throw PROFILE_NOT_FOUND;
        if (profile.energy < MINI_GAMES_INFO["miniGame1"].energy)
            throw NOT_ENOUGH_ENERGY;

        let blankSpot = -1;
        for (let i = 0; i < profile.lootBoxes.length; i++) {
            if (profile.lootBoxes[i] === "") {
                blankSpot = i;
                break;
            }
        }
        if (blankSpot === -1) throw NOT_ENOUGH_SPACE_FOR_LOOTBOX;

        await ProfileService.chargeEnergy(userId, "miniGame1");

        const randomNumber =
            Math.floor(Math.random() * SUM_OF_LOOT_BOX_CHANCES) + 1;
        let lootBoxType: MiniGamesLootBox = MiniGamesLootBoxEnum.COMMON;
        if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.common.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.common.end
        )
            lootBoxType = MiniGamesLootBoxEnum.COMMON;
        else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.uncommon.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.uncommon.end
        )
            lootBoxType = MiniGamesLootBoxEnum.UNCOMMON;
        else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.rare.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.rare.end
        )
            lootBoxType = MiniGamesLootBoxEnum.RARE;
        else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.epic.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.epic.end
        )
            lootBoxType = MiniGamesLootBoxEnum.EPIC;
        else if (
            randomNumber >= LOOT_BOX_CHANCE_RANGES.legendary.start &&
            randomNumber <= LOOT_BOX_CHANCE_RANGES.legendary.end
        )
            lootBoxType = MiniGamesLootBoxEnum.LEGENDARY;

        await ProfileService.addLootBox(userId, lootBoxType);
        return {
            success: true,
            status: MINIGAME_STATUS_SUCCESS,
            data: { randomNumber, reward: lootBoxType },
        };
    }

    static async handleGame2(
        userId: string,
        operation: MiniGamesOperation,
        userGuess?: MiniGame2Guess
    ) {
        try {
            if (operation === MINIGAME_OPERATION_START) {
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (p.miniGame2.target_number > 0)
                    throw ERRORS.VALIDATION("Mini Game 2 already in progress");
                await ProfileService.chargeEnergy(userId, "miniGame2");
                const target =
                    Math.floor(
                        Math.random() *
                            (MINIGAME_2_MAX_NUMBER - MINIGAME_2_MIN_NUMBER + 1)
                    ) + MINIGAME_2_MIN_NUMBER;
                p.miniGame2.target_number = target;
                p.miniGame2.user_correct_guesses = 0;
                p.miniGame2.remaining_numbers = [
                    MINIGAME_2_MIN_NUMBER,
                    MINIGAME_2_MAX_NUMBER,
                ];
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return { success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) throw MINIGAME_MISSING_GUESS;
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (p.miniGame2.target_number <= 0)
                    throw ERRORS.VALIDATION("Mini Game 2 has not been started");
                if (p.miniGame2.user_correct_guesses === MINIGAME_2_MAX_GUESSES)
                    throw ERRORS.VALIDATION("Game already completed");
                const target = p.miniGame2.target_number;
                let remaining = p.miniGame2.remaining_numbers;
                const median = (remaining.at(0) + remaining.at(-1)) / 2;
                let userLost = false;
                if (target > median) {
                    remaining = [Math.ceil(median), remaining.at(-1)];
                    if (userGuess === MINIGAME_2_GUESS_GREATER)
                        p.miniGame2.user_correct_guesses += 1;
                    else userLost = true;
                } else {
                    remaining = [remaining[0], Math.floor(median)];
                    if (userGuess === MINIGAME_2_GUESS_LESS)
                        p.miniGame2.user_correct_guesses += 1;
                    else userLost = true;
                }
                p.miniGame2.remaining_numbers = remaining;
                if (userLost) {
                    p.miniGame2.target_number = 0;
                    p.miniGame2.user_correct_guesses = 0;
                    p.miniGame2.remaining_numbers = [
                        MINIGAME_2_MIN_NUMBER,
                        MINIGAME_2_MAX_NUMBER,
                    ];
                }
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return {
                    status: userLost
                        ? MINIGAME_STATUS_LOST
                        : MINIGAME_STATUS_SUCCESS,
                    remainingNumbers: p.miniGame2.remaining_numbers,
                    userCorrectGuesses: p.miniGame2.user_correct_guesses,
                    targetNumber: userLost ? target : null,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (p.miniGame2.target_number <= 0)
                    throw ERRORS.VALIDATION("Mini Game 2 has not been started");
                const guesses = p.miniGame2.user_correct_guesses;
                if (guesses <= 0)
                    throw ERRORS.VALIDATION("You haven't guessed any number");
                if (guesses === 1)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.COMMON
                    );
                else if (guesses === 2)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.UNCOMMON
                    );
                else if (guesses >= 3 && guesses <= 4)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.RARE
                    );
                else if (guesses === 5)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.EPIC
                    );
                else if (guesses === 6)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.LEGENDARY
                    );
                const prevTarget = p.miniGame2.target_number;
                p.miniGame2.target_number = 0;
                p.miniGame2.user_correct_guesses = 0;
                p.miniGame2.remaining_numbers = [
                    MINIGAME_2_MIN_NUMBER,
                    MINIGAME_2_MAX_NUMBER,
                ];
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return {
                    status: MINIGAME_STATUS_SUCCESS,
                    targetNumber: prevTarget,
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

    static async handleGame3(
        userId: string,
        operation: MiniGamesOperation,
        userGuess?: number
    ) {
        try {
            if (operation === MINIGAME_OPERATION_START) {
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (p.miniGame3.is_started)
                    throw ERRORS.VALIDATION("MiniGame 3 already in progress");
                await ProfileService.chargeEnergy(userId, "miniGame3");
                const getRandomUniqueIndices = (
                    count: number,
                    min: number,
                    max: number
                ): number[] => {
                    const indices: Set<number> = new Set();
                    while (indices.size < count)
                        indices.add(
                            Math.floor(Math.random() * (max - min + 1)) + min
                        );
                    return Array.from(indices);
                };
                const boxes = Array(
                    MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE *
                        MINIGAMES_GAME3_NUMBER_OF_PHASES
                ).fill(1);
                for (let i = 0; i < MINIGAMES_GAME3_NUMBER_OF_PHASES; i++) {
                    const start = i * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE;
                    const end =
                        start + MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE - 1;
                    const badCount =
                        MINIGAMES_GAME3_HARD_PHASE_INDICES.includes(i)
                            ? MINIGAMES_GAME3_HARD_PHASE_BAD_BOXES
                            : MINIGAMES_GAME3_DEFAULT_BAD_BOXES;
                    for (const idx of getRandomUniqueIndices(
                        badCount,
                        start,
                        end
                    ))
                        boxes[idx] = 0;
                }
                p.miniGame3.boxes_state = boxes;
                p.miniGame3.user_correct_guesses = 0;
                p.miniGame3.is_started = true;
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) throw MINIGAME_MISSING_GUESS;
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (!p.miniGame3.is_started)
                    throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                if (p.miniGame3.user_correct_guesses >= 5)
                    throw ERRORS.VALIDATION("Mini Game 3 already solved");
                const phase = (p.miniGame3.user_correct_guesses || 0) + 1;
                const boxesInPhase = p.miniGame3.boxes_state.slice(
                    (phase - 1) * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE,
                    phase * MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE
                );
                const nullBoxIndexes = boxesInPhase
                    .map((b: number, i: number) => (b === 0 ? i : -1))
                    .filter((i: number) => i !== -1);
                let userLost = false;
                if (boxesInPhase[userGuess - 1] === 0) {
                    userLost = true;
                    p.miniGame3.user_correct_guesses = 0;
                    p.miniGame3.is_started = false;
                } else p.miniGame3.user_correct_guesses += 1;
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return {
                    status: userLost
                        ? MINIGAME_STATUS_LOST
                        : MINIGAME_STATUS_SUCCESS,
                    userCorrectGuesses: p.miniGame3.user_correct_guesses,
                    nullBoxIndexes,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (!p.miniGame3.is_started)
                    throw ERRORS.VALIDATION("Mini Game 3 has not been started");
                const guesses = p.miniGame3.user_correct_guesses;
                if (guesses <= 0)
                    throw ERRORS.VALIDATION("You haven't won any round");
                if (guesses === 1)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.COMMON
                    );
                else if (guesses === 2)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.UNCOMMON
                    );
                else if (guesses === 3)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.RARE
                    );
                else if (guesses === 4)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.EPIC
                    );
                else if (guesses === 5)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.LEGENDARY
                    );
                p.miniGame3.user_correct_guesses = 0;
                p.miniGame3.is_started = false;
                p.miniGame3.boxes_state = [];
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
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

    static async handleGame4(
        userId: string,
        operation: MiniGamesOperation,
        userGuess?: MiniGame4Guess
    ) {
        try {
            if (operation === MINIGAME_OPERATION_START) {
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (p.miniGame4.is_started)
                    throw ERRORS.VALIDATION("MiniGame 4 already in progress");
                await ProfileService.chargeEnergy(userId, "miniGame4");
                p.miniGame4.user_correct_guesses = 0;
                p.miniGame4.is_started = true;
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
            } else if (operation === MINIGAME_OPERATION_GUESS) {
                if (userGuess === undefined) throw MINIGAME_MISSING_GUESS;
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (!p.miniGame4.is_started)
                    throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                if (p.miniGame4.user_correct_guesses >= MINIGAME_4_MAX_POINTS)
                    throw ERRORS.VALIDATION("Mini Game 4 already solved");
                const computerMove =
                    MINIGAME_4_MOVES[
                        Math.floor(Math.random() * MINIGAME_4_MOVES.length)
                    ];
                let userLost = false;
                if (computerMove === "rock") {
                    if (userGuess === "rock")
                        p.miniGame4.user_correct_guesses +=
                            MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "paper")
                        p.miniGame4.user_correct_guesses +=
                            MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                } else if (computerMove === "paper") {
                    if (userGuess === "paper")
                        p.miniGame4.user_correct_guesses +=
                            MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "scissors")
                        p.miniGame4.user_correct_guesses +=
                            MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                } else if (computerMove === "scissors") {
                    if (userGuess === "scissors")
                        p.miniGame4.user_correct_guesses +=
                            MINIGAME_4_DRAW_POINTS;
                    else if (userGuess === "rock")
                        p.miniGame4.user_correct_guesses +=
                            MINIGAME_4_WIN_POINTS;
                    else userLost = true;
                }
                if (userLost) {
                    p.miniGame4.user_correct_guesses = 0;
                    p.miniGame4.is_started = false;
                }
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return {
                    status: userLost
                        ? MINIGAME_STATUS_LOST
                        : MINIGAME_STATUS_SUCCESS,
                    userCorrectGuesses: p.miniGame4.user_correct_guesses,
                    computerMove,
                };
            } else if (operation === MINIGAME_OPERATION_END) {
                const p =
                    await MiniGamesDAO.findMiniGamesProfileByUserId(userId);
                if (!p) throw ERRORS.NOT_FOUND("MiniGames profile not found");
                if (!p.miniGame4.is_started)
                    throw ERRORS.VALIDATION("Mini Game 4 has not been started");
                const guesses = p.miniGame4.user_correct_guesses;
                if (guesses <= 0)
                    throw ERRORS.VALIDATION("You haven't guessed any number");
                if (guesses >= 1 && guesses < 2)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.COMMON
                    );
                else if (guesses >= 2 && guesses < 4)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.UNCOMMON
                    );
                else if (guesses >= 4 && guesses < 6)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.RARE
                    );
                else if (guesses >= 6 && guesses < 8)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.EPIC
                    );
                else if (guesses === MINIGAME_4_MAX_POINTS)
                    await ProfileService.addLootBox(
                        userId,
                        MiniGamesLootBoxEnum.LEGENDARY
                    );
                p.miniGame4.user_correct_guesses = 0;
                p.miniGame4.is_started = false;
                await MiniGamesDAO.saveMiniGamesProfile(p);
                return { status: MINIGAME_STATUS_SUCCESS, success: true };
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
