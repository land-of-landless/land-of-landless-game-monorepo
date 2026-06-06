import ProfileService from "@/services/mainProfile/ProfileService.js";
import MineDAO from "@/daos/postgres/mine.ts";
import EnergyGeneratorDAO from "@/daos/postgres/energyGenerator.ts";
import FactoryDAO from "@/daos/postgres/factory.ts";
import LabDAO from "@/daos/postgres/lab.ts";
import LaunchSiteDAO from "@/daos/postgres/launchSite.ts";
import MiniGamesDAO from "@/daos/postgres/miniGames.ts";
import StatsDAO from "@/daos/postgres/stats.ts";
import { dbLogger } from "@/utils/logger.js";

/**
 * Aggregates all profile data for a user from postgres DAOs.
 */
export default class ProfileAggregationService {
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
