export const RATE_LIMITS_CONFIG = {
    global: {
        windowMs: 1000 * 10, // 10 seconds
        max: 100,
    },
    mainProfile: {
        userPreferences: {
            windowMs: 1000 * 60 * 60, // 1 hour
            max: 1,
        },
        referralAndDailyReward: {
            windowMs: 1000 * 60 * 60 * 6, // 6 hours
            max: 20,
        },
    },
};
