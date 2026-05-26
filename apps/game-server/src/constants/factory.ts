/**
 * The building pads for the factory.
 * Each pad has a minimum level required to unlock it.
 */
export const FACTORY_BUILDING_PADS = {
    pad1: {
        minLevel: 1,
    },
    pad2: {
        minLevel: 6,
    },
    pad3: {
        minLevel: 8,
    },
};

/**
 * Information about the factory upgrade.
 * Each level has a coin cost and an upgrade time.
 */
export const FACTORY_UPGRADE_INFO: {
    [key in FactoryLevel]: {
        coinCost: number;
        time: number;
    };
} = {
    1: {
        coinCost: 25000,
        time: 1 * 60 * 1000, // 1 minute
    },
    2: {
        coinCost: 50000,
        time: 10 * 60 * 1000, // 10 minutes
    },
    3: {
        coinCost: 100000,
        time: 30 * 60 * 1000, // 30 minutes
    },
    4: {
        coinCost: 500000,
        time: 2 * 60 * 60 * 1000, // 2 hours
    },
    5: {
        coinCost: 1000000,
        time: 6 * 60 * 60 * 1000, // 6 hours
    },
    6: {
        coinCost: 5000000,
        time: 24 * 60 * 60 * 1000, // 1 day
    },
    7: {
        coinCost: 10000000,
        time: 2 * 24 * 60 * 60 * 1000, // 2 days
    },
    8: {
        coinCost: 15000000,
        time: 4 * 24 * 60 * 60 * 1000, // 4 days
    },
    9: {
        coinCost: 20000000,
        time: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    10: {
        coinCost: 25000000,
        time: 10 * 24 * 60 * 60 * 1000, // 10 days
    },
};

// TODO: update values and consts later
/**
 * Information about the cost of factory items.
 * Each item has a coin cost, mineral cost, maximum count, and build time.
 */
export const FACTORY_ITEMS_COST_INFO: {
    [key in FactoryItem]: {
        coinCost: number;
        mineralCost: number;
        maxCount: number;
        time: number;
    };
} = {
    rocket: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 3,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    spaceship: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 3,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    explorer: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 10,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    satellite: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 3,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    wormhole: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 1,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    astroidDigger: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 5,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    cyborg: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 1,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
    dysonSphere: {
        coinCost: 50000,
        mineralCost: 0,
        maxCount: 10,
        time: 3 * 60 * 60 * 1000, // 3 hours
    },
};

/**
 * The maximum level of the factory.
 */
export const FACTORY_MAX_LEVEL = 10;

/**
 * The maximum number of building pads in the factory.
 */
export const FACTORY_MAX_BUILDING_PADS = 3;

/**
 * The secondary item IDs for the factory rocket.
 */
export const FACTORY_ROCKET_SECONDARY_ITEM_IDS: FactoryRocketSecondaryItemId[] =
    [0, 1, 2, 3];

/**
 * The secondary item IDs for the factory spaceship.
 */
export const FACTORY_SPACESHIP_SECONDARY_ITEM_IDS: FactorySpaceShipSecondaryItemId[] =
    [0, 1, 2, 3];

/**
 * The built item IDs for the factory.
 */
export const FACTORY_BUILT_ITEM_IDS: FactoryItem[] = [
    "rocket",
    "spaceship",
    "explorer",
    "satellite",
    "wormhole",
    "astroidDigger",
    "cyborg",
    "dysonSphere",
];

/**
 * The inputs for building an item.
 */
export const BUILD_ITEM_INPUTS: FactoryItem[] = [
    "rocket",
    "spaceship",
    "explorer",
    "satellite",
    "wormhole",
    "astroidDigger",
    "cyborg",
    "dysonSphere",
];

/**
 * The inputs for building a secondary item.
 */
export const SECONDARY_BUILD_ITEM_INPUTS: FactorySecondaryItemIndex[] = [
    0, 1, 2, 3,
];

/**
 * The inputs for the pad ID.
 */
export const PAD_ID_INPUTS: PadId[] = [0, 1, 2];

// types
export type FactoryItem =
    | "rocket"
    | "spaceship"
    | "explorer"
    | "satellite"
    | "wormhole"
    | "astroidDigger"
    | "cyborg"
    | "dysonSphere";

export type FactoryRocketSecondaryItemId = 0 | 1 | 2 | 3;
export type FactorySpaceShipSecondaryItemId = 0 | 1 | 2 | 3;

export type FactorySecondaryItemIndex =
    | FactoryRocketSecondaryItemId
    | FactorySpaceShipSecondaryItemId;

export type PadId = 0 | 1 | 2;

export type FactoryLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
