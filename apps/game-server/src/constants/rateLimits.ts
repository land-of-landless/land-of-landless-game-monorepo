export const RATE_LIMITS_CONFIG = {
    GLOBAL: {
        windowMs: 1000 * 10, // 10 seconds
        max: 100,
    },
    MAIN_PROFILE: {
        USER_PREFERENCES: {
            windowMs: 1000 * 60 * 60, // 1 hour
            max: 1,
        },
        REFERRAL_AND_DAILY_REWARD: {
            windowMs: 1000 * 60 * 60 * 6, // 6 hours
            max: 20,
        },
    },
};
