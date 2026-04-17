/**
 * The maximum level a Launch Site can be upgraded to.
 */
export const LAUNCH_SITE_MAX_LEVEL = 10;

export const LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH = 75;

export const LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH = 10;
export const LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE = 10;

/**
 * Defines the cost and time required for each level upgrade of the Launch Site.
 * The key represents the target level of the upgrade.
 */
export const LAUNCH_SITE_UPGRADE_INFO: {
    [key in LAUNCH_SITE_LEVELS_INDEX]: {
        mineralCost: number;
        coinCost: number;
        time: number;
    };
} = {
    1: {
        mineralCost: 0,
        coinCost: 25000,
        time: 1 * 60 * 1000, // 1 minute
    },
    2: {
        mineralCost: 0,
        coinCost: 50000,
        time: 10 * 60 * 1000, // 10 minutes
    },
    3: {
        mineralCost: 0,
        coinCost: 100000,
        time: 30 * 60 * 1000, // 30 minutes
    },
    4: {
        mineralCost: 0,
        coinCost: 500000,
        time: 2 * 60 * 60 * 1000, // 2 hours
    },
    5: {
        mineralCost: 0,
        coinCost: 1000000,
        time: 6 * 60 * 60 * 1000, // 6 hours
    },
    6: {
        mineralCost: 0,
        coinCost: 5000000,
        time: 24 * 60 * 60 * 1000, // 1 day
    },

    7: {
        mineralCost: 0,
        coinCost: 10000000,
        time: 2 * 24 * 60 * 60 * 1000, // 2 days
    },

    8: {
        mineralCost: 0,
        coinCost: 15000000,
        time: 4 * 24 * 60 * 60 * 1000, // 4 days
    },

    9: {
        mineralCost: 0,
        coinCost: 20000000,
        time: 7 * 24 * 60 * 60 * 1000, // 7 days
    },

    10: {
        mineralCost: 0,
        coinCost: 25000000,
        time: 10 * 24 * 60 * 60 * 1000, // 10 days
    },
};

// types
/**
 * Represents the possible levels for a Launch Site upgrade.
 */
export type LAUNCH_SITE_LEVELS_INDEX = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * A list of all items that can be launched from the Launch Site.
 */
export const LAUNCHABLE_ITEMS = [
    "satellite",
    "wormhole",
    "astroid_digger",
    "cyborg",
    "dyson_sphere",
] as const;

export const LAUNCH_SITE_ITEMS_INFO: {
    [key in LaunchableItem]: {
        maxCount: number;
        expiresIn?: number;
    };
} = {
    satellite: {
        maxCount: 20,
        expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 day
    },
    wormhole: {
        maxCount: 5,
    },
    astroid_digger: {
        maxCount: 5,
    },
    cyborg: {
        maxCount: 5,
    },
    dyson_sphere: {
        maxCount: 10,
        expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 day
    },
};

/**
 * Represents a type for the items that can be launched.
 */
export type LaunchableItem = (typeof LAUNCHABLE_ITEMS)[number];
