/**
 * The energy cost for each mini game.
 * - Mini Game 1 (Wheel of Fortune): Guaranteed win, costs 4 energy.
 * - Mini Game 2 (Guess the Number): 1/2 chance of losing, costs 2 energy.
 * - Mini Game 3 (Pick the Boxes): Higher chance of winning but losing is possible, costs 3 energy.
 * - Mini Game 4 (Rock Paper Scissor): 50/50 chance of winning (tie is 0.5 points), costs 2 energy.
 */

export const MINI_GAMES_IDS = {
    MINI_GAME_1: 1,
    MINI_GAME_2: 2,
    MINI_GAME_3: 3,
    MINI_GAME_4: 4,
} as const;

export const MINI_GAMES_OPERATIONS = {
    START: "start",
    END: "end",
    GUESS: "guess",
} as const;

export const MINI_GAMES_OPERATION_INPUTS = {
    [MINI_GAMES_OPERATIONS.START]: MINI_GAMES_OPERATIONS.START,
    [MINI_GAMES_OPERATIONS.END]: MINI_GAMES_OPERATIONS.END,
    [MINI_GAMES_OPERATIONS.GUESS]: MINI_GAMES_OPERATIONS.GUESS,
} as const;

export const MINI_GAMES_ENERGY_COST: {
    [key in MINI_GAMES_ID_TYPE]: {
        name: string;
        energy: number;
        description: string;
    };
} = {
    1: {
        name: "wheel of fortune",
        energy: 4,
        description: "",
    },
    2: {
        name: "guess the number",
        energy: 2,
        description: "",
    },
    3: {
        name: "pick the boxes",
        energy: 3,
        description: "",
    },
    4: {
        name: "rock paper scissor",
        energy: 2,
        description: "",
    },
};

// game ids

/**
 * The valid operations for a game.
 */
export const miniGamesOperationInputs = ["start", "end", "guess"];

export const miniGameLootBoxNameToNumericIdsMap: {
    [key in LootBoxType]: number;
} = {
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 3,
    EPIC: 4,
    LEGENDARY: 5,
    CUSTOM: 6,
};

// types
export type MiniGames_Operation_Type = keyof typeof MINI_GAMES_OPERATION_INPUTS;
export type MINI_GAMES_ID_TYPE = 1 | 2 | 3 | 4;

/**
 * loot box types:
 */
export type LootBoxType =
    | "COMMON"
    | "UNCOMMON"
    | "RARE"
    | "EPIC"
    | "LEGENDARY"
    | "CUSTOM";
