import {
    RateLimiterRedis,
    RateLimiterMemory,
    RateLimiterRes,
} from "rate-limiter-flexible";
import { appConfig, isTest } from "@/config/environment.js";
import { redisFastClient } from "@/daos/redis/connectRedis/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import { convertMsToStringTime } from "./time.ts";
import { logger } from "colyseus";

export const checkRateLimit = async (
    limiter: RateLimiterRedis | RateLimiterMemory,
    key: string | number,
) => {
    try {
        await limiter.consume(key);
    } catch (err) {
        if (err instanceof RateLimiterRes) {
            throw ERRORS.RATE_LIMIT(
                `too many requests: retry after ${convertMsToStringTime(err.msBeforeNext)}`,
            );
        }

        // allow it because it has sth to do with possibly redis not the actual logic
        logger.error("Error in RateLimitRedis, possibly a redis error!", err);
    }
};

// global rate limiter with redis Store
export const globalRateLimit = new RateLimiterRedis({
    storeClient: redisFastClient,
    keyPrefix: "rate:global",
    points: appConfig.rateLimit.global.max, // Number of requests
    duration: appConfig.rateLimit.global.windowMs / 1000, // Per windowMs seconds
    insuranceLimiter: undefined, // do NOT enable fallback for games
});

// user preferences rate limiter with redis Store
export const userPreferencesRateLimit = new RateLimiterRedis({
    storeClient: redisFastClient,
    keyPrefix: "rate:main_profile:preferences",
    points: appConfig.rateLimit.mainProfile.userPreferences.max, // Number of requests
    duration: appConfig.rateLimit.mainProfile.userPreferences.windowMs / 1000, // Per windowMs seconds
    insuranceLimiter: undefined, // do NOT enable fallback for games
});

// user preferences rate limiter with redis Store
export const referralAndDailyRewardRateLimit = new RateLimiterRedis({
    storeClient: redisFastClient,
    keyPrefix: "rate:main_profile:ref_and_daily_reward",
    points: appConfig.rateLimit.mainProfile.refAndDailyReward.max, // Number of requests
    duration: appConfig.rateLimit.mainProfile.refAndDailyReward.windowMs / 1000, // Per windowMs seconds
    insuranceLimiter: undefined, // do NOT enable fallback for games
});

// billing purchase rate limiter
export const billingPurchaseRateLimit = new RateLimiterRedis({
    storeClient: redisFastClient,
    keyPrefix: "rate:billing:purchase",
    points: appConfig.rateLimit.billing.purchase.max, // Number of requests
    duration: appConfig.rateLimit.billing.purchase.windowMs / 1000, // Per windowMs seconds
    insuranceLimiter: undefined, // do NOT enable fallback for games
});

// billing invoice fetch rate limiter
export const billingInvoiceFetchRateLimit = new RateLimiterRedis({
    storeClient: redisFastClient,
    keyPrefix: "rate:billing:fetch_invoice",
    points: appConfig.rateLimit.billing.invoiceFetch.max, // Number of requests
    duration: appConfig.rateLimit.billing.invoiceFetch.windowMs / 1000, // Per windowMs seconds
    insuranceLimiter: undefined, // do NOT enable fallback for games
});
