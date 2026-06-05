import ProfileService from "@/services/mainProfile/ProfileService.js";
import { ERRORS, AppError } from "@/common/errors/appError.js";
import {
    DAILY_REWARD_COOLDOWN_HOURS,
    DAILY_CLAIM_REWARDS,
    DAILY_REWARD_MAX_CONSECUTIVE_HOURS,
    DailyRewardsClaimKey,
    DAILY_REWARD_RESET_CYCLE_DAYS,
} from "@/constants/mainProfile.js";
import logger from "@/utils/logger.js";
import MainProfileDAO from "@/daos/mainProfile.js";

/**
 * Service for daily reward operations.
 * Profile is read via ProfileService, saved via postgres MainProfileDAO.
 */
export default class DailyRewardService {
    static async claimDailyReward(userId: string): Promise<{
        coins: number;
        gems: number;
        newLastDailyRewardClaimedAt: string;
    }> {
        try {
            const userProfile = await ProfileService.getProfile(userId);
            const now = new Date();
            const lastClaimStr = userProfile.lastDailyRewardClaimedAt;

            let nextCounter = 1;

            if (lastClaimStr !== "") {
                const lastClaimedDate = new Date(lastClaimStr);
                const hoursSinceLastClaim = Math.floor(
                    (now.getTime() - lastClaimedDate.getTime()) / (1000 * 60 * 60),
                );

                if (hoursSinceLastClaim < DAILY_REWARD_COOLDOWN_HOURS) {
                    throw ERRORS.VALIDATION("Daily reward is not available yet.");
                }

                const isWithinStreak = hoursSinceLastClaim < DAILY_REWARD_MAX_CONSECUTIVE_HOURS;
                const isCycleFinished = userProfile.dailyRewardClaimCounter >= DAILY_REWARD_RESET_CYCLE_DAYS;

                if (isWithinStreak && !isCycleFinished) {
                    nextCounter = userProfile.dailyRewardClaimCounter + 1;
                }
            }

            userProfile.dailyRewardClaimCounter = nextCounter;

            const dayKey = `day${userProfile.dailyRewardClaimCounter}` as DailyRewardsClaimKey;
            const rewardConfig = DAILY_CLAIM_REWARDS[dayKey];

            if (!rewardConfig) {
                throw ERRORS.VALIDATION(`Reward configuration missing for ${dayKey}`);
            }

            userProfile.coins += rewardConfig.coins;
            userProfile.gems += rewardConfig.gems;
            userProfile.lastDailyRewardClaimedAt = now.toISOString();

            await MainProfileDAO.saveProfile(userProfile);

            return {
                coins: rewardConfig.coins,
                gems: rewardConfig.gems,
                newLastDailyRewardClaimedAt: userProfile.lastDailyRewardClaimedAt,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error(`[DailyRewardService.claimDailyReward] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to claim daily reward: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
