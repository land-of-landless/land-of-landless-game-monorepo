import { LaunchSiteDAO } from "@/daos/postgres/launchSite.js";
import FactoryService from "@/services/factory/FactoryService.ts";
import LabService from "@/services/lab/LabService.ts";
import ProfileService from "@/services/mainProfile/ProfileService.ts";
import {
    LAUNCH_SITE_ITEMS_INFO,
    LAUNCHABLE_ITEMS,
    LaunchableItem,
    LAUNCH_SITE_MAX_LEVEL,
    LAUNCH_SITE_UPGRADE_INFO,
    LaunchSiteLevelIndex,
} from "@/constants/launchSite.js";
import {
    LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH,
    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH,
    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE,
} from "@/constants/launchSite.js";
import {
    LAB_ITEMS_UPGRADE_INFO,
} from "@/constants/lab.js";
import {
    PROFILE_MAX_NUM_OF_TRASH_TYPE_1,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_2,
} from "@/constants/mainProfile.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class LaunchSiteService {
    static async upgradeLaunchSiteStart(userId: string): Promise<string> {
        try {
            const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
            if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
            if (launchSiteProfile.launch_site_upgrade_timer !== "") throw ERRORS.VALIDATION("Upgrade already in progress");
            if (launchSiteProfile.level >= LAUNCH_SITE_MAX_LEVEL) throw ERRORS.VALIDATION("Max level reached");

            const newLevel = (launchSiteProfile.level + 1) as LaunchSiteLevelIndex;
            const coinsToBePaid = LAUNCH_SITE_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            launchSiteProfile.launch_site_upgrade_timer = new Date().toUTCString();
            await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
            return launchSiteProfile.launch_site_upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to start launch site upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async upgradeLaunchSiteEnd(userId: string, skipWithGem: boolean): Promise<any> {
        try {
            const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
            if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
            if (launchSiteProfile.launch_site_upgrade_timer === "") throw ERRORS.VALIDATION("Upgrade not in progress");

            const newLevel = (launchSiteProfile.level + 1) as LaunchSiteLevelIndex;
            const timeToWait = LAUNCH_SITE_UPGRADE_INFO[newLevel].time;
            const startTime = new Date(launchSiteProfile.launch_site_upgrade_timer);
            const passedTime = Date.now() - startTime.getTime();

            if (skipWithGem) {
                const remainingTime = Math.max(0, timeToWait - passedTime);
                const gemsToPay = turnTimeInMsToGemsToBePaid(remainingTime);
                await ProfileService.deductGems(userId, gemsToPay);
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            launchSiteProfile.level = newLevel;
            launchSiteProfile.launch_site_upgrade_timer = "";
            await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
            return launchSiteProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to complete launch site upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async calculateCurrentChanceOfLaunch(userId: string): Promise<number> {
        try {
            const profile = await ProfileService.getProfile(userId);
            const labProfile = await LabService.getLabProfile(userId);

            let finalCalculatedChance = LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH;
            finalCalculatedChance += Math.floor((labProfile.rocketTech / LAB_ITEMS_UPGRADE_INFO.rocketTech.maxStep) * LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH);

            const totalTrash = (profile.atmosphere_trash_type1 || 0) + (profile.atmosphere_trash_type2 || 0);
            const maxTrash = PROFILE_MAX_NUM_OF_TRASH_TYPE_1 + PROFILE_MAX_NUM_OF_TRASH_TYPE_2;

            finalCalculatedChance += Math.floor((totalTrash / maxTrash) * LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE);

            return Math.min(100, finalCalculatedChance);
        } catch (error) {
            return LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH;
        }
    }

    static async launchItem(userId: string, itemType: LaunchableItem): Promise<any> {
        try {
            const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
            if (!launchSiteProfile) throw ERRORS.NOT_FOUND("launch site not found");
            if (!LAUNCHABLE_ITEMS.includes(itemType)) throw ERRORS.VALIDATION("Invalid item type");

            const chanceOfSuccessFulLaunch = await this.calculateCurrentChanceOfLaunch(userId);
            const itemId = itemType === "asteroidDigger" ? "astroidDigger" : itemType;

            // Check max count
            const currentLaunched = (launchSiteProfile as any)[itemType === "asteroidDigger" ? "astroid_diggers_launched" : (itemType === "dysonSphere" ? "dyson_sphere_parts_launched" : (itemType === "wormhole" ? "wormholes_launched" : `${itemType}s_launched`))];
            if (currentLaunched >= (LAUNCH_SITE_ITEMS_INFO as any)[itemType].maxCount) {
                throw ERRORS.VALIDATION("Max count reached for launched item");
            }

            await FactoryService.deductItemForLaunchSite(userId, itemId as any, "beforeLaunch");

            if (Math.random() * 100 > chanceOfSuccessFulLaunch) {
                return { launchStatus: "failure", message: "bad luck! rocket exploded" };
            }

            await FactoryService.deductItemForLaunchSite(userId, itemId as any, "afterLaunch");

            if (itemType === "satellite") launchSiteProfile.satellites_launched += 1;
            else if (itemType === "wormhole") launchSiteProfile.wormholes_launched += 1;
            else if (itemType === "asteroidDigger") launchSiteProfile.astroid_diggers_launched += 1;
            else if (itemType === "cyborg") launchSiteProfile.cyborgs_launched += 1;
            else if (itemType === "dysonSphere") launchSiteProfile.dyson_sphere_parts_launched += 1;

            await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
            return { launchStatus: "success", message: "congrats! rocket launched" };
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to launch item: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
