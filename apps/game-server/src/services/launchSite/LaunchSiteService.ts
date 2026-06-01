import { LaunchSiteDAO } from "@/daos/postgres/launchSite.js";
import FactoryService from "@/services/factory/FactoryService.ts";
import LabService from "@/services/lab/LabService.ts";
import ProfileService from "@/services/mainProfile/ProfileService.ts";
import {
    LAUNCH_SITE_ITEMS_INFO,
    LAUNCHABLE_ITEMS,
    LaunchableItem,
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
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class LaunchSiteService {
    static async upgradeLaunchSiteStart(userId: string): Promise<string> {
        const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
        if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
        await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
        return "";
    }

    static async upgradeLaunchSiteEnd(userId: string, skipWithGem: boolean): Promise<any> {
        const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
        if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
        await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
        return launchSiteProfile;
    }

    static async calculateCurrentChanceOfLaunch(userId: string): Promise<number> {
        try {
            const profile = await ProfileService.getProfile(userId);
            const labProfile = await LabService.getLabProfile(userId);

            let finalCalculatedChance = LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH;
            finalCalculatedChance += Math.floor((labProfile.rocketTech / LAB_ITEMS_UPGRADE_INFO.rocketTech.maxStep) * LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH);
            finalCalculatedChance += Math.floor(((profile.atmosphere_trash_type1 + profile.atmosphere_trash_type2) / (PROFILE_MAX_NUM_OF_TRASH_TYPE_1 + PROFILE_MAX_NUM_OF_TRASH_TYPE_2)) * LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE);

            return finalCalculatedChance;
        } catch (error) {
            return 100;
        }
    }

    static async launchItem(userId: string, itemType: LaunchableItem): Promise<any> {
        try {
            const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
            if (!launchSiteProfile) throw ERRORS.NOT_FOUND("launch site not found");
            if (!LAUNCHABLE_ITEMS.includes(itemType)) throw ERRORS.VALIDATION("Invalid item type");

            const chanceOfSuccessFulLaunch = await this.calculateCurrentChanceOfLaunch(userId);
            const itemId = itemType === "asteroidDigger" ? "astroidDigger" : itemType;

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
            throw error;
        }
    }
}
