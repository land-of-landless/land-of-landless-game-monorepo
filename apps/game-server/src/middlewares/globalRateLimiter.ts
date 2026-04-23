import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";
import {
    appConfig,
    isDevelopment,
    isProduction,
    isTest,
} from "@/config/environment.js";

import logger from "@/utils/logger.js";
import { ApiResponse } from "@/api/v1/utils/response.js";
import { checkRateLimit, globalRateLimit } from "@/utils/customRateLimiters.js";
import _ from "lodash";

const paymentCallbackAllowList: string[] =
    appConfig.allowedIpsForPaymentCallback;

// Middleware function to replace express-rate-limit
const limiter = async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for tests
    if (isTest()) {
        return next();
    }

    // Skip rate limiting for trusted payment provider IPs
    if (req.clientIp && paymentCallbackAllowList.includes(req.clientIp)) {
        return next();
    }

    // Skip rate limiting for auth routes
    if (req.path.startsWith("/auth") || req.path.startsWith("auth")) {
        return next();
    }

    // Skip if no IP available
    if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
        return next();
    }

    try {
        // Consume a point for the IP
        await checkRateLimit(globalRateLimit, req.auth.userId);
        next();
    } catch (rejRes) {
        // Rate limit exceeded
        logger.warn("Rate limit exceeded", {
            ip: req.ip,
            path: req.path,
        });

        return ApiResponse.error(
            res,
            429,
            "RATE_LIMIT_EXCEEDED",
            "Too many requests, please try again later.",
        );
    }
};

export default limiter;
