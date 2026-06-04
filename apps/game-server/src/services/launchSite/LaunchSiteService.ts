import { LaunchSite } from "@/models/redis/launchSite";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index";
import _ from "lodash";
import { launchSiteRepository } from "@/daos/redis/repositories/index";
import {
    LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH,
    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE,
    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH,
    LAUNCH_SITE_ITEMS_INFO,
    LaunchSiteLevelIndex,
    LAUNCH_SITE_MAX_LEVEL,
    LAUNCH_SITE_UPGRADE_INFO,
    LAUNCHABLE_ITEMS,
    LaunchableItem,
} from "@/constants/launchSite";
import ProfileService from "@/services/mainProfile/ProfileService";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";
import { FactoryDAO } from "@/daos/redis/factory";
import LabService from "@/services/lab/LabService";
import {
    LAB_ITEMS_UPGRADE_INFO,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_1,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_2,
} from "@/constants/index";
import FactoryService from "@/services/factory/FactoryService";
import { LaunchSiteDAO } from "@/daos/redis/launchSite";

/**
 * Service for Launch Site-related operations.
 * Handles business logic for upgrades, launch chance calculations, and launching items.
 */
export default class LaunchSiteService {
    /**
     * Starts the upgrade process for the main Launch Site building.
     */
    static async upgradeLaunchSiteStart(userId: string): Promise<string> {
        try {
            const launchSiteProfile =
                await LaunchSiteDAO.findLaunchSiteByUserId(userId);

            if (!launchSiteProfile) {
                throw ERRORS.NOT_FOUND("launchSiteProfile not found");
            }

            if (launchSiteProfile.launch_site_upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Upgrade already in progress");
            }

            if (launchSiteProfile.level === LAUNCH_SITE_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            const newLevel = (launchSiteProfile.level +
                1) as LaunchSiteLevelIndex;
            const { coinCost, mineralCost } =
                LAUNCH_SITE_UPGRADE_INFO[newLevel];

            await ProfileService.deductMineralAndCoin(
                userId,
                mineralCost,
                coinCost,
            );

            const now = new Date();
            launchSiteProfile.launch_site_upgrade_timer = now.toUTCString();

            await launchSiteRepository.save(launchSiteProfile);
            return launchSiteProfile.launch_site_upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LaunchSiteService.upgradeLaunchSiteStart] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to start launch site upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Completes the upgrade process for the main Launch Site building.
     */
    static async upgradeLaunchSiteEnd(
        userId: string,
        skipWithGem: boolean,
    ): Promise<LaunchSite> {
        try {
            const launchSiteProfile =
                await LaunchSiteDAO.findLaunchSiteByUserId(userId);

            if (!launchSiteProfile) {
                throw ERRORS.NOT_FOUND("launch site not found");
            }

            if (launchSiteProfile.launch_site_upgrade_timer === "") {
                throw ERRORS.VALIDATION("Upgrade isn't in progress");
            }

            if (launchSiteProfile.level === LAUNCH_SITE_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            const newLevel = (launchSiteProfile.level +
                1) as LaunchSiteLevelIndex;
            const timeToWait = LAUNCH_SITE_UPGRADE_INFO[newLevel].time;

            const now = new Date();
            const startTime = new Date(
                launchSiteProfile.launch_site_upgrade_timer,
            );
            const passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            if (skipWithGem) {
                if (passedTime >= timeToWait) {
                    throw ERRORS.VALIDATION("Already ended");
                }

                const remainingTime = timeToWait - passedTime;
                const gemsToBePaid = turnTimeInMsToGemsToBePaid(remainingTime);

                await ProfileService.deductGems(userId, gemsToBePaid);
            } else {
                if (passedTime < timeToWait) {
                    throw ERRORS.VALIDATION("Not enough time passed");
                }
            }

            launchSiteProfile.level = newLevel;
            launchSiteProfile.launch_site_upgrade_timer = "";

            await launchSiteRepository.save(launchSiteProfile);
            return launchSiteProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LaunchSiteService.upgradeLaunchSiteEnd] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to end launch site upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Calculates the current chance of successful launch.
     */
    static async calculateCurrentChanceOfLaunch(
        userId: string,
    ): Promise<number> {
        try {
            const profileProfile = await ProfileService.getProfile(userId);

            if (!profileProfile) {
                throw ERRORS.NOT_FOUND("Profile not found");
            }

            const labProfile = await LabService.getLabProfile(userId);

            let finalCalculatedChance = LAUNCH_SITE_BASE_CHANCE_OF_LAUNCH;

            const theAmountChanceRocketTechAdds = Math.floor(
                (labProfile.rocketTech /
                    LAB_ITEMS_UPGRADE_INFO.rocketTech.maxStep) *
                    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_ROCKET_TECH,
            );

            const theAmountChanceTrashCleaningAdds = Math.floor(
                ((profileProfile.atmosphere_trash_type1 +
                    profileProfile.atmosphere_trash_type2) /
                    (PROFILE_MAX_NUM_OF_TRASH_TYPE_1 +
                        PROFILE_MAX_NUM_OF_TRASH_TYPE_2)) *
                    LAUNCH_SITE_CHANCE_OF_SUCCESSFUL_LAUNCH_BUMP_FOR_FULL_CLEAN_ATMOSPHERE,
            );

            finalCalculatedChance += theAmountChanceRocketTechAdds;
            finalCalculatedChance += theAmountChanceTrashCleaningAdds;

            return finalCalculatedChance;
        } catch (error) {
            logger.error(
                `[LaunchSiteService.calculateCurrentChanceOfLaunch] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to calculate chance of launch: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Launches an item from the Launch Site.
     */
    static async launchItem(
        userId: string,
        itemType: LaunchableItem,
    ): Promise<{
        launchStatus: "success" | "failure";
        message?: string;
    }> {
        try {
            const launchSiteProfile =
                await LaunchSiteDAO.findLaunchSiteByUserId(userId);

            if (!launchSiteProfile) {
                throw ERRORS.NOT_FOUND("launch site not found");
            }

            if (!LAUNCHABLE_ITEMS.includes(itemType)) {
                throw ERRORS.VALIDATION("Invalid item type");
            }

            const chanceOfSuccessFulLaunch =
                await LaunchSiteService.calculateCurrentChanceOfLaunch(userId);

            switch (itemType) {
                case "satellite":
                    if (
                        launchSiteProfile.satellites_launched >=
                        LAUNCH_SITE_ITEMS_INFO["satellite"].maxCount
                    ) {
                        throw ERRORS.VALIDATION("Max count reached");
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "satellite",
                        "beforeLaunch",
                    );
                    if (Math.random() * 100 > chanceOfSuccessFulLaunch) {
                        return {
                            launchStatus: "failure",
                            message: "bad luck! rocket exploded",
                        };
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "satellite",
                        "afterLaunch",
                    );
                    launchSiteProfile.satellites_launched += 1;
                    break;
                case "wormhole":
                    if (
                        launchSiteProfile.wormholes_launched >=
                        LAUNCH_SITE_ITEMS_INFO["wormhole"].maxCount
                    ) {
                        throw ERRORS.VALIDATION("Max count reached");
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "wormhole",
                        "beforeLaunch",
                    );
                    if (Math.random() * 100 > chanceOfSuccessFulLaunch) {
                        return {
                            launchStatus: "failure",
                            message: "bad luck! rocket exploded",
                        };
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "wormhole",
                        "afterLaunch",
                    );
                    launchSiteProfile.wormholes_launched += 1;
                    break;
                case "asteroidDigger":
                    if (
                        launchSiteProfile.astroid_diggers_launched >=
                        LAUNCH_SITE_ITEMS_INFO.asteroidDigger.maxCount
                    ) {
                        throw ERRORS.VALIDATION("Max count reached");
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "astroidDigger",
                        "beforeLaunch",
                    );
                    if (Math.random() * 100 > chanceOfSuccessFulLaunch) {
                        return {
                            launchStatus: "failure",
                            message: "bad luck! rocket exploded",
                        };
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "astroidDigger",
                        "afterLaunch",
                    );
                    launchSiteProfile.astroid_diggers_launched += 1;
                    break;
                case "cyborg":
                    if (
                        launchSiteProfile.cyborgs_launched >=
                        LAUNCH_SITE_ITEMS_INFO["cyborg"].maxCount
                    ) {
                        throw ERRORS.VALIDATION("Max count reached");
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "cyborg",
                        "beforeLaunch",
                    );
                    if (Math.random() * 100 > chanceOfSuccessFulLaunch) {
                        return {
                            launchStatus: "failure",
                            message: "bad luck! rocket exploded",
                        };
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "cyborg",
                        "afterLaunch",
                    );
                    launchSiteProfile.cyborgs_launched += 1;
                    break;
                case "dysonSphere":
                    if (
                        launchSiteProfile.dyson_sphere_parts_launched >=
                        LAUNCH_SITE_ITEMS_INFO.dysonSphere.maxCount
                    ) {
                        throw ERRORS.VALIDATION("Max count reached");
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "dysonSphere",
                        "beforeLaunch",
                    );
                    if (Math.random() * 100 > chanceOfSuccessFulLaunch) {
                        return {
                            launchStatus: "failure",
                            message: "bad luck! rocket exploded",
                        };
                    }
                    await FactoryService.deductItemForLaunchSite(
                        userId,
                        "dysonSphere",
                        "afterLaunch",
                    );
                    launchSiteProfile.dyson_sphere_parts_launched += 1;
                    break;
                default:
                    throw ERRORS.VALIDATION("Invalid item type");
            }

            await launchSiteRepository.save(launchSiteProfile);
            return {
                launchStatus: "success",
                message: "congrats! rocket launched",
            };
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LaunchSiteService.launchItem] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to launch item: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
