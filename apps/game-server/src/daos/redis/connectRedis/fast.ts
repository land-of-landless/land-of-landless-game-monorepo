import { createClient } from "redis";
import { appConfig, isTest } from "@/config/environment";
import { dbLogger } from "@/utils/logger";

const redisFastClient = createClient({
    username: appConfig.redis.fastInstance.user,
    password: appConfig.redis.fastInstance.pass,
    socket: {
        host: appConfig.redis.fastInstance.host,
        port: appConfig.redis.fastInstance.port,
        reconnectStrategy: (retries) => Math.min(retries * 50, 300),
    },
    disableOfflineQueue: true, // IMPORTANT for rate limiting
});

async function connectFastRedisInstance() {
    await redisFastClient.connect();
}

redisFastClient.on("error", (err) =>
    dbLogger.error("RedisFast error", { err }),
);

async function flushAllRedisFastDB() {
    // if env is not test pass
    if (!isTest()) {
        return;
    }

    if (!redisFastClient.isOpen) {
        await connectFastRedisInstance();
    }

    await redisFastClient.flushAll();
}

export async function connectRedisFast() {
    if (!redisFastClient.isOpen) {
        await redisFastClient.connect();
    }
}

export { redisFastClient, connectFastRedisInstance, flushAllRedisFastDB };
