import BillingDAO from "@/daos/redis/billing";
import EnergyGeneratorDAO from "@/daos/redis/energyGenerator";
import MiniGamesDAO from "@/daos/redis/miniGames";
import MainProfileDAO from "@/daos/redis/mainProfile";
import { auth } from "@colyseus/auth";
import _ from "lodash";
import crypto from "crypto";
import { MINE_MAX_MINERALS_VALUE } from "@/constants/mine";
import { MineDAO } from "@/daos/redis/mine";
import { FactoryDAO } from "@/daos/redis/factory";
import { LaunchSiteDAO } from "@/daos/redis/launchSite";
import StatsDAO from "@/daos/redis/stats";
import {
    EMPTY_LAUNCHES_BY_ITEM,
    EMPTY_LOOT_BOXES_OPENED_BY_TYPE,
} from "@/constants/stats";
import { LabDAO } from "@/daos/redis/lab";
import {
    PROFILE_MAX_NUM_OF_TRASH_TYPE_1,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_2,
    PROFILE_PFP_IDS,
    PROFILE_DEFAULT_NAMES,
} from "@/constants/mainProfile";
import {
    ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE,
    ENERGY_GENERATOR_MAX_ENERGY_VALUE,
} from "@/constants/index";
import { appConfig, isDevelopment } from "@/config/environment";

/**
 * This file configures the authentication layer for the application using `@colyseus/auth`.
 * It sets up OAuth providers and defines the logic to be executed when a user authenticates,
 * including creating a new user profile and all associated sub-profiles if they don't exist.
 */

// Set the OAuth callback origin based on the environment.
auth.oauth.defaults.origin = isDevelopment()
    ? appConfig.hosts.local
    : appConfig.hosts.remote;

/**
 * Configure OAuth providers.
 * Currently, only Google is enabled. Discord and Twitter (X) are commented out.
 */
// auth.oauth.addProvider("discord", {
//     key: process.env.DISCORD_CLIENT_ID,
//     secret: process.env.DISCORD_CLIENT_SECRET,
//     scope: ["identify", "email"],
// });

auth.oauth.addProvider("google", {
    // Credentials from environment variables.
    // fix line below
    key: appConfig.google.clientId,
    secret: appConfig.google.clientSecret,
    scope: ["openid"],
    // scope: ["profile", "openid"], // without email
    // scope: ["profile", "email", "openid"],
    custom_params: {
        access_type: "offline",
        approval_prompt: "auto",
        pkce: true,
        // state: true,
        // include_granted_scopes: true,
    },
});

// x strategy
// auth.oauth.addProvider("twitter", {
//     key: process.env.X_CLIENT_ID,
//     secret: process.env.X_CLIENT_SECRET,
//     // scope: ['identify', 'email'],
//     // callback: "http://localhost:2567/auth/provider/twitter",
//     custom_params: {
//         x_auth_access_type: "read",
//     },
// });

/**
 * Generates a random alphanumeric referral code of a given length.
 * @param digits - The desired length of the referral code.
 * @returns A random referral code string.
 */
const generateRandomRefCode = (digits: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let refCode = "";
    for (let i = 0; i < digits; i++) {
        refCode += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return refCode;
};

/**
 * Selects a random name from a predefined list of soldier names.
 * @returns A random name string.
 */
const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * PROFILE_DEFAULT_NAMES.length);

    return PROFILE_DEFAULT_NAMES[randomIndex];
};

/**
 * Selects a random profile picture index from a predefined list.
 * @returns A random number representing the profile picture index.
 */
const generateRandomProfilePicture = () => {
    const randomIndex = Math.floor(
        Math.random() * PROFILE_PFP_IDS.length
    );

    return PROFILE_PFP_IDS[randomIndex];
};

interface OAuthData {
    profile: {
        sub: string;
        name: string;
        picture: string;
    };
}

/**
 * Handles the logic after a user successfully authenticates with an OAuth provider.
 *
 * This function checks if the user already exists in the database.
 * If the user exists, it returns their profile.
 * If the user is new, it creates a complete set of profiles for them (main, billing, games, etc.).
 * @param data - The data returned from the OAuth provider.
 * @param provider - The name of the OAuth provider (e.g., "google").
 * @returns An object containing the user's ID.
 */
export async function authCallback(data: any, provider: string) {
    try {
        const profile = data.profile;

        // Define here to be accessible in the catch block for better logging.
        // Create a consistent, private user ID by hashing the unique identifier (`sub`) from the OAuth provider.
        const subSha256Hash: string | null = crypto
            .createHash("sha256")
            .update(profile.sub)
            .digest("hex")
            .slice(0, 32);

        const processedUserId: string = subSha256Hash;

        // Check if a user with this ID already exists.
        const fetchedUser =
            await MainProfileDAO.findProfileByUserId(processedUserId);

        if (!_.isNil(fetchedUser)) {
            // --- Existing User Login Flow ---
            // If the user exists, return their ID.
            return {
                userId: fetchedUser.userId,
            };
        } else {
            // --- New User Creation Flow ---

            // Generate a unique 6-digit referral code.

            // generate a ref code
            let generatedRefCode = "";

            while (true) {
                generatedRefCode = generateRandomRefCode(6);

                // check if it exists among other users
                const ifUserWithRefCodeExists =
                    await MainProfileDAO.findProfileByRefCode(generatedRefCode);

                // If the code is unique, break the loop.
                if (_.isNull(ifUserWithRefCodeExists)) {
                    break;
                }
            }

            //
            // Create all necessary sub-accounts for the new user.
            //

            const randomName = generateRandomName();
            const randomProfilePicture = generateRandomProfilePicture();
            let now = new Date();

            // identity profile
            // await IdentityDAO.createIdentityProfile({
            //     userId: processedUserId,
            //     ips: [],
            //     ips_count: [],
            // });

            // Create the Billing profile.
            await BillingDAO.createBilling({
                userId: processedUserId,
                finishedInvoices: [],
                ongoingInvoices: [],
                rateLimitTimePointer: now.toUTCString(),
                rateLimitCounter: 0,
            });

            // Create the main User Profile with default values.
            await MainProfileDAO.createProfile({
                name: randomName,
                userId: processedUserId,
                profilePictureIndex: randomProfilePicture,
                representedFlag: "",
                refCode: generatedRefCode,
                referredBy: "",
                referrals: 0,
                game_pass: false,
                game_pass_purchase_time: "",
                worker_bots: [1, 0, 0], // 1 in index i, means robot (i+1) is active
                lootBoxes: ["", "", "", ""],
                lootBoxesTimers: ["", "", "", ""],
                lootBoxes_opened: [0, 0, 0, 0],
                lootBoxesOpeningRate: 1,
                lootBox_keys: 0,
                tickets_type1: 0,
                tickets_type2: 0,
                xp: 0,
                coins: 0,
                gems: 100,
                energy: ENERGY_GENERATOR_MAX_ENERGY_VALUE,
                energy_generation_rate:
                    ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE,
                energy_max: ENERGY_GENERATOR_MAX_ENERGY_VALUE,
                energy_updated_at: now.toUTCString(),
                mineral: 0,
                mineral_generation_rate: 0,
                mineral_max: MINE_MAX_MINERALS_VALUE,
                mineral_updated_at: now.toUTCString(),
                atmosphere_trash_type1: PROFILE_MAX_NUM_OF_TRASH_TYPE_1,
                atmosphere_trash_type2: PROFILE_MAX_NUM_OF_TRASH_TYPE_2,
                atmosphere_trash_updated_at: now.toUTCString(),
                lastDailyRewardClaimedAt: now.toUTCString(),
                dailyRewardClaimCounter: 0,
            });

            // Create the Games profile to store mini-game states.
            await MiniGamesDAO.createMiniGamesProfile({
                userId: processedUserId,
                miniGame2: {
                    target_number: 0,
                    user_correct_guesses: 0,
                    remaining_numbers: [1, 32],
                },
                miniGame3: {
                    boxes_state: [
                        1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,
                        4,
                    ],
                    user_correct_guesses: 0,
                    is_started: false,
                },
                miniGame4: {
                    is_started: false,
                    user_correct_guesses: 0,
                },
            });

            // Create the Energy Generator profile.
            //
            //
            await EnergyGeneratorDAO.createEnergyGenerator({
                userId: processedUserId,
                level: 0,
                panel_count: 0,
                upgrade_timer: "",
            });

            // Create the Mine profile.
            //
            //
            await MineDAO.createMine({
                userId: processedUserId,
                being_upgraded_miner_id: -1,
                upgrade_timer: "",
                miners_info: {
                    miner1: {
                        level: 0,
                    },
                    miner2: {
                        level: 0,
                    },
                    miner3: {
                        level: 0,
                    },
                },
            });

            // Create the Lab profile for technology research.
            //
            //
            await LabDAO.createLab({
                userId: processedUserId,
                level: 0,
                lab_upgrade_timer: now.toUTCString(),
                energyGeneratorTech: 0,
                factoryTech: 0,
                rocketTech: 0,
                generalTech: 0,
                miningTech: 0,
                portalTech: 0,
            });

            // Create the Factory profile for building items.
            //
            //
            await FactoryDAO.createFactory({
                userId: processedUserId,
                level: 0,
                factory_upgrade_timer: now.toUTCString(),
                builder_pad_building_timers: ["", "", ""],
                builder_pad_items_being_built: ["", "", ""],
                builder_pad_items_being_built_secondary: [-1, -1, -1],
                rockets: 0,
                rocket_type: 0,
                spaceships: [-1, -1, -1],
                explorers: 0,
                satellites: 0,
                wormhole: 0,
                astroidDiggers: 0,
                cyborg: 0,
                dysonSphere: 0,
            });

            // Create the Launch Site profile.
            //
            //
            await LaunchSiteDAO.createLaunchSite({
                userId: processedUserId,
                level: 0,
                launch_site_upgrade_timer: "",
                satellites_launched: 0,
                wormholes_launched: 0,
                astroid_diggers_launched: 0,
                cyborgs_launched: 0,
                dyson_sphere_parts_launched: 0,
                satellite_timers: ["", "", ""],
                dyson_sphere_timers: ["", "", ""],
            });

            await StatsDAO.createStats({
                userId: processedUserId,
                loot_boxes_opened_total: 0,
                loot_boxes_opened_by_type: {
                    ...EMPTY_LOOT_BOXES_OPENED_BY_TYPE,
                },
                launches_total: 0,
                launches_by_item: { ...EMPTY_LAUNCHES_BY_ITEM },
            });

            return {
                userId: processedUserId,
            };
        }
    } catch (error) {
        // Log the error with more context for easier debugging.
        console.error(
            `[AuthCallbackError] Failed during authentication with provider: ${provider}.`,
            {
                error,
            }
        );

        // Re-throwing the error is important. It signals to Colyseus that authentication
        // has failed. The client will receive an authentication error instead of
        // a silent failure or a successful login with a broken user state.
        throw error;
    }
}

/**
 * Defines the callback function that is executed after a user successfully
 * authenticates with an OAuth provider.
 *
 * This function checks if the user already exists in the database.
 * If the user exists, it returns their profile.
 * If the user is new, it creates a complete set of profiles for them (main, billing, games, etc.).
 */
auth.oauth.onCallback(authCallback);
