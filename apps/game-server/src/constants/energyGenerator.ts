/**
 * Information about the energy generator upgrade.
 * Each level has a coin cost, upgrade time, and maximum number of panels.
 */
export const ENERGY_GENERATOR_UPGRADE_INFO: EnergyGeneratorUpgradeInfoType = {
    1: {
        coinCost: 25000,
        time: 1 * 60 * 1000, // 1 minute
        maxPanels: 1,
    },
    2: {
        coinCost: 50000,
        time: 10 * 60 * 1000, // 10 minutes,
        maxPanels: 3,
    },
    3: {
        coinCost: 100000,
        time: 30 * 60 * 1000, // 30 minutes,
        maxPanels: 5,
    },
    4: {
        coinCost: 500000,
        time: 2 * 60 * 60 * 1000, // 2 hours,
        maxPanels: 7,
    },
    5: {
        coinCost: 1000000,
        time: 6 * 60 * 60 * 1000, // 6 hours,
        maxPanels: 9,
    },
    6: {
        coinCost: 5000000,
        time: 24 * 60 * 60 * 1000, // 1 day,
        maxPanels: 12,
    },
    7: {
        coinCost: 10000000,
        time: 2 * 24 * 60 * 60 * 1000, // 2 days,
        maxPanels: 14,
    },
    8: {
        coinCost: 15000000,
        time: 4 * 24 * 60 * 60 * 1000, // 4 days,
        maxPanels: 16,
    },
    9: {
        coinCost: 20000000,
        time: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxPanels: 18,
    },
    10: {
        coinCost: 25000000,
        time: 10 * 24 * 60 * 60 * 1000, // 10 days
        maxPanels: 20,
    },
};

/**
 * The cost of each panel for the energy generator.
 */
export const ENERGY_GENERATOR_COST_PER_PANEL = 400000;

/**
 * The increase in energy generation per panel.
 */
export const ENERGY_GENERATOR_INCREASE_PER_PANEL = 0.2;

/**
 * The base energy generation without a energy generator
 */
export const ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE = 1;

/**
 * the maximum value of energy for a user
 */
export const ENERGY_GENERATOR_MAX_ENERGY_VALUE = 10;

/**
 * the maximum value of energy for a user with game pass
 */
export const ENERGY_GENERATOR_MAX_ENERGY_VALUE_WITH_GAME_PASS = 12;

/**
 * The maximum level of the energy generator.
 */
export const ENERGY_GENERATOR_MAX_LEVEL = 10;

/**
 * The maximum rate at which energy can be generated.
 */
export const ENERGY_GENERATOR_MAX_ENERGY_GENERATION_RATE =
    ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE +
    ENERGY_GENERATOR_UPGRADE_INFO[10].maxPanels *
        ENERGY_GENERATOR_INCREASE_PER_PANEL;

// types
export type EnergyGeneratorLevelsType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type EnergyGeneratorUpgradeInfoType = {
    [K in EnergyGeneratorLevelsType]: {
        coinCost: number;
        time: number;
        maxPanels: number;
    };
};
