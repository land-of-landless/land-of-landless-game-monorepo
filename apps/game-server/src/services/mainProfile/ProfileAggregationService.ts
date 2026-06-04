import ProfileService from "@/services/mainProfile/ProfileService";
import { MineDAO } from "@/daos/redis/mine";
import EnergyGeneratorDAO from "@/daos/redis/energyGenerator";
import { FactoryDAO } from "@/daos/redis/factory";
import { LabDAO } from "@/daos/redis/lab";
import { LaunchSiteDAO } from "@/daos/redis/launchSite";
import MiniGamesDAO from "@/daos/redis/miniGames";
import StatsDAO from "@/daos/redis/stats";
import { dbLogger } from "@/utils/logger";

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
