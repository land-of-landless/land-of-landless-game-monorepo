import ProfileService from "@/services/mainProfile/ProfileService.js";
import { MineDAO } from "@/daos/redis/mine.js";
import EnergyGeneratorDAO from "@/daos/redis/energyGenerator.js";
import { FactoryDAO } from "@/daos/redis/factory.js";
import { LabDAO } from "@/daos/redis/lab.js";
import { LaunchSiteDAO } from "@/daos/redis/launchSite.js";
import MiniGamesDAO from "@/daos/redis/miniGames.js";
import StatsDAO from "@/daos/redis/stats.js";
import { dbLogger } from "@/utils/logger.js";

export default class ProfileAggregationService {
    /**
     * Aggregates all profile data for a user from various DAOs
     * @param userId - The ID of the user
     * @returns Object containing all profile related data
     */
    static async getAllProfilesForUser(userId: string) {
        dbLogger.debug("Aggregating profiles", { userId });
        const [
            mainProfile,
            mine,
            energyGenerator,
            factory,
            lab,
            launchSite,
            miniGames,
            stats,
        ] = await Promise.all([
            ProfileService.getProfile(userId),
            MineDAO.findMineByUserId(userId),
            EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId),
            FactoryDAO.findFactoryByUserId(userId),
            LabDAO.findLabByUserId(userId),
            LaunchSiteDAO.findLaunchSiteByUserId(userId),
            MiniGamesDAO.findMiniGamesProfileByUserId(userId),
            StatsDAO.findStatsByUserId(userId),
        ]);

        return {
            mainProfile,
            mine,
            energyGenerator,
            factory,
            lab,
            launchSite,
            miniGames,
            stats,
        };
    }
}
