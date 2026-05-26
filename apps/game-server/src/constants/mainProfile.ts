/**
 * The maximum index for loot boxes in a premium user's inventory
 */
export const LOOT_BOX_MAX_INDEX_PREMIUM_USER = 5;

/**
 * The maximum index for loot boxes in a regular user's inventory
 */
export const LOOT_BOX_MAX_INDEX_REGULAR_USER = 4;

/**
 * The cooldown period for the daily reward, in hours.
 */
export const DAILY_REWARD_COOLDOWN_HOURS = 24;

/**
 * The cooldown period for the daily reward, in hours.
 */
export const DAILY_REWARD_MAX_CONSECUTIVE_HOURS = 48;

/**
 * The cooldown period for the daily reward, in hours.
 */
export const DAILY_REWARD_RESET_CYCLE_DAYS = 7;

/**
 * The amount of rewards given as a daily reward. in a weekly cycle
 */
export const DAILY_CLAIM_REWARDS: {
    [key in DailyRewardCounterKey]: {
        coins: number;
        gems: number;
    };
} = {
    day0: {
        coins: 0,
        gems: 0,
    },
    day1: {
        coins: 500,
        gems: 0,
    },
    day2: {
        coins: 1000,
        gems: 1,
    },
    day3: {
        coins: 3000,
        gems: 3,
    },
    day4: {
        coins: 5000,
        gems: 5,
    },
    day5: {
        coins: 7000,
        gems: 7,
    },
    day6: {
        coins: 9000,
        gems: 10,
    },
    day7: {
        coins: 12000,
        gems: 15,
    },
};

/**
 * The amount of gems the referrer receives when their code is used.
 */
export const REFERRAL_REFERRER_REWARD_GEMS = 10;

/**
 * The amount of coins the new user (referee) receives for using a code.
 */
export const REFERRAL_REFEREE_REWARD_COINS = 50;

export type ReferralRewards = {
    referrer: {
        coins: number;
        gems: number;
        energy: number;
    };
    referee: {
        coins: number;
        gems: number;
        energy: number;
    };
};

/**
 * rewards for referral
 */
export const REFERRAL_REWARDS: ReferralRewards = {
    referrer: {
        coins: 10000,
        gems: 10,
        energy: 4,
    },

    referee: {
        coins: 10000,
        gems: 60,
        energy: 4,
    },
};

/**
 * The base rewards a user receives.
 */
export const BASE_REWARDS = {
    coins: 25000,
    gems: 8,
    xp: 100,
    tickets: 1,
    lootBoxKeys: 0,
};

/**
 * The experience points required for each level.
 */
export const XP_PER_LEVEL = [
    150, 352, 608, 919, 1286, 1711, 2195, 2739, 3345, 4015, 4749, 5549, 6417,
    7354, 8361, 9440, 10592, 11818, 13120, 14500, 15958, 17496, 19116, 20819,
    22606, 24479, 26439, 28487, 30625, 32855, 35177, 37593, 40105, 42714, 45421,
    48228, 51136, 54146, 57260, 60480, 63806, 67240, 70784, 74439, 78206, 82087,
    86083, 90195, 94425, 100000,
];

/**
 * The number of gems a user receives per minute.
 */
export const GEMS_PER_MINUTE = 1;

export const PROFILE_MAX_NUM_OF_TRASH_TYPE_1 = 60;
export const PROFILE_MAX_NUM_OF_TRASH_TYPE_2 = 5;

/**
 * Profile name validation constants.
 */
export const PROFILE_NAME_MIN_LENGTH = 3;
export const PROFILE_NAME_MAX_LENGTH = 18;
/**
 * The regex used to validate a user's name.
 * Allows alphanumeric characters and spaces.
 */
export const PROFILE_NAME_REGEX = /^[a-zA-Z0-9 ]*$/;

/**
 * A list of names for the LOL soldiers.
 * Filtered to comply with name validation rules.
 */
export const PROFILE_DEFAULT_NAMES: string[] = [
    "Jaxx Nebula",
    "Kael Nova",
    "Rylan Zenith",
    "Zephyr Quasar",
    "Rhys Comet",
    "Nova Starfire",
    "Eris Voidwalker",
    "Lyra Astrosurge",
    "Orion Solarflare",
    "Solara Lunarshadow",
    "Astra Cosmicglow",
    "Cosmo Nebulablaze",
    "Zenith Starlancer",
    "Quasar Voidstrider",
    "Comet Astrohopper",
    "Jett Galaxyshield",
    "Blaze Cosmicrush",
    "Asher Starfall",
    "Reef Nebulastorm",
    "Talon Voidsniper",
    "Shade Starduster",
    "Echo Nebulaecho",
    "Ghost Voidwhisper",
    "Phantom Starphantom",
    "Flicker Lunarflare",
    "Sparkle Solarspark",
    "Glow Cometglow",
    "Flare Astroflare",
    "Bolt Thunderstrike",
    "Surge Energysurge",
    "Jolt Lightningjolt",
    "Spark Plasmaspark",
    "Pulse Ionicpulse",
    "Beam Photonbeam",
    "Ray Gammaray",
    "Streak Warpstreak",
    "Ember Infernoember",
    "Cinder Firecinder",
    "Scorch Solarflare",
    "Ignite Starignite",
    "Blaze Cometblaze",
    "Rex Nebula",
    "Astra Nova",
    "Quasar Blitz",
    "Comet Streak",
    "Orion Zenith",
    "Galaxy Sentinel",
    "Cosmic Conqueror",
    "Star Destroyer",
    "Void Walker",
    "Nebula Nomad",
    "Star Seeker",
    "Lunar Shadow",
    "Solar Flare",
    "Asteroid Guard",
    "Celestial Shield",
    "Galactic Gladiator",
    "Cosmic Crusader",
    "Stellar Sniper",
    "Shadow Walker",
    "Void Assassin",
    "Star Fortress",
    "Galactic Enforcer",
    "Cosmic Judge",
    "Nova Spectre",
    "Astro Hunter",
    "Comet Blaster",
    "Quasar Builder",
    "Star Healer",
    "Galaxy Mechanic",
    "Void Navigator",
    "Nebula Whisperer",
    "Cosmic Planner",
    "Stellar Mastermind",
    "Galaxy Decoder",
    "Quasar Supplier",
    "Star Provider",
    "Comet Spark",
    "Nebula Recruit",
    "Astro Initiate",
    "Quasar Novice",
    "Zero Glider",
    "Nova Burst",
    "Star Lancer",
    "Cosmic Rider",
    "Void Drifter",
    "Nebula Hopper",
    "Astro Jumper",
    "Comet Dasher",
    "Quasar Runner",
    "Lunar Strider",
    "Solar Skipper",
    "Asteroid Leaper",
    "Celestial Vaulter",
    "Galactic Sprinter",
    "Void Streaker",
    "Astro Zephyr",
    "Comet Phantom",
    "Quasar Wraith",
    "Viper-X",
    "Raptor-Prime",
    "Ursa-Major",
    "Hydra-XT",
    "Phoenix-One",
    "Titan-Alpha",
    "Minotaur-7",
    "Griffin-Delta",
    "Kraken-Zero",
    "Wyvern-Nova",
    "Chimera-Omega",
    "Basilisk-Blitz",
    "Cerberus-Guard",
    "Sphinx-Enigma",
    "Leviathan-Strike",
    "Behemoth-Crush",
    "Juggernaut-Force",
    "Goliath-Sentinel",
    "Stellaris Jax",
    "Quasar Kael",
    "Nova Rylan",
    "Comet Zephyr",
    "Galaxy Rhys",
    "Void Eris",
    "Cosmic Lyra",
    "Astro Orion",
    "Nebula Solara",
    "Lunar Astra",
    "Solar Cosmo",
    "Asteroid Zenith",
    "Celestial Quasar",
    "Galactic Comet",
    "Voidwalker Jett",
    "Starfire Blaze",
    "Nebulon Asher",
    "Astrofire Reef",
    "Cometstrike Talon",
    "Quasarguard Shade",
    "Starfall Whisper",
    "Jaxx Striker",
    "Kael Defender",
    "Rylan Guardian",
    "Zephyr Raider",
    "Rhys Warrior",
].filter(
    name =>
        name.length >= PROFILE_NAME_MIN_LENGTH &&
        name.length <= PROFILE_NAME_MAX_LENGTH &&
        PROFILE_NAME_REGEX.test(name)
);

/**
 * A list of profile picture IDs for the LOL soldiers.
 */
export const PROFILE_PFP_IDS: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

/**
 * The minimum and maximum index for profile pictures.
 */
export const PROFILE_PFP_MIN_INDEX = 1;
export const PROFILE_PFP_MAX_INDEX = PROFILE_PFP_IDS.length;

// input validation

/**
 * The valid operations for a loot box.
 */
export const LOOT_BOX_OPERATION_INPUT = [
    "start",
    "end",
    "end-with-gems",
    "end-with-key",
];

// type
export type LootBoxOperation =
    | "start"
    | "end"
    | "end-with-gems"
    | "end-with-key";

export enum LootBoxOperationEnum {
    Start = "start",
    End = "end",
    EndWithGems = "end-with-gems",
    EndWithKey = "end-with-key",
}

export type DailyRewardsClaimKey =
    | "day0"
    | "day1"
    | "day2"
    | "day3"
    | "day4"
    | "day5"
    | "day6"
    | "day7";
export type DailyRewardCounterKey =
    | "day0"
    | "day1"
    | "day2"
    | "day3"
    | "day4"
    | "day5"
    | "day6"
    | "day7";

export type LootBoxRewards = {
    coins: number;
    gems: number;
    xp: number;
    tickets: number;
    lootBoxKeys: number;
};
