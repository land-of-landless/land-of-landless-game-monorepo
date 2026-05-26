/**
 * Centralized environment configuration and validation
 * This module provides type-safe access to environment variables
 * and validates required configuration on startup
 */

import { RATE_LIMITS_CONFIG } from "@/constants/index.js";

export interface AppConfig {
    nodeEnv: string;
    port: number;
    redis: {
        mainLogicInstance: {
            url: string;
            user?: string;
            pass?: string;
            host?: string;
            port: number;
        };
        fastInstance: {
            url: string;
            user?: string;
            pass?: string;
            host?: string;
            port: number;
        };
    };
    oxapay: {
        baseUrl: string;
        merchantApiKey: string;
        callbackUrl: string;
        returnUrl: string;
        defaultCurrency: string;
        sandbox: boolean;
    };
    cors: {
        origin: string;
    };
    rateLimit: {
        global: {
            windowMs: number;
            max: number;
        };
        mainProfile: {
            userPreferences: {
                windowMs: number;
                max: number;
            };
            refAndDailyReward: {
                windowMs: number;
                max: number;
            };
        };
        billing: {
            invoiceFetch: {
                windowMs: number;
                max: number;
            };
            purchase: {
                windowMs: number;
                max: number;
            };
        };
    };
    logging: {
        level: string;
    };
    auth: {
        secret?: string;
    };
    hiveApiKey?: string;
    hiveAccessKey?: string;
    sightengineApiUser?: string;
    sightengineApiSecret?: string;
    google: {
        clientId: string;
        clientSecret: string;
    };
    hosts: {
        local: string;
        remote: string;
    };
    allowedIpsForPaymentCallback: string[];
    proxyCount: number;
    llm: {
        baseUrl: string;
        apiKey: string;
        model: string;
        cacheTtlSeconds: number;
    };
    // mongodb: {
    //     uri?: string;
    // };
}

export const appConfig: AppConfig = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "2567", 10),
    redis: {
        mainLogicInstance: {
            url: process.env.REDIS_MAIN_LOGICAL_URL || "redis://localhost:6379",
            user: process.env.REDIS_MAIN_LOGICAL_DB_USER,
            pass: process.env.REDIS_MAIN_LOGICAL_DB_PASS,
            host: process.env.REDIS_MAIN_LOGICAL_DB_HOST,
            port: parseInt(
                process.env.REDIS_MAIN_LOGICAL_DB_PORT || "6379",
                10,
            ),
        },
        fastInstance: {
            url: process.env.REDIS_FAST_URL || "redis://localhost:6379",
            user: process.env.REDIS_FAST_DB_USER,
            pass: process.env.REDIS_FAST_DB_PASS,
            host: process.env.REDIS_FAST_DB_HOST,
            port: parseInt(process.env.REDIS_FAST_DB_PORT || "6379", 10),
        },
    },
    oxapay: {
        baseUrl: process.env.OXAPAY_BASE_URL || "https://api.oxapay.com",
        merchantApiKey: process.env.OXAPAY_MERCHANT_API_KEY || "",
        callbackUrl: process.env.OXAPAY_CALLBACK_URL || "",
        returnUrl: process.env.OXAPAY_RETURN_URL || "",
        defaultCurrency: process.env.OXAPAY_DEFAULT_CURRENCY || "USD",
        sandbox: process.env.OXAPAY_SANDBOX === "true",
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
    },
    rateLimit: {
        global: {
            windowMs: RATE_LIMITS_CONFIG.mainProfile.userPreferences.windowMs,
            max: RATE_LIMITS_CONFIG.mainProfile.userPreferences.max,
        },
        mainProfile: {
            userPreferences: {
                windowMs:
                    RATE_LIMITS_CONFIG.mainProfile.userPreferences.windowMs,
                max: RATE_LIMITS_CONFIG.mainProfile.userPreferences.max,
            },
            refAndDailyReward: {
                windowMs:
                    RATE_LIMITS_CONFIG.mainProfile.referralAndDailyReward
                        .windowMs,
                max: RATE_LIMITS_CONFIG.mainProfile.referralAndDailyReward
                    .max,
            },
        },
        billing: {
            purchase: {
                windowMs: 60 * 1000,
                max: 2,
            },
            invoiceFetch: {
                windowMs: 60 * 1000,
                max: 4,
            },
        },
    },
    logging: {
        level: process.env.LOG_LEVEL || "info",
    },
    auth: {
        secret: process.env.AUTH_SECRET,
    },
    hiveApiKey: process.env.HIVE_API_KEY,
    hiveAccessKey: process.env.HIVE_ACCESS_KEY,
    sightengineApiUser: process.env.SIGHT_ENGINE_API_USER,
    sightengineApiSecret: process.env.SIGHT_ENGINE_API_SECRET,
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    hosts: {
        local: process.env.LOCAL_HOST_ADDRESS || "http://localhost:2567",
        remote: process.env.REMOTE_HOST_ADDRESS || "",
    },
    allowedIpsForPaymentCallback: (
        process.env.ALLOWED_IPS_FOR_PAYMENT_CALLBACK || ""
    )
        .split(",")
        .filter((ip) => ip.trim() !== ""),
    proxyCount: parseInt(process.env.PROXY_COUNT || "0", 10),
    llm: {
        baseUrl: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
        apiKey: process.env.LLM_API_KEY || "",
        model: process.env.LLM_MODEL || "gpt-4o-mini",
        cacheTtlSeconds: parseInt(
            process.env.LLM_CACHE_TTL_SECONDS || "3600",
            10,
        ),
    },
    // mongodb: {
    //     uri: process.env.MONGODB_URI,
    // },
};

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnvironment(): void {
    const required = [
        "HIVE_API_KEY",
        "HIVE_ACCESS_KEY", // Make explicit requirement as per user
        "SIGHT_ENGINE_API_USER",
        "SIGHT_ENGINE_API_SECRET",
    ];

    // Add Redis URL requirement for production

    if (appConfig.nodeEnv === "production") {
        required.push(
            "OXAPAY_MERCHANT_API_KEY",
            "OXAPAY_CALLBACK_URL",
            "REDIS_DB_HOST",
            "REDIS_DB_USER",
            "REDIS_DB_PASS",
            "REDIS_DB_PORT",
        );
    }

    if (
        isDevelopment() &&
        (!process.env.OXAPAY_MERCHANT_API_KEY ||
            !process.env.OXAPAY_CALLBACK_URL)
    ) {
        console.warn(
            "⚠️  OXAPAY_MERCHANT_API_KEY and/or OXAPAY_CALLBACK_URL are not set — money purchases will fail until configured.",
        );
    }

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}\n` +
                "Please check your .env file or environment configuration.",
        );
    }

    // Validate port number
    if (isNaN(appConfig.port) || appConfig.port < 1 || appConfig.port > 65535) {
        throw new Error(
            `Invalid port number: ${process.env.PORT}. Must be between 1 and 65535.`,
        );
    }

    console.log("✅ Environment configuration validated successfully");
}

/**
 * Returns true if the application is running in development mode
 */
export const isDevelopment = (): boolean => appConfig.nodeEnv === "development";

/**
 * Returns true if the application is running in production mode
 */
export const isProduction = (): boolean => appConfig.nodeEnv === "production";

/**
 * Returns true if the application is running in test mode
 */
export const isTest = (): boolean => appConfig.nodeEnv === "test";
