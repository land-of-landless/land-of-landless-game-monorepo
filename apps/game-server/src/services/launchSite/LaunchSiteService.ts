import { LaunchSiteDAO } from "@/daos/postgres/launchSite.js";
import FactoryService from "@/services/factory/FactoryService.js";
import LabService from "@/services/lab/LabService.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    LAUNCH_SITE_ITEMS_INFO,
    LAUNCH_SITE_MAX_LEVEL,
    LAUNCH_SITE_UPGRADE_INFO,
    LAUNCHABLE_ITEMS,
    LaunchableItem,
    LaunchSiteLevelIndex,
} from "@/constants/launchSite.js";
import {
    LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH,
    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH,
    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE,
} from "@/constants/index.js";
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
        const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
        if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
        // ... implementation
        await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
        return "";
    }

    static async upgradeLaunchSiteEnd(userId: string, skipWithGem: boolean): Promise<any> {
        const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
        if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
        // ... implementation
        await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
        return launchSiteProfile;
    }

    static async calculateCurrentChanceOfLaunch(userId: string): Promise<number> {
        // ... implementation
        return 100;
    }

    static async launchItem(userId: string, itemType: LaunchableItem): Promise<any> {
        const launchSiteProfile = await LaunchSiteDAO.findLaunchSiteByUserId(userId);
        if (!launchSiteProfile) throw ERRORS.NOT_FOUND("Launch site not found");
        // ... implementation
        await LaunchSiteDAO.saveLaunchSiteProfile(launchSiteProfile);
        return { launchStatus: "success" };
    }
}
