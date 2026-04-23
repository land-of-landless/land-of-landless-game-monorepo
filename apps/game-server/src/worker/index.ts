import { connectLogicalRedisInstance } from "@/daos/redis/connectRedis/index.js";
import MainProfileDAO from "@/daos/redis/mainProfile.js";
import logger from "@/utils/logger.js";

/**
 * Background worker for handling time-based profile updates
 * This ensures all user profiles stay updated even when users aren't actively playing
 */
const runWorker = async () => {
    logger.info("Profile Update Worker started.");

    try {
        // Connect to the database
        await connectLogicalRedisInstance();
        logger.info("Worker connected to Redis.");

        // Define the profile update task
        const performProfileUpdates = async () => {
            logger.info("Worker is running profile update task...");
            const startTime = Date.now();

            try {
                // Get all user IDs (this would need to be implemented in MainProfileDAO)
                // For now, we'll implement a placeholder
                logger.info(
                    "Profile update task: checking for users needing updates",
                );

                // TODO: Implement batch profile updates
                // This would typically:
                // 1. Get all user IDs
                // 2. Filter users who haven't been updated recently
                // 3. Update profiles in batches to avoid overwhelming Redis

                logger.info("Profile update task completed.");
            } catch (error) {
                logger.error(
                    "An error occurred during the profile update task:",
                    {
                        error: error instanceof Error ? error.message : error,
                    },
                );
            }

            const duration = Date.now() - startTime;
            logger.info(`Profile update task took ${duration}ms`);
        };

        // Run the task immediately on start, and then every 5 minutes
        await performProfileUpdates();
        setInterval(performProfileUpdates, 5 * 60 * 1000); // 5 minutes

        logger.info("Profile Update Worker initialized successfully");
    } catch (error) {
        logger.error("Worker failed to start or connect to the database:", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        process.exit(1); // Exit if DB connection fails
    }
};

// Graceful shutdown handling
process.on("SIGTERM", () => {
    logger.info(
        "Profile Update Worker received SIGTERM, shutting down gracefully",
    );
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info(
        "Profile Update Worker received SIGINT, shutting down gracefully",
    );
    process.exit(0);
});

runWorker();
