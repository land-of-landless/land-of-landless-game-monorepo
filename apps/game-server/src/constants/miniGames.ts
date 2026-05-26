/**
 * mini games operations
 */
export const MINIGAME_OPERATION_START = "start";
export const MINIGAME_OPERATION_GUESS = "guess";
export const MINIGAME_OPERATION_END = "end";

export type MiniGamesOperation =
    | typeof MINIGAME_OPERATION_START
    | typeof MINIGAME_OPERATION_GUESS
    | typeof MINIGAME_OPERATION_END;

export enum MiniGamesOperationEnum {
    START = MINIGAME_OPERATION_START,
    GUESS = MINIGAME_OPERATION_GUESS,
    END = MINIGAME_OPERATION_END,
}

/**
 * loot box types:
 */
export type MiniGamesLootBox =
    | "common"
    | "uncommon"
    | "rare"
    | "epic"
    | "legendary"
    | "custom";

export enum MiniGamesLootBoxEnum {
    COMMON = "common",
    UNCOMMON = "uncommon",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary",
    CUSTOM = "custom",
}

/**
 * mini games keys
 */
export type MiniGamesKey =
    | "miniGame1"
    | "miniGame2"
    | "miniGame3"
    | "miniGame4";

export type LootBoxChances = {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
};

/**
 * sum is 100 so numbers reflect chances --> example : 50 means 50%
 */
export const LOOT_BOX_CHANCES: LootBoxChances = {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1,
};

export const SUM_OF_LOOT_BOX_CHANCES =
    LOOT_BOX_CHANCES.common +
    LOOT_BOX_CHANCES.uncommon +
    LOOT_BOX_CHANCES.rare +
    LOOT_BOX_CHANCES.epic +
    LOOT_BOX_CHANCES.legendary;

export const LOOT_BOX_CHANCE_RANGES = {
    common: {
        start: 1,
        end: LOOT_BOX_CHANCES.common,
    },
    uncommon: {
        start: LOOT_BOX_CHANCES.common + 1,
        end: LOOT_BOX_CHANCES.common + LOOT_BOX_CHANCES.uncommon,
    },
    rare: {
        start: LOOT_BOX_CHANCES.common + LOOT_BOX_CHANCES.uncommon + 1,
        end:
            LOOT_BOX_CHANCES.common +
            LOOT_BOX_CHANCES.uncommon +
            LOOT_BOX_CHANCES.rare,
    },
    epic: {
        start:
            LOOT_BOX_CHANCES.common +
            LOOT_BOX_CHANCES.uncommon +
            LOOT_BOX_CHANCES.rare +
            1,
        end:
            LOOT_BOX_CHANCES.common +
            LOOT_BOX_CHANCES.uncommon +
            LOOT_BOX_CHANCES.rare +
            LOOT_BOX_CHANCES.epic,
    },
    legendary: {
        start:
            LOOT_BOX_CHANCES.common +
            LOOT_BOX_CHANCES.uncommon +
            LOOT_BOX_CHANCES.rare +
            LOOT_BOX_CHANCES.epic +
            1,
        end:
            LOOT_BOX_CHANCES.common +
            LOOT_BOX_CHANCES.uncommon +
            LOOT_BOX_CHANCES.rare +
            LOOT_BOX_CHANCES.epic +
            LOOT_BOX_CHANCES.legendary,
    },
};

export type MiniGamesInfo = Record<
    MiniGamesKey,
    {
        numericalId: number;
        name: string;
        energy: number;
        description: string;
    }
>;

/**
 * The energy cost for each mini game.
 * - Mini Game 1 (Wheel of Fortune): Guaranteed win, costs 4 energy.
 * - Mini Game 2 (Guess the Number): 1/2 chance of losing, costs 2 energy.
 * - Mini Game 3 (Pick the Boxes): Higher chance of winning but losing is possible, costs 3 energy.
 * - Mini Game 4 (Rock Paper Scissor): 50/50 chance of winning (tie is 0.5 points), costs 2 energy.
 */
export const MINI_GAMES_INFO: MiniGamesInfo = {
    miniGame1: {
        name: "wheel of fortune",
        numericalId: 1,
        energy: 4,
        description: "",
    },
    miniGame2: {
        name: "guess the number",
        numericalId: 2,
        energy: 2,
        description: "",
    },
    miniGame3: {
        name: "pick the boxes",
        numericalId: 3,
        energy: 2,
        description: "",
    },
    miniGame4: {
        name: "rock paper scissor",
        numericalId: 4,
        energy: 2,
        description: "",
    },
};

export const MINIGAME_2_GUESS_LESS = "less";
export const MINIGAME_2_GUESS_GREATER = "greater";

export type MiniGame2Guess =
    | typeof MINIGAME_2_GUESS_LESS
    | typeof MINIGAME_2_GUESS_GREATER;
export type MiniGame4Guess = "rock" | "paper" | "scissors";

/**
 * Mini Game 2 (Guess the Number) range configuration.
 */
export const MINIGAME_2_MIN_NUMBER = 1;
export const MINIGAME_2_MAX_NUMBER = 64;
export const MINIGAME_2_MAX_GUESSES = 6;

export const MINIGAMES_GAME3_NUMBER_OF_BOXES_PER_PHASE = 4;
export const MINIGAMES_GAME3_NUMBER_OF_PHASES = 5;
/**
 * Phases (0-indexed) where the difficulty increases in Mini Game 3.
 */
export const MINIGAMES_GAME3_HARD_PHASE_INDICES = [3, 4];
export const MINIGAMES_GAME3_DEFAULT_BAD_BOXES = 2;
export const MINIGAMES_GAME3_HARD_PHASE_BAD_BOXES = 3;

export const MINIGAME_4_MOVES: MiniGame4Guess[] = ["rock", "paper", "scissors"];
export const MINIGAME_4_MAX_POINTS = 8;
export const MINIGAME_4_WIN_POINTS = 1;
export const MINIGAME_4_DRAW_POINTS = 0.5;
export const MINIGAME_4_LOSS_POINTS = 0;

/**
 * Common status responses for Mini Games.
 */
export const MINIGAME_STATUS_SUCCESS = "success";
export const MINIGAME_STATUS_LOST = "lost";

export type MiniGamesLootBoxInfo = Record<
    MiniGamesLootBox,
    {
        numericalId: number;
        name: MiniGamesLootBox;
        timeToOpenInMs: number;
        description: string;
        prizes: {
            //TODO: extend this later
            coins: number;
            gems?: number;
        };
    }
>;

export const MINI_GAMES_LOOT_BOX_INFO: MiniGamesLootBoxInfo = {
    common: {
        numericalId: 1,
        name: "common",
        timeToOpenInMs: 0.5 * 60 * 60 * 1000, // 30 minutes in ms
        description: "",
        prizes: {
            coins: 1000,
        },
    },
    uncommon: {
        numericalId: 2,
        name: "uncommon",
        timeToOpenInMs: 1 * 60 * 60 * 1000, // 1 hour in ms
        description: "",
        prizes: {
            coins: 2500,
        },
    },
    rare: {
        numericalId: 3,
        name: "rare",
        timeToOpenInMs: 2 * 60 * 60 * 1000, // 2 hours in ms
        description: "",
        prizes: {
            coins: 6000,
        },
    },
    epic: {
        numericalId: 4,
        name: "epic",
        timeToOpenInMs: 6 * 60 * 60 * 1000, // 6 hours in ms
        description: "",
        prizes: {
            coins: 40000,
        },
    },
    legendary: {
        numericalId: 5,
        name: "legendary",
        timeToOpenInMs: 12 * 60 * 60 * 1000, // 12 hours in ms
        description: "",
        prizes: {
            coins: 250000,
        },
    },
    /**
     * normally obtained in events and granted by admins
     */
    custom: {
        numericalId: 6,
        name: "custom",
        timeToOpenInMs: 24 * 60 * 60 * 1000, // 1 day in ms
        description:
            "Granted by admins and can be obtained in special in-game events",
        prizes: {
            coins: 500000,
        },
    },
};
