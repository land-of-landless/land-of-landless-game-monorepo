import ProfileService from "@/services/mainProfile/ProfileService";
import { ERRORS, AppError } from "@/common/errors/appError";
import {
    DAILY_REWARD_COOLDOWN_HOURS,
    DAILY_CLAIM_REWARDS,
    DAILY_REWARD_MAX_CONSECUTIVE_HOURS,
    DailyRewardsClaimKey,
    DAILY_REWARD_RESET_CYCLE_DAYS,
} from "@/constants/mainProfile";
import logger from "@/utils/logger";

export default class DailyRewardService {
    /**
     * Allows a user to claim their daily reward if the cooldown period has passed.
     * @param userId - The ID of the user claiming the reward.
     * @returns An object containing the claimed coins and gems.
     */
    static async claimDailyReward(userId: string): Promise<{
        coins: number;
        gems: number;
        newLastDailyRewardClaimedAt: string;
    }> {
        try {
            const userProfile = await ProfileService.getProfile(userId);
            const now = new Date();
            const lastClaimStr = userProfile.lastDailyRewardClaimedAt;

            // 1. Determine the next counter value
            let nextCounter = 1;

            if (lastClaimStr !== "") {
                const lastClaimedDate = new Date(lastClaimStr);
                const hoursSinceLastClaim = Math.floor(
                    (now.getTime() - lastClaimedDate.getTime()) /
                        (1000 * 60 * 60)
                );

                // Validation: Is it too early?
                if (hoursSinceLastClaim < DAILY_REWARD_COOLDOWN_HOURS) {
                    throw ERRORS.VALIDATION(
                        "Daily reward is not available yet."
                    );
                }

                // Logic: Increment if within the streak window and cycle isn't finished
                const isWithinStreak =
                    hoursSinceLastClaim < DAILY_REWARD_MAX_CONSECUTIVE_HOURS;
                const isCycleFinished =
                    userProfile.dailyRewardClaimCounter >=
                    DAILY_REWARD_RESET_CYCLE_DAYS;

                if (isWithinStreak && !isCycleFinished) {
                    nextCounter = userProfile.dailyRewardClaimCounter + 1;
                }
            }

            userProfile.dailyRewardClaimCounter = nextCounter;

            // 2. Resolve Rewards
            const dayKey =
                `day${userProfile.dailyRewardClaimCounter}` as DailyRewardsClaimKey;
            const rewardConfig = DAILY_CLAIM_REWARDS[dayKey];

            if (!rewardConfig) {
                throw ERRORS.VALIDATION(
                    `Reward configuration missing for ${dayKey}`
                );
            }

            // 3. Apply changes
            userProfile.coins += rewardConfig.coins;
            userProfile.gems += rewardConfig.gems;
            userProfile.lastDailyRewardClaimedAt = now.toUTCString();

            await ProfileService.saveProfile(userProfile);

            return {
                coins: rewardConfig.coins,
                gems: rewardConfig.gems,
                newLastDailyRewardClaimedAt:
                    userProfile.lastDailyRewardClaimedAt,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;

            logger.error(
                `[DailyRewardService.claimDailyReward] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to claim daily reward: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }
}
