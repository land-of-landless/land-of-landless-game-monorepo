import { createClient, RedisClientType } from "redis";
import { dbLogger } from "../../../utils/logger";
import { appConfig, isTest } from "@/config/environment";

const redisLogicalClient: RedisClientType = createClient({
    username: appConfig.redis.mainLogicInstance.user,
    password: appConfig.redis.mainLogicInstance.pass,
    socket: {
        host: appConfig.redis.mainLogicInstance.host,
        port: appConfig.redis.mainLogicInstance.port,
    },
});

async function connectLogicalRedisInstance() {
    await redisLogicalClient.connect();
}

redisLogicalClient.on("error", (err) =>
    dbLogger.error("Redis Client Error", {
        error: err instanceof Error ? err.message : err,
    }),
);

async function flushAllRedisLogicalDB() {
    // if env is not test pass
    if (!isTest()) {
        return;
    }

    if (!redisLogicalClient.isOpen) {
        await connectLogicalRedisInstance();
    }

    await redisLogicalClient.flushAll();
}

export {
    redisLogicalClient,
    connectLogicalRedisInstance,
    flushAllRedisLogicalDB,
};
