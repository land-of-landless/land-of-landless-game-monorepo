import { FACTORY_ITEMS_COST_INFO } from "./factory";

/**
 * The maximum number of minerals a user can have.
 */
export const MINE_MAX_MINERALS_VALUE = 500000;

/**
 * The maximum number of miners a user can have.
 */
export const MINE_MAX_MINER_COUNT = 3;

/**
 * The maximum level a single miner can be upgraded to.
 */
export const MINE_MAX_LEVEL_PER_MINER = 10;

/**
 * The base rate of mineral generation for a new miner.
 */
export const MINE_GENERATION_BASE_RATE = 10;

/**
 * The increase in mineral generation rate for each level upgrade of a miner.
 */
export const MINE_GENERATION_RATE_INCREASE_PER_LEVEL = 10;

/**
 * The mineral generation per explorer
 */
export const MINE_MINERAL_GENERATION_PER_EXPLORER = 20;

/**
 * The maximum possible mineral generation rate.
 * This is calculated based on what explorers can bring and the maximum output of all miners at their highest level.
 */
export const MINE_MAX_MINERAL_GENERATION_RATE =
    FACTORY_ITEMS_COST_INFO.explorer.maxCount *
        MINE_MINERAL_GENERATION_PER_EXPLORER +
    MINE_MAX_MINER_COUNT *
        (MINE_GENERATION_BASE_RATE +
            (MINE_MAX_LEVEL_PER_MINER - 1) *
                MINE_GENERATION_RATE_INCREASE_PER_LEVEL);

/**
 * Information about upgrading miners.
 * Each level has a cost in coins, an energy generation rate, and the time it takes to upgrade.
 */
export const MINE_UPGRADE_INFO: MINE_UPGRADE_INFO_TYPE = {
    1: {
        coinCost: 25000,
        energyGenerationRate: 10,
        time: 1 * 60 * 1000, // 1 minute
    },
    2: {
        coinCost: 55000,
        energyGenerationRate: 20,
        time: 5 * 60 * 1000, // 5 minutes
    },
    3: {
        coinCost: 120000,
        energyGenerationRate: 30,
        time: 15 * 60 * 1000, // 15 minutes
    },
    4: {
        coinCost: 250000,
        energyGenerationRate: 40,
        time: 1 * 60 * 60 * 1000, // 1 hour
    },
    5: {
        coinCost: 500000,
        energyGenerationRate: 50,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    6: {
        coinCost: 1000000,
        energyGenerationRate: 60,
        time: 8 * 60 * 60 * 1000, // 8 hours
    },
    7: {
        coinCost: 1800000,
        energyGenerationRate: 70,
        time: 1 * 24 * 60 * 60 * 1000, // 1 day
    },
    8: {
        coinCost: 2800000,
        energyGenerationRate: 80,
        time: 2 * 24 * 60 * 60 * 1000, // 2 days
    },
    9: {
        coinCost: 3900000,
        energyGenerationRate: 90,
        time: 5 * 24 * 60 * 60 * 1000, // 5 days
    },
    10: {
        coinCost: 5000000,
        energyGenerationRate: 100,
        time: 10 * 24 * 60 * 60 * 1000, // 10 days
    },
};
// input validation

// types
export type MINE_UPGRADE_LEVEL_TYPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type MINE_UPGRADE_INFO_TYPE = {
    [K in MINE_UPGRADE_LEVEL_TYPE]: {
        coinCost: number;
        energyGenerationRate: number;
        time: number; // in milliseconds
    };
};

export type MINE_MINER_ID_TYPE = 1 | 2 | 3;
