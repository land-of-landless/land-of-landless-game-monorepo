import { auth } from "@colyseus/auth";
import crypto from "crypto";
import _ from "lodash";
import { BillingDAO } from "@/daos/postgres/billing.js";
import { EnergyGeneratorDAO } from "@/daos/postgres/energyGenerator.js";
import { MiniGamesDAO } from "@/daos/postgres/miniGames.js";
import { MainProfileDAO } from "@/daos/postgres/mainProfile.js";
import { MineDAO } from "@/daos/postgres/mine.js";
import { FactoryDAO } from "@/daos/postgres/factory.js";
import { LaunchSiteDAO } from "@/daos/postgres/launchSite.js";
import { StatsDAO } from "@/daos/postgres/stats.js";
import { LabDAO } from "@/daos/postgres/lab.js";
import {
    PROFILE_DEFAULT_NAMES,
    PROFILE_PFP_IDS,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_1,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_2,
} from "@/constants/mainProfile.js";
import {
    ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE,
    ENERGY_GENERATOR_MAX_ENERGY_VALUE,
} from "@/constants/energyGenerator.js";
import { MINE_MAX_MINERALS_VALUE } from "@/constants/mine.js";
import {
    EMPTY_LOOT_BOXES_OPENED_BY_TYPE,
    EMPTY_LAUNCHES_BY_ITEM,
} from "@/constants/stats.js";

const generateRandomRefCode = (length: number) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * PROFILE_DEFAULT_NAMES.length);
    return PROFILE_DEFAULT_NAMES[randomIndex];
};

const generateRandomProfilePicture = () => {
    const randomIndex = Math.floor(Math.random() * PROFILE_PFP_IDS.length);
    return PROFILE_PFP_IDS[randomIndex];
};

export async function authCallback(data: any, provider: string) {
    try {
        const profile = data.profile;
        const subSha256Hash = crypto
            .createHash("sha256")
            .update(profile.sub)
            .digest("hex")
            .slice(0, 32);

        const processedUserId = subSha256Hash;
        const fetchedUser = await MainProfileDAO.findProfileByUserId(processedUserId);

        if (!_.isNil(fetchedUser)) {
            return { userId: fetchedUser.userId };
        } else {
            let generatedRefCode = "";
            while (true) {
                generatedRefCode = generateRandomRefCode(6);
                const ifUserWithRefCodeExists = await MainProfileDAO.findProfileByRefCode(generatedRefCode);
                if (_.isNull(ifUserWithRefCodeExists)) break;
            }

            const randomName = generateRandomName();
            const randomProfilePicture = generateRandomProfilePicture();
            let now = new Date();

            await BillingDAO.createBilling({
                userId: processedUserId,
                finishedInvoices: [],
                ongoingInvoices: [],
            });

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
                worker_bots: [1, 0, 0],
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
                energy_generation_rate: ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE,
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

            await MiniGamesDAO.createMiniGamesProfile({
                userId: processedUserId,
                miniGame2: {
                    target_number: 0,
                    user_correct_guesses: 0,
                    remaining_numbers: [1, 32],
                },
                miniGame3: {
                    boxes_state: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
                    user_correct_guesses: 0,
                    is_started: false,
                },
                miniGame4: {
                    is_started: false,
                    user_correct_guesses: 0,
                },
            });

            await EnergyGeneratorDAO.createEnergyGenerator({
                userId: processedUserId,
                level: 0,
                panel_count: 0,
                upgrade_timer: "",
            });

            await MineDAO.createMine({
                userId: processedUserId,
                being_upgraded_miner_id: -1,
                upgrade_timer: "",
                miners_info: {
                    miner1: { level: 0 },
                    miner2: { level: 0 },
                    miner3: { level: 0 },
                },
            });

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
                loot_boxes_opened_by_type: { ...EMPTY_LOOT_BOXES_OPENED_BY_TYPE },
                launches_total: 0,
                launches_by_item: { ...EMPTY_LAUNCHES_BY_ITEM },
            });

            return { userId: processedUserId };
        }
    } catch (error) {
        console.error(`[AuthCallbackError] Failed during authentication with provider: ${provider}.`, { error });
        throw error;
    }
}

auth.oauth.onCallback(authCallback);
