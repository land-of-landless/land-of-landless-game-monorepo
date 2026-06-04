// generate a redis-om repository for userSchema and export it
import { Repository } from "redis-om";
import { redisLogicalClient } from "@/daos/redis/connectRedis/index";
import billingSchema from "@/models/redis/billing";
import mainProfileSchema from "@/models/redis/mainProfile";
import miniGamesSchema from "@/models/redis/miniGames";
import energyGeneratorSchema from "@/models/redis/energyGenerator";
import mineSchema from "@/models/redis/mine";
import factorySchema from "@/models/redis/factory";
import labSchema from "@/models/redis/lab";
import launchSiteSchema from "@/models/redis/launchSite";
import statsSchema from "@/models/redis/stats";

export const billingRepository = new Repository(
    billingSchema,
    redisLogicalClient,
);
export const mainProfileRepository = new Repository(
    mainProfileSchema,
    redisLogicalClient,
);
export const miniGamesRepository = new Repository(
    miniGamesSchema,
    redisLogicalClient,
);
export const energyGeneratorRepository = new Repository(
    energyGeneratorSchema,
    redisLogicalClient,
);
export const mineRepository = new Repository(mineSchema, redisLogicalClient);
export const factoryRepository = new Repository(
    factorySchema,
    redisLogicalClient,
);
export const labRepository = new Repository(labSchema, redisLogicalClient);
export const launchSiteRepository = new Repository(
    launchSiteSchema,
    redisLogicalClient,
);
export const statsRepository = new Repository(statsSchema, redisLogicalClient);

export const createRedisIndexes = async () => {
    try {
        if (!redisLogicalClient.isOpen) {
            await redisLogicalClient.connect();
        }
        await mainProfileRepository.createIndex();
        await billingRepository.createIndex();
        await miniGamesRepository.createIndex();
        await energyGeneratorRepository.createIndex();
        await mineRepository.createIndex();
        await factoryRepository.createIndex();
        await labRepository.createIndex();
        await launchSiteRepository.createIndex();
        await statsRepository.createIndex();
    } catch (error) {
        throw error;
    }
};
