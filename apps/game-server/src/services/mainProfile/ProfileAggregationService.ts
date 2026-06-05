import ProfileService from "@/services/mainProfile/ProfileService.js";
import MineDAO from "@/daos/mine.js";
import EnergyGeneratorDAO from "@/daos/energyGenerator.js";
import FactoryDAO from "@/daos/factory.js";
import LabDAO from "@/daos/lab.js";
import LaunchSiteDAO from "@/daos/launchSite.js";
import MiniGamesDAO from "@/daos/miniGames.js";
import StatsDAO from "@/daos/stats.js";
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

        return { mainProfile, mine, energyGenerator, factory, lab, launchSite, miniGames, stats };
    }
}
